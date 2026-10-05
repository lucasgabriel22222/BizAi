"use client";

import { useEffect, useState } from "react";
import { Mail, Clock, MessageSquare, Check, Sparkles, RefreshCw, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeModal } from "@/components/shared/upgrade-modal";
import { toast } from "sonner";

export default function AutomacoesConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<string>("Starter");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // States de automação
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder12h, setReminder12h] = useState(false);
  const [reminder1h, setReminder1h] = useState(false);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);

  const isStarter = plan !== "Pro" && plan !== "Advanced" && plan !== "Max";

  useEffect(() => {
    const loadData = async () => {
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
            setConfirmationEnabled(data.settings.confirmationEnabled);
            setReminderEnabled(data.settings.reminderEnabled);
            setReminder24h(data.settings.reminder24h);
            setReminder12h(data.settings.reminder12h);
            setReminder1h(data.settings.reminder1h);
            setFeedbackEnabled(data.settings.feedbackEnabled);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar configurações de automações:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (isStarter) {
      setShowUpgradeModal(true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/integrations/automacoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationEnabled,
          reminderEnabled,
          reminder24h,
          reminder12h,
          reminder1h,
          feedbackEnabled,
        }),
      });
      if (res.ok) {
        toast.success("Configurações de automações salvas com sucesso!");
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.error || "Erro ao salvar configurações.");
      }
    } catch {
      toast.error("Falha de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Automações de Consultas
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie e automatize confirmações de consultas, lembretes de horários e pedidos de feedback de seus pacientes por email.
        </p>
      </div>

      {isStarter && (
        <div className="rounded-2xl border border-border bg-muted/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl">
          <div className="flex gap-4 text-muted-foreground">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background font-bold shadow-sm">
              🔒
            </span>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">🔒 Recurso disponível no plano Advanced</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatize confirmações, lembretes e solicitações de feedback para reduzir faltas e aumentar o retorno dos pacientes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background shadow-sm hover:opacity-90 transition-all shrink-0"
          >
            Fazer upgrade
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 max-w-6xl">
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Confirmação automática */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  Confirmação de Agendamento
                </CardTitle>
                <CardDescription>Envie um e-mail de confirmação ao paciente imediatamente após o agendamento</CardDescription>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={confirmationEnabled}
                  onChange={(e) => setConfirmationEnabled(e.target.checked)}
                  disabled={isStarter}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-zinc-800 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-disabled:opacity-40" />
              </label>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-black/40 border border-white/5 p-4 text-xs font-mono text-muted-foreground leading-relaxed">
                <p className="font-bold text-white mb-2">Modelo do Email Enviado:</p>
                <div className="space-y-1.5">
                  <p>Olá <span className="text-white/60">{"{nome_paciente}"}</span>,</p>
                  <p>Sua consulta foi agendada com sucesso.</p>
                  <p><strong>Profissional:</strong> <span className="text-white/60">{"{nome_profissional}"}</span></p>
                  <p><strong>Data:</strong> <span className="text-white/60">{"{data}"}</span></p>
                  <p><strong>Horário:</strong> <span className="text-white/60">{"{horario}"}</span></p>
                  <p className="mt-2 text-zinc-500">Obrigado pela confiança.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Lembretes automáticos */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-white/60" />
                  Lembrete Automático
                </CardTitle>
                <CardDescription>Configure lembretes automáticos por email antes da consulta</CardDescription>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  disabled={isStarter}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-zinc-800 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-disabled:opacity-40" />
              </label>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Disparar lembrete nos intervalos:</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-white/95 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder24h}
                      onChange={(e) => setReminder24h(e.target.checked)}
                      disabled={isStarter || !reminderEnabled}
                      className="rounded border-white/15 bg-white/5 text-primary focus:ring-primary disabled:opacity-40"
                    />
                    24 horas antes
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-white/95 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder1h}
                      onChange={(e) => setReminder1h(e.target.checked)}
                      disabled={isStarter || !reminderEnabled}
                      className="rounded border-white/15 bg-white/5 text-primary focus:ring-primary disabled:opacity-40"
                    />
                    1 hora antes
                  </label>
                </div>
              </div>

              <div className="rounded-xl bg-black/40 border border-white/5 p-4 text-xs font-mono text-muted-foreground leading-relaxed">
                <p className="font-bold text-white mb-2">Modelo do Email Enviado:</p>
                <div className="space-y-1.5">
                  <p>Olá <span className="text-white/60">{"{nome_paciente}"}</span>,</p>
                  <p>Lembramos que sua consulta ocorrerá em breve.</p>
                  <p><strong>Data:</strong> <span className="text-white/60">{"{data}"}</span></p>
                  <p><strong>Horário:</strong> <span className="text-white/60">{"{horario}"}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Solicitação de feedback */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-white/60" />
                  Solicitação de Feedback
                </CardTitle>
                <CardDescription>Peça uma avaliação por email ao paciente após a consulta ser concluída</CardDescription>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={feedbackEnabled}
                  onChange={(e) => setFeedbackEnabled(e.target.checked)}
                  disabled={isStarter}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-zinc-800 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-disabled:opacity-40" />
              </label>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-black/40 border border-white/5 p-4 text-xs font-mono text-muted-foreground leading-relaxed">
                <p className="font-bold text-white mb-2">Modelo do Email Enviado:</p>
                <div className="space-y-2">
                  <p>Olá <span className="text-white/60">{"{nome_paciente}"}</span>,</p>
                  <p>Esperamos que sua experiência tenha sido positiva.</p>
                  <p>Sua opinião é muito importante.</p>
                  <p>Clique abaixo para avaliar o atendimento:</p>
                  <div className="pt-2">
                    <span className="inline-block rounded-lg bg-white px-4 py-2 text-white font-sans font-bold text-center">
                      Avaliar atendimento
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna de Ações e Resumo */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass">
            <CardHeader>
              <CardTitle className="text-lg">Salvar Configurações</CardTitle>
              <CardDescription>Confirme as novas regras de disparo para a sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={handleSave}
                disabled={saving || isStarter}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-bold text-white shadow-glass transition-all hover:brightness-105 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : "Salvar Configurações"}
              </button>
            </CardContent>
          </Card>
        </div>
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
