export interface BillingCustomer {
  id: string;
  email: string;
  name: string;
}

export interface BillingInvoice {
  id: string;
  amount: number;
  status: "paid" | "open" | "failed";
  dueDate: Date;
}

export interface BillingGateway {
  createCustomer(user: BillingCustomer): Promise<string>;
  createSubscription(customerId: string, planId: string): Promise<{ id: string; status: string }>;
  handleWebhook(payload: any, signature: string): Promise<boolean>;
}

// Provedor Mock preparado para receber Asaas ou Stripe futuramente
class MockBillingGateway implements BillingGateway {
  async createCustomer(user: BillingCustomer) {
    console.log(`[Billing Gateway] Criando cliente: ${user.name} (${user.email})`);
    return `cus_mock_${Math.random().toString(36).substring(2, 9)}`;
  }

  async createSubscription(customerId: string, planId: string) {
    console.log(`[Billing Gateway] Criando assinatura do plano ${planId} para cliente ${customerId}`);
    return {
      id: `sub_mock_${Math.random().toString(36).substring(2, 9)}`,
      status: "active",
    };
  }

  async handleWebhook(payload: any, signature: string) {
    console.log("[Billing Gateway] Processando Webhook de pagamento recebido...");
    return true;
  }
}

// Instanciar o gateway de cobrança ativo (totalmente substituível)
export const billingGateway: BillingGateway = new MockBillingGateway();
