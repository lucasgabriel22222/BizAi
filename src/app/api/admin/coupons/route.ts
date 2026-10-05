import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "anjoslucas962@gmail.com";

export async function GET() {
  try {
    const coupons = await (prisma as any).coupon?.findMany({
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
    return NextResponse.json({ coupons: coupons || [] });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const { code, discountPercent, notifyUsers } = body;

    if (!code || !discountPercent) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();

    const coupon = await (prisma as any).coupon.upsert({
      where: { code: cleanCode },
      create: {
        code: cleanCode,
        discountPercent: Number(discountPercent),
        active: true,
        notifyUsers: !!notifyUsers,
      },
      update: {
        discountPercent: Number(discountPercent),
        active: true,
        notifyUsers: !!notifyUsers,
      },
    });

    // Se a opção de notificar os usuários estiver ativada, atualiza a notificação global do sistema
    if (notifyUsers) {
      await (prisma as any).systemConfig.upsert({
        where: { id: "global" },
        create: {
          id: "global",
          proPlanPrice: 97.0,
          activeNotification: `🎉 Novo cupom disponível! Use o código "${cleanCode}" para ganhar ${discountPercent}% de desconto na sua assinatura!`,
        },
        update: {
          activeNotification: `🎉 Novo cupom disponível! Use o código "${cleanCode}" para ganhar ${discountPercent}% de desconto na sua assinatura!`,
        },
      });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    return NextResponse.json({ error: "Erro ao criar cupom" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (session?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    await (prisma as any).coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar cupom" }, { status: 500 });
  }
}
