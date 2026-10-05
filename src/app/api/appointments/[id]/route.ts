import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  patientId: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const existing = await prisma.appointment.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });
  }

  const dateChanged = data.date && new Date(data.date).getTime() !== existing.date.getTime();
  const timeChanged = data.startTime && data.startTime !== existing.startTime;
  const isRescheduled = dateChanged || timeChanged;

  await prisma.appointment.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.patientId && { patientId: data.patientId }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.endTime && { endTime: data.endTime }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.reason !== undefined && { reason: data.reason }),
    },
  });

  // Disparar automações de e-mail assincronamente baseadas no evento
  const { ConsultationAutomationsService } = require("@/lib/automations-service");
  if (data.status === "COMPLETED") {
    ConsultationAutomationsService.triggerEvent("completed", id).catch(console.error);
  } else if (data.status === "CANCELLED") {
    ConsultationAutomationsService.triggerEvent("cancelled", id).catch(console.error);
  }

  if (data.status === "CANCELLED" || data.status === "COMPLETED") {
    await prisma.availabilitySlot.updateMany({
      where: {
        userId: session.userId,
        date: existing.date,
        startTime: existing.startTime,
      },
      data: { isBooked: false },
    });
  }

  if (data.status === "CANCELLED") {
    await prisma.notification.create({
      data: {
        userId: session.userId,
        type: "APPOINTMENT_CANCELLED",
        title: "Consulta cancelada",
        message: "Uma consulta foi cancelada",
        link: "/agenda",
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.appointment.findFirst({
    where: { id, userId: session.userId },
  });

  if (existing) {
    await prisma.availabilitySlot.updateMany({
      where: {
        userId: session.userId,
        date: existing.date,
        startTime: existing.startTime,
      },
      data: { isBooked: false },
    });
  }

  await prisma.appointment.deleteMany({ where: { id, userId: session.userId } });
  return NextResponse.json({ success: true });
}
