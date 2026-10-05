import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { ownerId: true },
    });
    const targetUserId = user?.ownerId || session.userId;

    let settings = await prisma.automationSettings.findUnique({
      where: { userId: targetUserId },
    });

    if (!settings) {
      settings = await prisma.automationSettings.create({
        data: {
          userId: targetUserId,
          confirmationEnabled: true,
          reminderEnabled: true,
          reminder24h: true,
          reminder12h: false,
          reminder1h: false,
          feedbackEnabled: true,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Herdar plano do chefe se for subusuário
    let plan = "Starter";
    let status = "trial";

    if (user.ownerId) {
      const ownerSub = await prisma.subscription.findUnique({
        where: { userId: user.ownerId },
      });
      if (ownerSub) {
        plan = ownerSub.plan;
        status = ownerSub.status;
      }
    } else if (user.subscription) {
      plan = user.subscription.plan;
      status = user.subscription.status;
    }

    // Apenas planos Advanced e Max podem usar automações
    if (plan === "Starter" || status === "expired" || status === "cancelled") {
      return NextResponse.json(
        { error: "Recurso exclusivo do plano Advanced ou superior." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      confirmationEnabled,
      reminderEnabled,
      reminder24h,
      reminder12h,
      reminder1h,
      feedbackEnabled,
    } = body;

    const targetUserId = user.ownerId || session.userId;

    const settings = await prisma.automationSettings.upsert({
      where: { userId: targetUserId },
      update: {
        confirmationEnabled,
        reminderEnabled,
        reminder24h,
        reminder12h,
        reminder1h,
        feedbackEnabled,
      },
      create: {
        userId: targetUserId,
        confirmationEnabled,
        reminderEnabled,
        reminder24h,
        reminder12h,
        reminder1h,
        feedbackEnabled,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
