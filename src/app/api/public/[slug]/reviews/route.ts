import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators";
import { moderateReviewComment, maskAuthorName } from "@/lib/moderation";
import { AppointmentStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const parsed = reviewSchema.safeParse({ ...body, slug });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const cpf = data.cpf.replace(/\D/g, "");

  const user = await prisma.user.findUnique({ where: { slug } });
  if (!user) {
    return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  }

  const moderation = moderateReviewComment(data.comment);
  if (!moderation.allowed) {
    return NextResponse.json({ error: moderation.reason }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId_cpf: { userId: user.id, cpf } },
  });

  if (!patient || patient.email.toLowerCase() !== data.email.toLowerCase()) {
    return NextResponse.json(
      {
        error:
          "Só pacientes que já realizaram consulta podem deixar feedback. Use o mesmo CPF e email do cadastro.",
      },
      { status: 403 }
    );
  }

  const completed = await prisma.appointment.findFirst({
    where: {
      userId: user.id,
      patientId: patient.id,
      status: AppointmentStatus.COMPLETED,
    },
  });

  if (!completed) {
    return NextResponse.json(
      {
        error:
          "Você só pode avaliar após ter pelo menos uma consulta concluída com este profissional.",
      },
      { status: 403 }
    );
  }

  const existing = await prisma.patientReview.findUnique({
    where: { userId_authorCpf: { userId: user.id, authorCpf: cpf } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Você já enviou um feedback. Cada paciente pode avaliar apenas uma vez." },
      { status: 409 }
    );
  }

  const review = await prisma.patientReview.create({
    data: {
      userId: user.id,
      patientId: patient.id,
      authorName: maskAuthorName(data.name),
      authorEmail: data.email.toLowerCase(),
      authorCpf: cpf,
      rating: data.rating,
      comment: data.comment.trim(),
      status: "APPROVED",
    },
  });

  return NextResponse.json({
    success: true,
    review: {
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    },
  });
}
