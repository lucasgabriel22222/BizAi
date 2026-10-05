import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validators";
import { AppointmentStatus } from "@prisma/client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const filter = searchParams.get("filter");
  const date = searchParams.get("date");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const now = new Date();
  let dateFilter: { gte?: Date; lte?: Date } | undefined;

  if (date) {
    const d = new Date(date);
    dateFilter = { gte: startOfDay(d), lte: endOfDay(d) };
  } else if (filter === "today") {
    dateFilter = { gte: startOfDay(now), lte: endOfDay(now) };
  } else if (filter === "week") {
    dateFilter = { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) };
  } else if (filter === "month") {
    dateFilter = { gte: startOfMonth(now), lte: endOfMonth(now) };
  } else if (start && end) {
    dateFilter = { gte: new Date(start), lte: new Date(end) };
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      userId: session.userId,
      ...(status && { status: status as AppointmentStatus }),
      ...(dateFilter && { date: dateFilter }),
    },
    include: { patient: true },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });

  return NextResponse.json({ appointments });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const appointment = await prisma.appointment.create({
    data: {
      userId: session.userId,
      patientId: data.patientId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      type: data.type,
      price: data.price,
      notes: data.notes,
      reason: data.reason,
    },
    include: { patient: true },
  });

  await prisma.notification.create({
    data: {
      userId: session.userId,
      type: "APPOINTMENT_BOOKED",
      title: "Nova consulta",
      message: `Consulta com ${appointment.patient.name} em ${data.date}`,
      link: "/agenda",
    },
  });

  // Disparar automações de e-mail assincronamente
  const { ConsultationAutomationsService } = await import("@/lib/automations-service");
  ConsultationAutomationsService.triggerEvent("created", appointment.id).catch(console.error);

  return NextResponse.json({ appointment });
}

