import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.userId },
    });

    const landingConfig = (userSettings?.landingConfig as any) || {};
    const chatMessages = landingConfig.chatMessages || [];

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "user",
      senderName: session.name,
      text: message.trim(),
      createdAt: new Date().toISOString(),
    };

    chatMessages.push(newMsg);

    await prisma.userSettings.update({
      where: { userId: session.userId },
      data: {
        landingConfig: {
          ...landingConfig,
          chatMessages,
        },
      },
    });

    // Notifica os admins no sininho sobre a solicitação de alteração
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "REMINDER",
          title: `Solicitação de Alteração no Site de ${session.name}`,
          message: message.trim(),
          link: "/admin",
        },
      });
    }

    return NextResponse.json({ success: true, chatMessages });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao enviar mensagem no chat" }, { status: 500 });
  }
}
