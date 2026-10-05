import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseAI } from "@/lib/features";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const assistant = await prisma.aIAssistant.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json({ assistant });
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
    if (!canUseAI(activeSub)) {
      return NextResponse.json(
        { error: "Upgrade necessário. Disponível apenas no plano Max." },
        { status: 403 }
      );
    }

    const { prompt, model, active, specialties, hours, location, price } = await request.json();

    const assistant = await prisma.aIAssistant.upsert({
      where: { userId: session.userId },
      update: {
        prompt: prompt || "",
        model: model || "gpt-4o",
        active: active ?? false,
        specialties,
        hours,
        location,
        price: price ? parseFloat(price) : null,
      },
      create: {
        userId: session.userId,
        prompt: prompt || "",
        model: model || "gpt-4o",
        active: active ?? false,
        specialties,
        hours,
        location,
        price: price ? parseFloat(price) : null,
      },
    });

    return NextResponse.json({ success: true, assistant });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
