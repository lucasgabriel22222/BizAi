"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Bell,
  Search,
  CheckCircle2,
} from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#0B0C15]">
        {/* Browser Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
            <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-3.5 py-1 text-[10px] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            app.BizAi.com/dashboard
          </div>
          <div className="w-14" />
        </div>

        {/* Dashboard Shell Grid Layout */}
        <div className="flex min-h-[380px] flex-col sm:flex-row">
          
          {/* Sidebar */}
          <aside className="hidden w-48 shrink-0 border-r border-white/10 bg-black/20 p-4 sm:block">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/10">
                <span className="text-[11px] font-black text-white">V</span>
              </div>
              <span className="text-sm font-bold tracking-tight text-white">BizAi</span>
            </div>
            
            <div className="space-y-1">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: Calendar, label: "Agenda" },
                { icon: Users, label: "Pacientes" },
                { icon: DollarSign, label: "Financeiro" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                    item.active
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-20 rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-[9px] font-semibold text-white/80">Starter Plan</p>
              <p className="mt-0.5 text-[8px] text-white/40">7 dias grátis ativos</p>
              <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-2/3 bg-white/50" />
              </div>
            </div>
          </aside>

          {/* Main Dashboard Panel Area */}
          <div className="flex-1 p-5 sm:p-6">
            {/* Header section inside panel */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Painel Executivo</h3>
                <p className="text-[10px] text-white/40">Olá, Dra. Ana Silva! Seja bem-vinda de volta.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-white/50 hover:text-white transition">
                  <Search className="h-3 w-3" />
                </div>
                <div className="relative rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-white/50 hover:text-white transition">
                  <Bell className="h-3 w-3" />
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <div className="h-6 w-6 rounded-full border border-white/20 bg-white/10" />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Ganhos do Mês", value: "R$ 4.250", icon: DollarSign, trend: "+12.4%", up: true },
                { label: "Consultas Ativas", value: "28", icon: Calendar, trend: "+4", up: true },
                { label: "Média de Sessão", value: "R$ 210", icon: TrendingUp, trend: "Estável", up: true },
                { label: "Pacientes Novos", value: "42", icon: Users, trend: "+8.2%", up: true },
              ].map((c) => (
                <div
                  key={c.label}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 transition duration-300 hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <c.icon className="h-3.5 w-3.5 text-white/50" />
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      c.up ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-white/50"
                    }`}>
                      {c.trend}
                    </span>
                  </div>
                  <p className="mt-2 text-[9px] font-medium text-white/40">{c.label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{c.value}</p>
                </div>
              ))}
            </div>

            {/* Chart + Upcoming Appointments split screen */}
            <div className="mt-4 grid gap-3 lg:grid-cols-7">
              {/* Chart (takes 4 cols) */}
              <div className="lg:col-span-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-white">Evolução Financeira</p>
                  <span className="text-[8px] text-white/40">Faturamento semanal</span>
                </div>
                <div className="flex h-24 items-end gap-1.5">
                  {[35, 60, 48, 85, 52, 95, 75].map((h, i) => (
                    <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className="w-full rounded-t-md bg-gradient-to-t from-white/30 to-white/60 opacity-80 group-hover:opacity-100 transition"
                      />
                      <span className="text-[7px] text-white/30 mt-1.5">S{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Appointments (takes 3 cols) */}
              <div className="lg:col-span-3 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent p-4">
                <p className="text-[10px] font-bold text-white mb-3">Agenda de Hoje</p>
                <div className="space-y-2">
                  {[
                    { name: "Carlos Antunes", time: "14:00", active: true },
                    { name: "Fernanda Lima", time: "15:30", active: false },
                  ].map((appt, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 border border-white/10 text-white text-[8px] font-bold">
                          {appt.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-white">{appt.name}</p>
                          <p className="text-[7px] text-white/40">Sessão {appt.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {appt.active ? (
                          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1 py-0.5 text-[7px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-2 w-2" /> Confirmada
                          </span>
                        ) : (
                          <span className="rounded bg-white/5 px-1 py-0.5 text-[7px] text-white/50">
                            Aguardando
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}

