import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/auth-security";
import { EmailNotificationService } from "@/lib/emails";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { plan } = await request.json();
    if (!["Starter", "Advanced", "Max"].includes(plan)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const ip = getClientIp(request.headers);

    // Upsert subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.userId },
      update: {
        plan,
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Vencimento em 30 dias
      },
      create: {
        userId: session.userId,
        plan,
        status: "active",
        trialEndsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Registra log de auditoria
    await logAudit({
      userId: session.userId,
      action: "upgrade",
      ipAddress: ip,
      details: { plan, status: "active" },
    });

    // Enviar email de upgrade de forma assíncrona
    EmailNotificationService.sendUpgradeSuccessEmail(session.email, session.name, plan).catch(console.error);

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
