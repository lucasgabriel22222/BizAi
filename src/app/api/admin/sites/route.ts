import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (currentUser?.role !== "ADMIN" && currentUser?.email !== "anjoslucas962@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    // Busca todos os usuários com configurações de site
    const userSettings = await prisma.userSettings.findMany({
      include: {
        user: true,
      },
    });

    const sites = userSettings
      .filter((s) => s.landingConfig && (s.landingConfig as any).pendingSubdomain)
      .map((s) => {
        const config = (s.landingConfig as any) || {};
        return {
          userId: s.userId,
          userName: s.user.name,
          userEmail: s.user.email,
          subdomain: config.pendingSubdomain || config.publishedSubdomain || "",
          htmlCode: config.pendingHtmlCode || config.publishedHtmlCode || "",
          status: config.siteStatus || "PENDENTE", // PENDENTE, PUBLICADO, CANCELADO
          publishedUrl: config.publishedUrl || `https://${config.pendingSubdomain || "site"}.netlify.app`,
          chatMessages: config.chatMessages || [],
          createdAt: config.createdAt || s.user.createdAt,
        };
      });

    return NextResponse.json({ sites });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar sites gerenciados" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (currentUser?.role !== "ADMIN" && currentUser?.email !== "anjoslucas962@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const { userId, newStatus } = await request.json();

    if (!userId || !newStatus) {
      return NextResponse.json({ error: "ID e novo status são obrigatórios" }, { status: 400 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!userSettings) {
      return NextResponse.json({ error: "Configurações do usuário não encontradas" }, { status: 404 });
    }

    const landingConfig = (userSettings.landingConfig as any) || {};
    const publishedUrl = `https://${landingConfig.pendingSubdomain || "site"}.netlify.app`;

    await prisma.userSettings.update({
      where: { userId },
      data: {
        landingConfig: {
          ...landingConfig,
          siteStatus: newStatus,
          publishedUrl: newStatus === "PUBLICADO" ? publishedUrl : landingConfig.publishedUrl,
          publishedSubdomain: landingConfig.pendingSubdomain || landingConfig.publishedSubdomain,
          publishedHtmlCode: landingConfig.pendingHtmlCode || landingConfig.publishedHtmlCode,
        },
      },
    });

    // Se o status for alterado para PUBLICADO, notifica o usuário dono do site no sininho
    if (newStatus === "PUBLICADO") {
      await prisma.notification.create({
        data: {
          userId,
          type: "APPOINTMENT_CONFIRMED",
          title: "Seu Site foi Publicado com Sucesso! 🎉",
          message: `Parabéns! Seu site já está no ar no link ${publishedUrl}. Clique para visualizar!`,
          link: "/personalizacao",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Status do site atualizado para ${newStatus}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar status do site" }, { status: 500 });
  }
}
