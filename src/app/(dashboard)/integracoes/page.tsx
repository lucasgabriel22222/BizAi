"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sliders, ChevronRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeModal } from "@/components/shared/upgrade-modal";

export default function IntegracoesPage() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string>("Starter");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [status, setStatus] = useState<string>("Não ativo");
  const [statusColor, setStatusColor] = useState<string>("bg-zinc-500/20 text-zinc-400 border-zinc-500/30");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const subRes = await fetch("/api/subscriptions/current");
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.subscription) {
            setPlan(subData.subscription.plan);
          }
        }

        const settingsRes = await fetch("/api/integrations/automacoes");
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings) {
            const anyActive =
              data.settings.confirmationEnabled ||
              data.settings.reminderEnabled ||
              data.settings.feedbackEnabled;
            if (anyActive) {
              setStatus("Ativo");
              setStatusColor("bg-emerald-500/20 text-emerald-400 border-emerald-500/30");
            } else {
              setStatus("Inativo");
              setStatusColor("bg-zinc-500/20 text-zinc-400 border-zinc-500/30");
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const isStarter = plan === "Starter";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent">
          Central de Integrações e Automações
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie fluxos inteligentes de atendimento e e-mails automatizados para sua clínica.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        <Card className="relative overflow-hidden border-white/10 bg-card/60 backdrop-blur-xl shadow-glass transition-all hover:bg-card/85">
          {/* Glow */}
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/5 blur-2xl" />

          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glass">
                <Sliders className="h-6 w-6" />
              </span>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${statusColor}`}>
                  {status}
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold border-primary/20 text-primary">
                  Plano Advanced
                </Badge>
              </div>
            </div>
            <CardTitle className="mt-4 text-xl font-bold">Automações de Consultas</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Automatize confirmações, lembretes e solicitações de feedback para seus pacientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            {isStarter ? (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 py-3 text-sm font-bold text-white transition-all"
              >
                Configurar Automação
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/integracoes/automacoes"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3 text-sm font-bold text-white shadow-glass transition-all hover:brightness-105"
              >
                Configurar Automação
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Automações de Consultas"
        requiredPlan="Advanced"
        description="Automatize confirmações, lembretes e solicitações de feedback para reduzir faltas e aumentar o retorno dos pacientes."
      />
    </div>
  );
}
