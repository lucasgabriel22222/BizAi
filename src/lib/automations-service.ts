import { prisma } from "./prisma";
import { EmailNotificationService } from "./emails";

export class ConsultationAutomationsService {
  /**
   * Dispara as automações baseadas em eventos da consulta.
   */
  static async triggerEvent(
    event: "created" | "completed" | "cancelled",
    appointmentId: string
  ) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          user: {
            include: {
              subscription: true,
              automationSettings: true,
            },
          },
        },
      });

      if (!appointment || !appointment.patient.email) return;

      // Validar plano do usuário ou do chefe
      let sub = appointment.user.subscription;
      let settings = appointment.user.automationSettings;

      if (appointment.user.ownerId) {
        const owner = await prisma.user.findUnique({
          where: { id: appointment.user.ownerId },
          include: { subscription: true, automationSettings: true },
        });
        if (owner) {
          sub = owner.subscription;
          settings = owner.automationSettings;
        }
      }

      // Se for Starter ou sem assinatura ativa, não dispara automação
      const hasPlan = sub && (sub.plan === "Advanced" || sub.plan === "Max") && sub.status !== "expired";
      if (!hasPlan) return;

      // Se não houver configurações salvas ainda, cria as configurações padrão
      if (!settings) {
        settings = await prisma.automationSettings.create({
          data: {
            userId: appointment.user.ownerId || appointment.user.id,
            confirmationEnabled: true,
            reminderEnabled: true,
            reminder24h: true,
            reminder12h: false,
            reminder1h: false,
            feedbackEnabled: true,
          },
        });
      }

      const patientEmail = appointment.patient.email;
      const patientName = appointment.patient.name;
      const dateFormatted = new Date(appointment.date).toLocaleDateString("pt-BR");
      const time = appointment.startTime;
      const doctorName = appointment.user.name;

      if (event === "created" && settings.confirmationEnabled) {
        await EmailNotificationService.sendConfirmationEmail(
          patientEmail,
          patientName,
          doctorName,
          dateFormatted,
          time
        );
      } else if (event === "completed" && settings.feedbackEnabled) {
        const doctorSlug = appointment.user.slug;
        await EmailNotificationService.sendFeedbackRequestEmail(
          patientEmail,
          patientName,
          doctorSlug
        );
      }
    } catch (error) {
      console.error("Erro ao disparar automação de consulta por email:", error);
    }
  }
}
