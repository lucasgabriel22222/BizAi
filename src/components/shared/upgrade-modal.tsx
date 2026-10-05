"use client";

import { X, Sparkles, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: "Advanced" | "Max";
  description?: string;
}

const PLAN_BENEFITS = {
  Advanced: [
    "Automações de Consultas (Confirmações, Lembretes e Feedbacks automáticos)",
    "Notificações e alertas inteligentes",
    "Relatórios e métricas de desempenho avançados",
    "Suporte prioritário por email e chat",
  ],
  Max: [
    "Tudo do plano Advanced",
    "Múltiplos usuários (Secretária e Equipe)",
    "Acesso a novas ferramentas de produtividade",
    "Domínio personalizado (agenda.sualoja.com)",
    "Acesso antecipado a novas APIs",
  ],
};

export function UpgradeModal({
  isOpen,
  onClose,
  featureName,
  requiredPlan,
  description = "Aproveite todo o potencial da sua clínica automatizando tarefas repetitivas.",
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    window.location.href = "/checkout/transparent";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl border border-white/10 bg-card/95 p-8 shadow-glass transition-all duration-300 md:max-w-xl">
        {/* Glow Effects */}
        <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-border/50 p-1.5 text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Upgrade Concluído!</h3>
            <p className="mt-2 text-muted-foreground">
              Seu plano foi atualizado para o <strong>{requiredPlan}</strong>. Atualizando...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glass">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Recurso Premium
                </span>
                <h2 className="text-xl font-extrabold text-foreground md:text-2xl">
                  {featureName}
                </h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              Este recurso está disponível exclusivamente a partir do plano{" "}
              <strong className="text-foreground">{requiredPlan}</strong>. {description}
            </p>

            {/* Plan Info */}
            <div className="rounded-2xl border border-border/50 bg-accent/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-sm font-bold text-foreground">
                  O que está incluso no plano {requiredPlan}:
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                  Popular
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                {PLAN_BENEFITS[requiredPlan].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-border/80 px-5 py-3 text-sm font-semibold transition-all hover:bg-accent"
              >
                Voltar
              </button>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3 text-sm font-bold text-white shadow-glass transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  "Processando..."
                ) : (
                  <>
                    Fazer Upgrade para {requiredPlan}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
