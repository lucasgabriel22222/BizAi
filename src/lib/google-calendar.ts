import { google } from "googleapis";
import { prisma } from "./prisma";

// Obter credenciais do Google das variáveis de ambiente
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
  process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/calendar/callback"
);

export class GoogleCalendarService {
  /**
   * Retorna a URL de redirecionamento do Google OAuth.
   */
  static getAuthUrl(userId: string) {
    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
      ],
      state: userId,
      prompt: "consent",
    });
  }

  /**
   * Troca o código OAuth recebido por tokens de acesso/refresh e salva no banco de dados.
   */
  static async handleCallback(code: string, userId: string) {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Atualizar configurações do usuário com o token
    await prisma.userSettings.update({
      where: { userId },
      data: {
        landingConfig: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleConnectedAt: new Date().toISOString(),
        },
      },
    });

    return tokens;
  }

  /**
   * Sincroniza eventos do Google Calendar para bloquear slots ocupados na agenda pública.
   */
  static async syncBusySlots(userId: string) {
    try {
      const settings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      const config = settings?.landingConfig as any;
      if (!config?.googleRefreshToken) {
        return { success: false, error: "Google Calendar não conectado" };
      }

      oauth2Client.setCredentials({
        access_token: config.googleAccessToken,
        refresh_token: config.googleRefreshToken,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const now = new Date();
      const endOfSync = new Date();
      endOfSync.setDate(now.getDate() + 30); // Sincroniza próximos 30 dias

      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: now.toISOString(),
        timeMax: endOfSync.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items || [];
      
      // Bloquear horários ocupados como Slots de Disponibilidade Reservados ou Breaks
      for (const event of events) {
        if (event.start?.dateTime && event.end?.dateTime) {
          const startDate = new Date(event.start.dateTime);
          const endDate = new Date(event.end.dateTime);
          
          // Criar um Break no banco de dados correspondente ao evento do Google para bloquear o horário
          await prisma.break.create({
            data: {
              userId,
              date: startDate,
              startTime: startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              endTime: endDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              reason: `Google Calendar: ${event.summary || "Ocupado"}`,
            },
          });
        }
      }

      return { success: true, count: events.length };
    } catch (error: any) {
      console.error("Erro ao sincronizar Google Calendar:", error);
      return { success: false, error: error.message };
    }
  }
}
