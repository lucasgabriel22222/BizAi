"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PeriodSelector } from "@/components/ui/period-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from "@/lib/constants";
import { AppointmentStatus } from "@prisma/client";
import type { PeriodPreset } from "@/lib/period";
import { format } from "date-fns";
import Link from "next/link";
import { BookingLinkCard } from "@/components/shared/booking-link-card";

const EarningsChart = dynamic(
  () => import("./earnings-chart").then((m) => m.EarningsChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full" /> }
);

interface DashboardStats {
  period: string;
  appointmentsCount: number;
  totalRevenue: number;
  avgPerAppointment: number;
  totalPatients: number;
  recentAppointments: {
    id: string;
    date: string;
    startTime: string;
    status: AppointmentStatus;
    patient: { name: string };
  }[];
  chartData: { date: string; earnings: number; appointments: number }[];
}

interface DashboardContentProps {
  userSlug: string;
}

export function DashboardContent({ userSlug }: DashboardContentProps) {
  const [period, setPeriod] = useState<PeriodPreset>("7d");
  const [customStart, setCustomStart] = useState(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [automations, setAutomations] = useState<{
    confirmationEnabled: boolean;
    reminderEnabled: boolean;
    feedbackEnabled: boolean;
  } | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ period });
    if (period === "custom") {
      params.set("start", customStart);
      params.set("end", customEnd);
    }
    const res = await fetch(`/api/dashboard/stats?${params}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, [period, customStart, customEnd]);

  useEffect(() => {
    fetchStats();
    
    // Fetch automations status
    const fetchAutomations = async () => {
      try {
        const res = await fetch("/api/integrations/automacoes");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setAutomations({
              confirmationEnabled: data.settings.confirmationEnabled,
              reminderEnabled: data.settings.reminderEnabled,
              feedbackEnabled: data.settings.feedbackEnabled,
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAutomations();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Período de análise</p>
          <PeriodSelector
            value={period}
            onChange={setPeriod}
            customStart={customStart}
            customEnd={customEnd}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
          />
        </CardContent>
      </Card>

      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Ganhos no período"
              value={stats.totalRevenue}
              subtitle={stats.period}
              icon={DollarSign}
              isCurrency
              gradient="purple"
            />
            <StatCard
              title="Consultas no período"
              value={stats.appointmentsCount}
              subtitle={stats.period}
              icon={Calendar}
              gradient="blue"
            />
            <StatCard
              title="Média por consulta"
              value={stats.avgPerAppointment}
              subtitle="Consultas concluídas"
              icon={TrendingUp}
              isCurrency
              gradient="green"
            />
            <StatCard
              title="Total de pacientes"
              value={stats.totalPatients}
              subtitle="Cadastrados"
              icon={Users}
              gradient="blue"
            />
          </div>

          <EarningsChart data={stats.chartData} />

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Próximas consultas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {stats.recentAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma consulta agendada</p>
                ) : (
                  stats.recentAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 p-3"
                    >
                      <div>
                        <p className="font-medium">{apt.patient.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(apt.date)} · {apt.startTime}
                        </p>
                      </div>
                      <Badge className={APPOINTMENT_STATUS_COLORS[apt.status]}>
                        {APPOINTMENT_STATUS_LABELS[apt.status]}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="p-6 pt-0">
                <Link
                  href="/agenda"
                  className="block text-center text-sm text-brand-purple hover:underline"
                >
                  Ver agenda
                </Link>
              </div>
            </Card>

            <BookingLinkCard slug={userSlug} />

            <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-white/60" />
                  Automações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 text-xs">
                  <span className="text-muted-foreground font-semibold">Confirmações:</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    automations?.confirmationEnabled 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                      : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                  }`}>
                    {automations?.confirmationEnabled ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 text-xs">
                  <span className="text-muted-foreground font-semibold">Lembretes:</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    automations?.reminderEnabled 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                      : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                  }`}>
                    {automations?.reminderEnabled ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 text-xs">
                  <span className="text-muted-foreground font-semibold">Feedback:</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    automations?.feedbackEnabled 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                      : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                  }`}>
                    {automations?.feedbackEnabled ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link
                  href="/integracoes"
                  className="block text-center text-sm font-bold text-white/60 hover:underline"
                >
                  Gerenciar automações
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
