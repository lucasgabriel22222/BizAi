import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "anjoslucas962@gmail.com";

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.email === ADMIN_EMAIL;

    let config = await (prisma as any).systemConfig?.findUnique({
      where: { id: "global" },
    });

    if (!config) {
      config = { proPlanPrice: 97.0, activeNotification: null };
    }

    const activeCoupons = await (prisma as any).coupon?.findMany({
      where: { active: true },
    }).catch(() => []);

    return NextResponse.json({
      config,
      isAdmin,
      coupons: activeCoupons || [],
    });
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
    const { proPlanPrice, activeNotification } = body;

    const config = await (prisma as any).systemConfig.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        proPlanPrice: Number(proPlanPrice) || 97.0,
        activeNotification: activeNotification || null,
      },
      update: {
        proPlanPrice: Number(proPlanPrice) || 97.0,
        activeNotification: activeNotification || null,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Admin settings error:", error);
    return NextResponse.json({ error: "Erro ao salvar configurações admin" }, { status: 500 });
  }
}
