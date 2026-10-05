import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { subdomain, htmlCode } = await req.json();

    const currentSettings = await prisma.userSettings.findUnique({
      where: { userId: session.userId },
    });

    const landingConfig = {
      ...((currentSettings?.landingConfig as any) || {}),
      pendingSubdomain: subdomain,
      pendingHtmlCode: htmlCode,
      siteStatus: "PENDENTE",
      createdAt: new Date().toISOString(),
      chatMessages: [
        {
          id: "msg-1",
          sender: "system",
          text: "Olá! O seu rascunho de site foi enviado para análise. Se desejar fazer qualquer alteração no site (textos, cores, fotos ou novos botões), escreva a mensagem abaixo!",
          createdAt: new Date().toISOString(),
        }
      ]
    };

    await prisma.userSettings.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        landingConfig,
      },
      update: {
        landingConfig,
      },
    });

    // Envia notificação aos administradores sobre o novo site pendente
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "UPCOMING",
          title: "Novo Site Pendente de Publicação! 🌐",
          message: `O usuário ${session.name} solicitou a publicação do site no subdomínio ${subdomain}.netlify.app`,
          link: "/admin",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar site pendente" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.userId },
    });

    const landingConfig = (userSettings?.landingConfig as any) || {};

    return NextResponse.json({
      subdomain: landingConfig.pendingSubdomain || landingConfig.publishedSubdomain || "",
      htmlCode: landingConfig.pendingHtmlCode || landingConfig.publishedHtmlCode || "",
      siteStatus: landingConfig.siteStatus || "NENHUM",
      publishedUrl: landingConfig.publishedUrl || "",
      chatMessages: landingConfig.chatMessages || [],
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar site do usuário" }, { status: 500 });
  }
}
