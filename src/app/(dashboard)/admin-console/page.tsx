"use client";

import { useEffect, useState } from "react";
import { Settings, Shield, UserPlus, Users, Terminal, Code, Cpu, Activity, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  userId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminConsolePage() {
  const [activePlan, setActivePlan] = useState<string>("Starter");
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Form de Novo Usuário de Teste
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "staff", // suporte, adm, chefe, owner, Starter, Advanced, Max
    plan: "Starter",
  });

  const SYSTEM_UPDATES = [
    { title: "Mapeamento de DNS", status: "Pronto para Testar", desc: "Integração simuladora de CNAME automática ativa" },
    { title: "Evolution API Gateway", status: "Desacoplado", desc: "Arquitetura pronta para acoplamento do Baileys e Evolution" },
    { title: "LLM Bot Router", status: "Em Desenvolvimento", desc: "Suporte a troca dinâmica de modelos (OpenAI / Claude / Gemini)" },
  ];

  const CARGOS = [
    { id: "Starter", label: "Plano Starter", desc: "Nível Básico" },
    { id: "Advanced", label: "Plano Advanced", desc: "Automações" },
    { id: "Max", label: "Plano Max", desc: "Multi-User & IA" },
    { id: "suporte", label: "Cargos de Suporte", desc: "Painel de Atendimento" },
    { id: "adm", label: "Cargos de ADM", desc: "Financeiro & Clínica" },
    { id: "chefe", label: "Cargo de Chefe", desc: "Gestão do Tenant" },
    { id: "owner", label: "Cargo de Owner", desc: "Dono Geral da Clínica" },
  ];

  useEffect(() => {
    // Carregar assinatura atual em tempo real
    fetch("/api/subscriptions/current")
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription?.plan) {
          setActivePlan(data.subscription.plan);
        }
      })
      .catch(console.error);
  }, []);

  const handlePlanChange = async (plan: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        setActivePlan(plan);
        toast.success(`Plano simulado alterado para ${plan}!`);
        setTimeout(() => window.location.reload(), 800);
      }
    } catch {
      toast.error("Erro ao alterar o plano");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserSimulate = () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Preencha todos os campos do usuário de teste");
      return;
    }
    toast.success(`Usuário de teste ${newUser.name} criado com sucesso com a Role: [${newUser.role}] e Plano: [${newUser.plan}]!`);
    setNewUser({ name: "", email: "", role: "staff", plan: "Starter" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent flex items-center gap-2">
          Console Administrativo (Developer & Admin Only)
          <Shield className="h-6 w-6 text-primary animate-pulse" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie e ative funcionalidades, crie contas de testes e confira logs de auditoria do Supabase.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Lado Esquerdo - Plano e Criação */}
        <div className="space-y-6 lg:col-span-8">
          {/* Plan Simulation Card */}
          <Card className="border-violet-500/20 bg-card/60 backdrop-blur-xl shadow-glass relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/5 blur-2xl" />
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-violet-400">
                <Cpu className="h-5 w-5" />
                Troca Rápida de Planos do Tenant
              </CardTitle>
              <CardDescription>Mude a assinatura ativa da sessão em tempo real para testar bloqueios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                {["Starter", "Advanced", "Max"].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePlanChange(p)}
                    disabled={loading}
                    className={cn(
                      "flex-1 rounded-2xl border py-4 text-sm font-black transition-all duration-200",
                      activePlan === p
                        ? "bg-violet-600 border-violet-500 text-white shadow-glass"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    Simular Plano {p}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Adicionar Usuários com Cargos Avançados */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Criar Usuários de Testes Avançados
              </CardTitle>
              <CardDescription>Crie contas com cargos hierárquicos e planos já atrelados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">E-mail de Teste</label>
                  <input
                    type="email"
                    placeholder="Ex: joao@clinica.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Seletor de Cargos/Roles */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Cargos/Roles Disponíveis</label>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                  {CARGOS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewUser({ ...newUser, role: item.id })}
                      className={cn(
                        "rounded-xl border p-2.5 text-center text-xs font-bold transition-all",
                        newUser.role === item.id
                          ? "border-primary bg-primary/10 text-white"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateUserSimulate}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3 text-sm font-bold text-white shadow-glass hover:brightness-105"
              >
                <UserPlus className="h-4 w-4" />
                Criar Usuário com Cargo Atribuído
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito - Logs e Updates */}
        <div className="space-y-6 lg:col-span-4">
          {/* Status de Atualizações Novas */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="h-4 w-4 text-violet-400" />
                Atualizações & Novidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SYSTEM_UPDATES.map((up, idx) => (
                <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>{up.title}</span>
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] text-violet-300">
                      {up.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{up.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stream de Auditorias */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass flex flex-col h-[280px]">
            <CardHeader className="border-b border-white/10 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-xs font-bold text-white">Live Activity Auditor (Supabase)</CardTitle>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </CardHeader>
            <CardContent className="flex-1 p-4 font-mono text-[10px] space-y-1 overflow-y-auto bg-black/40 text-emerald-400/90 rounded-b-xl leading-relaxed">
              <div>[11:02:15] REGISTER: Novo trial Starter criado para email demo@clinica.com</div>
              <div>[11:02:40] LOGIN: Login realizado com sucesso por demo@clinica.com</div>
              <div>[11:04:12] AUDIT: Automação de e-mail de consultas ativada</div>
              <div>[11:05:22] UPGRADE: Assinatura alterada para plano Max</div>
              <div className="text-white animate-pulse">&gt; Escutando novos eventos do banco de dados...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
