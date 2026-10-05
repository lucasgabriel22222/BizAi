import { AppointmentStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { eachDayOfInterval, endOfDay, startOfDay } from "date-fns";
import { periodDayCount, type PeriodRange } from "./period";

export async function getPeriodDashboardStats(userId: string, period: PeriodRange) {
  const { start, end } = period;
  const baseWhere = {
    userId,
    date: { gte: start, lte: end },
  };

  const [
    appointmentsCount,
    earningsAgg,
    totalPatients,
    recentAppointments,
    appointmentsInPeriod,
  ] = await Promise.all([
    prisma.appointment.count({ where: baseWhere }),
    prisma.appointment.aggregate({
      where: { ...baseWhere, status: AppointmentStatus.COMPLETED },
      _sum: { price: true },
    }),
    prisma.patient.count({ where: { userId } }),
    prisma.appointment.findMany({
      where: {
        userId,
        date: { gte: startOfDay(new Date()) },
        status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
      },
      include: { patient: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 6,
    }),
    prisma.appointment.findMany({
      where: baseWhere,
      select: { date: true, status: true, price: true },
    }),
  ]);

  const days = eachDayOfInterval({ start, end });
  const dayCount = periodDayCount(start, end);

  const chartData = days.map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const dayAppts = appointmentsInPeriod.filter((a) => {
      const d = new Date(a.date);
      return d >= dayStart && d <= dayEnd;
    });
    const earnings = dayAppts
      .filter((a) => a.status === AppointmentStatus.COMPLETED)
      .reduce((sum, a) => sum + a.price, 0);

    return {
      date: day.toISOString().split("T")[0],
      earnings,
      appointments: dayAppts.length,
    };
  });

  const completedInPeriod = appointmentsInPeriod.filter(
    (a) => a.status === AppointmentStatus.COMPLETED
  ).length;
  const totalRevenue = earningsAgg._sum.price ?? 0;
  const avgPerAppointment =
    completedInPeriod > 0 ? totalRevenue / completedInPeriod : 0;

  return {
    period: period.label,
    appointmentsCount,
    totalRevenue,
    avgPerAppointment,
    totalPatients,
    recentAppointments,
    chartData: chartData.slice(-dayCount),
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function getFinancialStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  const now = new Date();
  const start = startDate ?? startOfDay(now);
  const end = endDate ?? endOfDay(now);

  const stats = await getPeriodDashboardStats(userId, {
    preset: "custom",
    start,
    end,
    label: "Período",
  });

  const completed = await prisma.appointment.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
      status: AppointmentStatus.COMPLETED,
    },
    include: { patient: true },
  });

  const cancelledCount = await prisma.appointment.count({
    where: {
      userId,
      date: { gte: start, lte: end },
      status: AppointmentStatus.CANCELLED,
    },
  });

  const statusBreakdown = await prisma.appointment.groupBy({
    by: ["status"],
    where: { userId, date: { gte: start, lte: end } },
    _count: true,
  });

  return {
    totalRevenue: stats.totalRevenue,
    completedCount: completed.length,
    cancelledCount,
    totalAppointments: stats.appointmentsCount,
    avgPerAppointment: stats.avgPerAppointment,
    completed,
    dailyData: stats.chartData,
    statusBreakdown,
    start,
    end,
  };
}
