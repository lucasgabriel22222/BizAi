import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { parseDateOnly, normalizeTime } from "@/lib/period";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let dateFilter: { gte: Date; lte: Date } | undefined;
  if (date) {
    const d = new Date(date);
    dateFilter = { gte: startOfDay(d), lte: endOfDay(d) };
  } else if (start && end) {
    dateFilter = { gte: new Date(start), lte: new Date(end) };
  }

  const [slots, breaks, appointments] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where: { userId: session.userId, ...(dateFilter && { date: dateFilter }) },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.break.findMany({
      where: { userId: session.userId, ...(dateFilter && { date: dateFilter }) },
    }),
    prisma.appointment.findMany({
      where: { userId: session.userId, ...(dateFilter && { date: dateFilter }) },
      include: { patient: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return NextResponse.json({ slots, breaks, appointments });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const { date, startTime, endTime, type } = body;
  const parsedDate = typeof date === "string" && date.length === 10
    ? parseDateOnly(date)
    : startOfDay(new Date(date));

  if (type === "break") {
    const breakItem = await prisma.break.create({
      data: {
        userId: session.userId,
        date: parsedDate,
        startTime: normalizeTime(startTime),
        endTime: normalizeTime(endTime),
        reason: body.reason,
      },
    });
    return NextResponse.json({ break: breakItem });
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      userId: session.userId,
      date: parsedDate,
      startTime: normalizeTime(startTime),
      endTime: normalizeTime(endTime),
      isBooked: false,
    },
  });

  return NextResponse.json({ slot });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  if (type === "break") {
    await prisma.break.deleteMany({ where: { id, userId: session.userId } });
  } else {
    await prisma.availabilitySlot.deleteMany({ where: { id, userId: session.userId } });
  }

  return NextResponse.json({ success: true });
}
