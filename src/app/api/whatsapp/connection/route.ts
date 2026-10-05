import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Se o usuário faz parte de uma equipe, ele herda a conexão do chefe
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { ownerId: true },
    });
    const targetUserId = user?.ownerId || session.userId;

    const connection = await prisma.whatsAppConnection.findUnique({
      where: { userId: targetUserId },
    });

    const settings = await prisma.userSettings.findUnique({
      where: { userId: targetUserId },
      select: { landingConfig: true },
    });

    const config = (settings?.landingConfig as any) || {};
    const whatsappSettings = config.whatsappSettings || {
      automations: {
        confirmation: true,
        reminder24h: true,
        reminder2h: false,
        reminder30m: true,
        cancellation: true,
        rescheduled: true,
      },
      templates: {
        confirmation: "Olá {paciente}, sua consulta com Dr(a). {psicologo} foi agendada com sucesso para o dia {data} às {hora}. Aguardamos você!",
        reminder24h: "Olá {paciente}, passando para lembrar da sua consulta amanhã, {data}, às {hora}. Caso precise reagendar, nos avise!",
        reminder2h: "Olá {paciente}, sua consulta com Dr(a). {psicologo} começa em 2 horas ({hora}). Até já!",
        reminder30m: "Olá {paciente}! Sua consulta começará em 30 minutos. Prepare-se, nos vemos em breve!",
        cancellation: "Olá {paciente}. Confirmamos o cancelamento da sua consulta que aconteceria em {data} às {hora}. Se desejar, agende outro horário.",
        rescheduled: "Olá {paciente}! Sua consulta com Dr(a). {psicologo} foi reagendada para o dia {data} às {hora}. Confirme se está de acordo.",
      }
    };

    return NextResponse.json({
      connected: connection?.status === "connected",
      phoneNumber: connection?.phoneNumber || "",
      status: connection?.status || "disconnected",
      automations: whatsappSettings.automations,
      templates: whatsappSettings.templates,
    });
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
      select: { ownerId: true },
    });
    
    // Apenas donos de clínica ou usuários independentes gerenciam a conexão
    if (user?.ownerId) {
      return NextResponse.json({ error: "Apenas o proprietário do consultório pode conectar o WhatsApp" }, { status: 403 });
    }

    const { phoneNumber, status } = await request.json();

    const connection = await prisma.whatsAppConnection.upsert({
      where: { userId: session.userId },
      update: {
        phoneNumber,
        status: status || "connected",
      },
      create: {
        userId: session.userId,
        phoneNumber,
        status: status || "connected",
      },
    });

    return NextResponse.json({ success: true, connection });
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
      select: { ownerId: true },
    });
    const targetUserId = user?.ownerId || session.userId;

    const { automations, templates } = await request.json();

    const settings = await prisma.userSettings.findUnique({
      where: { userId: targetUserId },
    });

    const currentConfig = (settings?.landingConfig as any) || {};
    const updatedConfig = {
      ...currentConfig,
      whatsappSettings: {
        automations,
        templates,
      },
    };

    await prisma.userSettings.upsert({
      where: { userId: targetUserId },
      update: {
        landingConfig: updatedConfig,
      },
      create: {
        userId: targetUserId,
        landingConfig: updatedConfig,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
