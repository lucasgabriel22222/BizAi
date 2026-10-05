"use client";

import { TrendingUp, Users, MousePointer, Calendar, Percent, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingPage() {
  const METRICS = [
    {
      title: "Visitas no Site",
      value: "1.482",
      change: "+12.4% este mês",
      icon: Users,
      iconColor: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Cliques em Agendar",
      value: "354",
      change: "+8.2% este mês",
      icon: MousePointer,
      iconColor: "text-foreground/70 bg-muted",
    },
    {
      title: "Agendamentos Concluídos",
      value: "148",
      change: "+15.3% este mês",
      icon: Calendar,
      iconColor: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Taxa de Conversão",
      value: "9.98%",
      change: "+2.1% este mês",
      icon: Percent,
      iconColor: "text-amber-500 bg-amber-500/10",
    },
  ];

  const CHART_DATA = [
    { label: "Seg", visits: 40, bookings: 4 },
    { label: "Ter", visits: 65, bookings: 8 },
    { label: "Qua", visits: 80, bookings: 12 },
    { label: "Qui", visits: 95, bookings: 14 },
    { label: "Sex", visits: 120, bookings: 18 },
    { label: "Sáb", visits: 70, bookings: 6 },
    { label: "Dom", visits: 35, bookings: 3 },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Métricas de Conversões e Marketing
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitore o desempenho do seu funil de agendamento e a taxa de retorno de pacientes.
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="border-border bg-card shadow-sm relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-semibold text-muted-foreground">{item.title}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconColor}`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </CardHeader>
              <CardContent className="space-y-1">
                <h3 className="text-2xl font-black text-foreground">{item.value}</h3>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />
                  {item.change}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seção Gráficos Simulados */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Fluxo de Tráfego Semanal</CardTitle>
            <CardDescription>Visualização de visitas versus conversão de consultas</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-end gap-5 pt-8 pb-4">
            {CHART_DATA.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end">
                <div className="w-full flex gap-1 justify-center items-end h-full">
                  {/* Visitas */}
                  <div
                    style={{ height: `${(day.visits / 120) * 180}px` }}
                    className="w-4 rounded-t-md bg-foreground/20 hover:bg-foreground/40 transition-all cursor-pointer relative group"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 rounded bg-popover border border-border px-2 py-0.5 text-[8px] font-bold text-popover-foreground transition-all">
                      {day.visits}
                    </span>
                  </div>
                  {/* Reservas */}
                  <div
                    style={{ height: `${(day.bookings / 20) * 180}px` }}
                    className="w-4 rounded-t-md bg-primary hover:bg-primary/80 transition-all cursor-pointer relative group"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 rounded bg-popover border border-border px-2 py-0.5 text-[8px] font-bold text-popover-foreground transition-all">
                      {day.bookings}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{day.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Funil de Vendas */}
        <Card className="border-border bg-card shadow-sm md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Funil de Conversão</CardTitle>
            <CardDescription>Eficiência de agendamento</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-4">
            {/* Topo do Funil */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-foreground">1. Acessos ao Link</span>
                <span className="text-muted-foreground font-semibold">100%</span>
              </div>
              <div className="h-3 w-full bg-muted border border-border rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Meio do Funil */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-foreground">2. Intenção de Agendamento</span>
                <span className="text-muted-foreground font-semibold">23.8%</span>
              </div>
              <div className="h-3 w-full bg-muted border border-border rounded-full overflow-hidden">
                <div className="h-full bg-primary/70" style={{ width: "23.8%" }} />
              </div>
            </div>

            {/* Fundo do Funil */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-foreground">3. Consulta Confirmada</span>
                <span className="text-muted-foreground font-semibold">9.98%</span>
              </div>
              <div className="h-3 w-full bg-muted border border-border rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "9.98%" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
