import { NextRequest, NextResponse } from "next/server";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/auth-security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("state"); // O state contém o userId que passamos no connect

    if (!code || !userId) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    // Trocar código e salvar tokens
    await GoogleCalendarService.handleCallback(code, userId);

    // Disparar sincronização inicial
    await GoogleCalendarService.syncBusySlots(userId);

    // Auditoria
    const ip = getClientIp(request.headers);
    await logAudit({
      userId,
      action: "connect_google_calendar",
      ipAddress: ip,
      details: { service: "google_calendar", status: "connected" },
    });

    // Redirecionar de volta para as configurações
    return NextResponse.redirect(new URL("/configuracoes?tab=integracoes&status=success", request.url));
  } catch (error: any) {
    console.error("Erro no callback do Google Calendar:", error);
    return NextResponse.json({ error: "Falha na conexão com Google" }, { status: 500 });
  }
}
