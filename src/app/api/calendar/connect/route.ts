import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { canUseGoogleCalendar } from "@/lib/features";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { subscription: true },
    });

    const activeSub = user?.subscription ? { plan: user.subscription.plan, status: user.subscription.status } : undefined;
    if (!canUseGoogleCalendar(activeSub)) {
      return NextResponse.json(
        { error: "Disponível a partir do plano Advanced." },
        { status: 403 }
      );
    }

    const authUrl = GoogleCalendarService.getAuthUrl(session.userId);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
