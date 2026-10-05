import { prisma } from "./prisma";

export interface AIServiceResponse {
  answer: string;
}

export interface AIProvider {
  generateResponse(prompt: string, patientMessage: string): Promise<AIServiceResponse>;
}

// Provedor Mock de IA, totalmente expansível para OpenAI/Claude/Gemini
class MockAIProvider implements AIProvider {
  async generateResponse(prompt: string, patientMessage: string) {
    console.log(`[AI Chatbot Simulation] Prompt: ${prompt.substring(0, 50)}... | Msg: ${patientMessage}`);
    
    // Resposta simulada super premium
    return {
      answer: "Olá! Sou a assistente virtual inteligente da clínica. Dr(a). está atendendo no momento, mas posso te adiantar que temos especialidades na sua área de interesse. Gostaria de agendar um horário?",
    };
  }
}

const activeAIProvider: AIProvider = new MockAIProvider();

export class AIAssistantService {
  /**
   * Responde mensagens de pacientes de forma automatizada usando a configuração do psicólogo.
   */
  static async handlePatientMessage(userId: string, patientMessage: string): Promise<string> {
    try {
      const assistant = await prisma.aIAssistant.findUnique({
        where: { userId },
        include: { user: { include: { subscription: true } } },
      });

      if (!assistant || !assistant.active) {
        return "Desculpe, o assistente virtual não está ativo no momento.";
      }

      // Validar plano Max para uso de IA
      const sub = assistant.user.subscription;
      const canUse = sub && sub.plan === "Max" && sub.status !== "expired";
      if (!canUse) {
        return "Desculpe, o recurso de assistente virtual por IA não está disponível neste plano.";
      }

      // Montar prompt contextualizado com as informações da clínica do psicólogo
      const systemPrompt = `
        Você é uma assistente virtual profissional e empática para o(a) psicólogo(a) ${assistant.user.name}.
        Especialidades: ${assistant.specialties || "Psicologia Geral"}
        Horários de atendimento: ${assistant.hours || "Segunda a Sexta, das 08:00 às 18:00"}
        Localização do consultório: ${assistant.location || "Online"}
        Valor da consulta: R$ ${assistant.price || "a combinar"}
        
        Instruções adicionais do psicólogo:
        ${assistant.prompt}
        
        Responda de forma curta, acolhedora e prestativa, direcionando para o agendamento caso o paciente demonstre interesse.
      `;

      const response = await activeAIProvider.generateResponse(systemPrompt, patientMessage);
      return response.answer;
    } catch (error) {
      console.error("Erro no processamento do chatbot com IA:", error);
      return "Olá! Ocorreu um erro no momento, mas entraremos em contato o mais breve possível.";
    }
  }
}
