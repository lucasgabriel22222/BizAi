export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }>;
}

// Provedor Mock de Emails pronto para ser substituído por Resend / SendGrid
class MockEmailProvider implements EmailProvider {
  async sendEmail(payload: EmailPayload) {
    console.log(`[Email Dispatched] Para: ${payload.to} | Assunto: ${payload.subject}`);
    // Futura integração real com a API da Resend ou SendGrid
    return { success: true, messageId: `msg_email_${Math.random().toString(36).substring(2, 9)}` };
  }
}

const activeEmailProvider: EmailProvider = new MockEmailProvider();

export class EmailNotificationService {
  /**
   * Envia e-mail de Boas-Vindas e Início do Trial
   */
  static async sendWelcomeTrialEmail(to: string, userName: string) {
    return activeEmailProvider.sendEmail({
      to,
      subject: "Bem-vindo ao BizAi! Seu teste de 1 dia começou",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Olá, ${userName}!</h2>
          <p>Seja muito bem-vindo ao BizAi. Sua conta foi criada com sucesso e seu teste grátis de 1 dia do plano <strong>Starter</strong> começou agora!</p>
          <p>Você já tem acesso ao painel de agenda, gestão de pacientes, financeiro e sua página pública de agendamento.</p>
          <br/>
          <p>Atenciosamente,<br/>Equipe BizAi</p>
        </div>
      `,
    });
  }

  /**
   * Envia e-mail de aviso de Fim do Trial
   */
  static async sendTrialEndingEmail(to: string, userName: string) {
    return activeEmailProvider.sendEmail({
      to,
      subject: "Atenção: Seu período de testes do BizAi está terminando",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Olá, ${userName}!</h2>
          <p>Seu período de teste grátis de 1 dia no BizAi terminará em breve.</p>
          <p>Para não perder acesso às suas consultas e histórico de pacientes, faça o upgrade para um de nossos planos Premium agora mesmo!</p>
          <br/>
          <p>Atenciosamente,<br/>Equipe BizAi</p>
        </div>
      `,
    });
  }

  /**
   * Envia e-mail de confirmação de Upgrade de Plano
   */
  static async sendUpgradeSuccessEmail(to: string, userName: string, planName: string) {
    return activeEmailProvider.sendEmail({
      to,
      subject: `Upgrade concluído com sucesso: Bem-vindo ao plano ${planName}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Parabéns, ${userName}!</h2>
          <p>Sua assinatura foi atualizada com sucesso para o plano <strong>${planName}</strong>!</p>
          <p>Todos os novos recursos e integrações já foram desbloqueados na sua conta. Aproveite ao máximo!</p>
          <br/>
          <p>Atenciosamente,<br/>Equipe BizAi</p>
        </div>
      `,
    });
  }

  /**
   * Envia e-mail de Recuperação de Senha
   */
  static async sendPasswordRecoveryEmail(to: string, link: string) {
    return activeEmailProvider.sendEmail({
      to,
      subject: "Recuperação de senha - BizAi",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a alteração de sua senha no BizAi. Clique no link abaixo para criar uma nova senha:</p>
          <a href="${link}" style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Recuperar minha senha</a>
          <p>Se você não fez essa solicitação, pode desconsiderar este e-mail.</p>
          <br/>
          <p>Atenciosamente,<br/>Equipe BizAi</p>
        </div>
      `,
    });
  }

  /**
   * Envia e-mail de confirmação de agendamento automático
   */
  static async sendConfirmationEmail(to: string, patientName: string, doctorName: string, date: string, time: string) {
    return activeEmailProvider.sendEmail({
      to,
      subject: "Consulta Agendada com Sucesso",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Olá ${patientName},</p>
          <p>Sua consulta foi agendada com sucesso.</p>
          <p><strong>Profissional:</strong> ${doctorName}</p>
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Horário:</strong> ${time}</p>
          <br/>
          <p>Obrigado pela confiança.</p>
        </div>
      `,
    });
  }

  /**
   * Envia e-mail de lembrete de consulta automático
   */
  static async sendReminderEmail(to: string, patientName: string, date: string, time: string) {
    return activeEmailProvider.sendEmail({
      to,
      subject: "Lembrete de Consulta",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Olá ${patientName},</p>
          <p>Lembramos que sua consulta ocorrerá em breve.</p>
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Horário:</strong> ${time}</p>
        </div>
      `,
    });
  }

  /**
   * Envia e-mail de solicitação de feedback pós-consulta
   */
  static async sendFeedbackRequestEmail(to: string, patientName: string, slug: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${appUrl}/agendar/${slug}`;
    return activeEmailProvider.sendEmail({
      to,
      subject: "Como foi sua consulta?",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Olá ${patientName},</p>
          <p>Esperamos que sua experiência tenha sido positiva.</p>
          <p>Sua opinião é muito importante.</p>
          <p>Clique abaixo para avaliar o atendimento:</p>
          <br/>
          <a href="${link}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Avaliar atendimento</a>
        </div>
      `,
    });
  }
}

