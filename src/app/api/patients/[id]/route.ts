import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.userId },
    include: {
      appointments: {
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        include: { patient: true },
      },
    },
  });

  if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  return NextResponse.json({ patient });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = patientSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const patient = await prisma.patient.updateMany({
    where: { id, userId: session.userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.cpf && { cpf: data.cpf.replace(/\D/g, "") }),
      ...(data.phone && { phone: data.phone }),
      ...(data.email && { email: data.email }),
      ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
      ...(data.gender && { gender: data.gender }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  return NextResponse.json({ success: patient.count > 0 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  await prisma.patient.deleteMany({ where: { id, userId: session.userId } });
  return NextResponse.json({ success: true });
}
