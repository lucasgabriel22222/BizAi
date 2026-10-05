export type PlanType = "Starter" | "Advanced" | "Max";
export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";

export interface UserSubscriptionInfo {
  plan: PlanType;
  status: SubscriptionStatus;
  trialEndsAt: Date;
}

export const PLAN_FEATURES = {
  Starter: {
    whatsapp: false,
    googleCalendar: false,
    ai: false,
    team: false,
    customDomain: false,
  },
  Advanced: {
    whatsapp: true,
    googleCalendar: true,
    ai: false,
    team: false,
    customDomain: false,
  },
  Max: {
    whatsapp: true,
    googleCalendar: true,
    ai: true,
    team: true,
    customDomain: true,
  },
};

/**
 * Verifica se um recurso está habilitado para o plano e status da assinatura.
 */
export function checkFeature(
  plan: string,
  status: string,
  feature: keyof typeof PLAN_FEATURES.Starter
): boolean {
  if (status === "expired" || status === "cancelled") return false;
  
  // Normalizar nomes de planos
  const planName = (plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()) as PlanType;
  
  const features = PLAN_FEATURES[planName];
  if (!features) return false;
  
  return features[feature] ?? false;
}

// Helpers prontos para uso em Controllers, Server Components e APIs:
export function canUseWhatsapp(sub?: { plan: string; status: string }) {
  if (!sub) return false;
  return checkFeature(sub.plan, sub.status, "whatsapp");
}

export function canUseGoogleCalendar(sub?: { plan: string; status: string }) {
  if (!sub) return false;
  return checkFeature(sub.plan, sub.status, "googleCalendar");
}

export function canUseAI(sub?: { plan: string; status: string }) {
  if (!sub) return false;
  return checkFeature(sub.plan, sub.status, "ai");
}

export function canUseMultiUsers(sub?: { plan: string; status: string }) {
  if (!sub) return false;
  return checkFeature(sub.plan, sub.status, "team");
}

export function canUseCustomDomain(sub?: { plan: string; status: string }) {
  if (!sub) return false;
  return checkFeature(sub.plan, sub.status, "customDomain");
}
