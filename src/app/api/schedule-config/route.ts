import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateOnly, normalizeTime } from "@/lib/period";
import { startOfDay, endOfDay, eachDayOfInterval, startOfMonth, endOfMonth, addMonths } from "date-fns";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const p = prisma as any;
    if (!p.businessHours || !p.scheduleException) {
      return NextResponse.json({ businessHours: [], exceptions: [] });
    }

    const [businessHours, exceptions] = await Promise.all([
      p.businessHours.findMany({
        where: { userId: session.userId },
        orderBy: { dayOfWeek: "asc" },
      }),
      p.scheduleException.findMany({
        where: { userId: session.userId },
        orderBy: { date: "asc" },
      }),
    ]);

    return NextResponse.json({ businessHours, exceptions });
  } catch (error: any) {
    console.error("GET /api/schedule-config error:", error);
    return NextResponse.json({ businessHours: [], exceptions: [], error: error?.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const p = prisma as any;
    const body = await request.json();
    const { action } = body;

    if (action === "save_business_hours") {
      const { items, applyMonthDays, monthDays } = body;

      // 1. Salvar ou atualizar regras de funcionamento
      if (p.businessHours) {
        for (const item of items) {
          await p.businessHours.upsert({
            where: {
              userId_dayOfWeek: {
                userId: session.userId,
                dayOfWeek: Number(item.dayOfWeek),
              },
            },
            create: {
              userId: session.userId,
              dayOfWeek: Number(item.dayOfWeek),
              isOpen: Boolean(item.isOpen),
              startTime: item.startTime || "08:00",
              endTime: item.endTime || "18:00",
              breakStart: item.breakStart || null,
              breakEnd: item.breakEnd || null,
              slotDuration: Number(item.slotDuration || 50),
            },
            update: {
              isOpen: Boolean(item.isOpen),
              startTime: item.startTime || "08:00",
              endTime: item.endTime || "18:00",
              breakStart: item.breakStart || null,
              breakEnd: item.breakEnd || null,
              slotDuration: Number(item.slotDuration || 50),
            },
          });
        }
      }

      // 2. Determinar intervalo de datas para gerar os horários em lote
      let targetDates: Date[] = [];
      if (applyMonthDays && Array.isArray(monthDays) && monthDays.length > 0) {
        targetDates = monthDays.map((dStr: string) => parseDateOnly(dStr));
      } else {
        // Gera para o mês atual e o próximo mês (60 dias) para o futuro
        const now = new Date();
        targetDates = eachDayOfInterval({
          start: startOfMonth(now),
          end: endOfMonth(addMonths(now, 1)),
        });
      }

      // Gera todos os slots em lote super-rápido (bulk insert)
      await generateSlotsForDatesBatch(session.userId, targetDates, items);

      return NextResponse.json({ success: true });
    }

    if (action === "create_exception") {
      const { date, type, reason, startTime, endTime } = body;
      const parsedDate = parseDateOnly(date);

      let exception = null;
      if (p.scheduleException) {
        exception = await p.scheduleException.create({
          data: {
            userId: session.userId,
            date: parsedDate,
            type: type || "HOLIDAY",
            reason: reason || "Exceção de agenda",
            startTime: startTime ? normalizeTime(startTime) : null,
            endTime: endTime ? normalizeTime(endTime) : null,
          },
        });
      }

      if (type === "HOLIDAY" || type === "DAY_OFF") {
        await prisma.availabilitySlot.deleteMany({
          where: {
            userId: session.userId,
            date: { gte: startOfDay(parsedDate), lte: endOfDay(parsedDate) },
            isBooked: false,
          },
        });
      }

      return NextResponse.json({ exception, success: true });
    }

    if (action === "delete_exception") {
      const { id } = body;
      if (p.scheduleException) {
        await p.scheduleException.deleteMany({
          where: { id, userId: session.userId },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "reset_schedule") {
      // Deleta todos os slots de horário livres (que não foram agendados por pacientes)
      await prisma.availabilitySlot.deleteMany({
        where: {
          userId: session.userId,
          isBooked: false,
        },
      });

      // Deleta regras de horários configuradas
      if (p.businessHours) {
        await p.businessHours.deleteMany({
          where: { userId: session.userId },
        });
      }

      // Deleta exceções cadastradas
      if (p.scheduleException) {
        await p.scheduleException.deleteMany({
          where: { userId: session.userId },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/schedule-config error:", error);
    return NextResponse.json({ error: error?.message || "Erro interno do servidor" }, { status: 500 });
  }
}

async function generateSlotsForDatesBatch(userId: string, dates: Date[], items: any[]) {
  if (dates.length === 0) return;

  const firstDate = startOfDay(dates[0]);
  const lastDate = endOfDay(dates[dates.length - 1]);

  // 1. Limpa slots não agendados em todo o intervalo de uma só vez
  await prisma.availabilitySlot.deleteMany({
    where: {
      userId,
      date: { gte: firstDate, lte: lastDate },
      isBooked: false,
    },
  });

  const slotsToCreate: Array<{
    userId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isBooked: boolean;
  }> = [];

  // 2. Calcula os slots em memória para cada data
  for (const date of dates) {
    const dayOfWeek = date.getDay();
    const config = items.find((i: any) => Number(i.dayOfWeek) === dayOfWeek);
    if (!config || !config.isOpen) continue;

    const slotDuration = Number(config.slotDuration || 50);
    const [startH, startM] = config.startTime.split(":").map(Number);
    const [endH, endM] = config.endTime.split(":").map(Number);
    const totalStart = startH * 60 + startM;
    const totalEnd = endH * 60 + endM;

    let breakStartMinutes = -1;
    let breakEndMinutes = -1;
    if (config.breakStart && config.breakEnd && config.breakStart.includes(":")) {
      const [bsH, bsM] = config.breakStart.split(":").map(Number);
      const [beH, beM] = config.breakEnd.split(":").map(Number);
      breakStartMinutes = bsH * 60 + bsM;
      breakEndMinutes = beH * 60 + beM;
    }

    let current = totalStart;
    while (current + slotDuration <= totalEnd) {
      const slotEnd = current + slotDuration;

      const overlapsBreak =
        breakStartMinutes !== -1 &&
        current < breakEndMinutes &&
        slotEnd > breakStartMinutes;

      if (!overlapsBreak) {
        const sH = Math.floor(current / 60);
        const sM = current % 60;
        const eH = Math.floor(slotEnd / 60);
        const eM = slotEnd % 60;

        const startTimeStr = `${String(sH).padStart(2, "0")}:${String(sM).padStart(2, "0")}`;
        const endTimeStr = `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`;

        slotsToCreate.push({
          userId,
          date: startOfDay(date),
          startTime: startTimeStr,
          endTime: endTimeStr,
          isBooked: false,
        });
      }

      current += slotDuration;
    }
  }

  // 3. Insere todos os slots de uma vez só no banco (Ultra-rápido!)
  if (slotsToCreate.length > 0) {
    await prisma.availabilitySlot.createMany({
      data: slotsToCreate,
      skipDuplicates: true,
    });
  }
}
