import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validators";
import { startOfDay, endOfDay } from "date-fns";
import { parseDateOnly, normalizeTime, toDateOnlyString } from "@/lib/period";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const user = await prisma.user.findUnique({
    where: { slug },
    include: { settings: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  }

  if (!dateParam) {
    return NextResponse.json({
      professional: {
        name: user.name,
        specialty: user.specialty,
        slug: user.slug,
        settings: user.settings,
      },
    });
  }

  const d = dateParam.includes("T")
    ? parseDateOnly(dateParam.split("T")[0])
    : parseDateOnly(dateParam);

  const [slots, appointments] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfDay(d), lte: endOfDay(d) },
        isBooked: false,
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfDay(d), lte: endOfDay(d) },
        status: { notIn: ["CANCELLED"] },
      },
      select: { startTime: true },
    }),
  ]);

  const bookedTimes = new Set(appointments.map((a) => normalizeTime(a.startTime)));
  const available = slots
    .filter((s) => !bookedTimes.has(normalizeTime(s.startTime)))
    .filter((s) => normalizeTime(s.startTime) >= "06:00")
    .map((s) => ({
      ...s,
      startTime: normalizeTime(s.startTime),
      endTime: normalizeTime(s.endTime),
    }));

  return NextResponse.json({
    professional: { name: user.name, specialty: user.specialty },
    slots: available,
    defaultPrice: user.settings?.defaultPrice ?? 200,
    defaultDuration: user.settings?.defaultDuration ?? 50,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { slug },
    include: { settings: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = bookingSchema.safeParse({ ...body, slug });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const cpf = data.cpf.replace(/\D/g, "");
  const appointmentDate = data.date.includes("T")
    ? parseDateOnly(data.date.split("T")[0])
    : parseDateOnly(data.date);
  const startTime = normalizeTime(data.startTime);

  let patient = await prisma.patient.findUnique({
    where: { userId_cpf: { userId: user.id, cpf } },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        userId: user.id,
        name: data.name,
        cpf,
        phone: data.phone,
        email: data.email,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        notes: data.notes,
      },
    });
  }

  const settings = user.settings;
  const duration = settings?.defaultDuration ?? 50;
  const price = settings?.defaultPrice ?? 200;

  const [startH, startM] = startTime.split(":").map(Number);
  const endMinutes = startH * 60 + startM + duration;
  const endTime = normalizeTime(
    `${Math.floor(endMinutes / 60)}:${endMinutes % 60}`
  );

  const appointment = await prisma.appointment.create({
    data: {
      userId: user.id,
      patientId: patient.id,
      date: appointmentDate,
      startTime,
      endTime,
      status: "CONFIRMED",
      type: "IN_PERSON",
      price,
      reason: data.reason,
      notes: data.notes,
    },
    include: { patient: true },
  });

  await prisma.availabilitySlot.updateMany({
    where: {
      userId: user.id,
      date: { gte: startOfDay(appointmentDate), lte: endOfDay(appointmentDate) },
      startTime,
    },
    data: { isBooked: true },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "APPOINTMENT_CONFIRMED",
      title: "Nova consulta confirmada",
      message: `${data.name} agendou para ${toDateOnlyString(appointmentDate)} às ${startTime}`,
      link: "/agenda",
    },
  });

  return NextResponse.json({ success: true, appointment });
}
