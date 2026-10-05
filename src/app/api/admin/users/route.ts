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
      return NextResponse.json({ error: "Acesso proibido. Apenas administradores." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { ownerId: null },
      include: {
        subscription: true,
        _count: {
          select: {
            appointments: true,
            patients: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
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

    const { userId, plan, status, removePlan } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    if (removePlan) {
      // Remove o plano de verdade desativando/cancelando a assinatura no banco de dados
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: "Starter",
          status: "cancelled",
          trialEndsAt: new Date(0),
        },
        update: {
          plan: "Starter",
          status: "cancelled",
          expiresAt: new Date(0),
        },
      });

      return NextResponse.json({ success: true, message: "Plano removido e cancelado no banco de dados com sucesso." });
    }

    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSub) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          plan: plan || existingSub.plan,
          status: status || existingSub.status,
          expiresAt: status === "active" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : existingSub.expiresAt,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          plan: plan || "Starter",
          status: status || "active",
          trialEndsAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, message: "Plano do usuário atualizado no banco de dados." });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, email, userId } = body;

    if (action === "add_admin") {
      if (!email) return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) return NextResponse.json({ error: "Usuário não encontrado com esse e-mail." }, { status: 404 });

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { role: "ADMIN" },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "remove_admin") {
      if (!userId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

      await prisma.user.update({
        where: { id: userId },
        data: { role: "PSYCHOLOGIST" },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "reset_all_logins") {
      // 1. Apaga fisicamente TODOS os registros de auditLog e notificações do banco de dados
      await prisma.auditLog.deleteMany({});
      await prisma.notification.deleteMany({});

      // 2. Reseta todas as assinaturas ativas para canceladas/starter no banco de dados
      await prisma.subscription.updateMany({
        data: {
          plan: "Starter",
          status: "cancelled",
          trialEndsAt: new Date(0),
        },
      });

      // 3. Reseta e limpa todas as configurações de sites gerados e rascunhos de todos os usuários
      await prisma.userSettings.updateMany({
        data: {
          landingConfig: {},
        },
      });

      return NextResponse.json({ success: true, message: "Todos os dados do site, logins, rascunhos e assinaturas foram totalmente resetados no banco de dados com sucesso!" });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
