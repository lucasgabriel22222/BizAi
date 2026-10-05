import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseCustomDomain } from "@/lib/features";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/auth-security";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const domain = await prisma.customDomain.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json({ domain });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { subscription: true },
    });

    // Validar se possui permissão (Plano Max)
    const activeSub = user?.subscription ? { plan: user.subscription.plan, status: user.subscription.status } : undefined;
    if (!canUseCustomDomain(activeSub)) {
      return NextResponse.json(
        { error: "Disponível apenas no plano Max." },
        { status: 403 }
      );
    }

    const { domain } = await request.json();
    if (!domain || !domain.includes(".")) {
      return NextResponse.json({ error: "Domínio inválido" }, { status: 400 });
    }

    // Criar ou atualizar domínio personalizado
    const customDomain = await prisma.customDomain.upsert({
      where: { userId: session.userId },
      update: {
        domain: domain.trim().toLowerCase(),
        status: "active", // Simula validação de DNS ativa de forma transparente
      },
      create: {
        userId: session.userId,
        domain: domain.trim().toLowerCase(),
        status: "active",
      },
    });

    // Auditoria
    const ip = getClientIp(request.headers);
    await logAudit({
      userId: session.userId,
      action: "configure_custom_domain",
      ipAddress: ip,
      details: { domain: customDomain.domain },
    });

    return NextResponse.json({ success: true, customDomain });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
