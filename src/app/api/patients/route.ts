import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validators";
import { AppointmentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const patients = await prisma.patient.findMany({
    where: {
      userId: session.userId,
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { cpf: { contains: search.replace(/\D/g, "") } },
            { phone: { contains: search } },
          ]
        : undefined,
    },
    include: {
      appointments: {
        orderBy: { date: "desc" },
        take: 1,
      },
      _count: { select: { appointments: true } },
    },
    orderBy: { name: "asc" },
  });

  const enriched = await Promise.all(
    patients.map(async (p) => {
      const [nextAppointment, totalSpent, completedCount] = await Promise.all([
        prisma.appointment.findFirst({
          where: {
            patientId: p.id,
            date: { gte: new Date() },
            status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          },
          orderBy: { date: "asc" },
        }),
        prisma.appointment.aggregate({
          where: { patientId: p.id, status: AppointmentStatus.COMPLETED },
          _sum: { price: true },
        }),
        prisma.appointment.count({
          where: { patientId: p.id, status: AppointmentStatus.COMPLETED },
        }),
      ]);

      return {
        ...p,
        lastAppointment: p.appointments[0] || null,
        nextAppointment,
        totalSpent: totalSpent._sum.price ?? 0,
        completedCount,
      };
    })
  );

  return NextResponse.json({ patients: enriched });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const cpf = data.cpf.replace(/\D/g, "");

  const existing = await prisma.patient.findUnique({
    where: { userId_cpf: { userId: session.userId, cpf } },
  });
  if (existing) {
    return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });
  }

  const patient = await prisma.patient.create({
    data: {
      userId: session.userId,
      name: data.name,
      cpf,
      phone: data.phone,
      email: data.email,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      gender: data.gender,
      notes: data.notes,
    },
  });

  return NextResponse.json({ patient });
}
