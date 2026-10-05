"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Trash2, ShieldAlert, Sparkles, Shield, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeModal } from "@/components/shared/upgrade-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  createdAt: string;
}

export default function EquipePage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [plan, setPlan] = useState<string>("Starter");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("secretary");
  const [specialty, setSpecialty] = useState("");

  const isMaxPlan = plan === "Pro" || plan === "Max";

  const fetchTeamData = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const json = await res.json();
        setTeam(json.team || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/subscriptions/current");
        if (res.ok) {
          const json = await res.json();
          if (json.subscription) {
            setPlan(json.subscription.plan);
          }
        }
      } catch (err) {
        console.error(err);
      }
      await fetchTeamData();
    };
    init();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaxPlan) {
      setShowUpgradeModal(true);
      return;
    }

    if (!name || !email || !password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, specialty }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      toast.success("Membro da equipe adicionado!");
      setName("");
      setEmail("");
      setPassword("");
      setSpecialty("");
      
      // Atualizar lista
      await fetchTeamData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar membro");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!isMaxPlan) {
      setShowUpgradeModal(true);
      return;
    }
    try {
      const res = await fetch(`/api/team?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setTeam((prev) => prev.filter((m) => m.id !== id));
      toast.success("Membro removido com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover membro da equipe");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Gestão de Equipe e Roles
        </h1>
        <p className="text-sm text-muted-foreground">
          Adicione secretárias e outros psicólogos colaboradores para acessarem seu painel administrativo de forma restrita.
        </p>
      </div>

      {/* Lock Banner se não for plano Max */}
      {!isMaxPlan && (
        <div className="rounded-2xl border border-border bg-muted/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex gap-3 text-muted-foreground">
            <Sparkles className="h-6 w-6 text-primary shrink-0 animate-pulse mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Visualização de Equipe (Modo Leitura)</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você está no plano <strong>{plan}</strong>. A criação de novos acessos e gerenciamento de permissões é exclusiva do plano <strong>Max</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="rounded-xl bg-foreground px-5 py-2.5 text-xs font-bold text-background shadow-sm hover:opacity-90 transition-all shrink-0"
          >
            Fazer Upgrade para Max
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Formulário (Esquerda) */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="border-border bg-card shadow-sm relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Adicionar Colaborador
              </CardTitle>
              <CardDescription>Conceda acessos adicionais ao seu consultório</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Nome Completo</label>
                  <input
                    type="text"
                    required
                    disabled={!isMaxPlan}
                    placeholder="Ex: Clara Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">E-mail de Acesso</label>
                  <input
                    type="email"
                    required
                    disabled={!isMaxPlan}
                    placeholder="Ex: clara.mendes@clinica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Senha de Login</label>
                  <input
                    type="password"
                    required
                    disabled={!isMaxPlan}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Cargo / Role</label>
                    <select
                      disabled={!isMaxPlan}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                    >
                      <option value="secretary">Secretária</option>
                      <option value="staff">Colaborador</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Especialidade</label>
                    <input
                      type="text"
                      disabled={!isMaxPlan}
                      placeholder="Ex: Recepção"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading && isMaxPlan}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-glass transition-all hover:brightness-105",
                    isMaxPlan ? "bg-gradient-brand" : "bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed"
                  )}
                >
                  <UserPlus className="h-4 w-4" />
                  {!isMaxPlan ? "Disponível Apenas no Plano Max" : loading ? "Adicionando..." : "Salvar Colaborador"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Membros (Direita) */}
        <div className="space-y-6 lg:col-span-7">
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass flex flex-col min-h-[380px]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Membros Conectados
              </CardTitle>
              <CardDescription>Acessos ativos da sua empresa/clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {team.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4.5 transition-all hover:bg-white/10">
                  <div className="flex gap-4 items-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/60 text-xs font-bold">
                      {member.role === "secretary" ? "SEC" : "COL"}
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-white block">{member.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {member.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-zinc-800 border border-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                      {member.specialty}
                    </span>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className={cn(
                        "rounded-lg p-1.5 transition-all",
                        isMaxPlan ? "text-red-400 hover:bg-red-500/10" : "text-zinc-600 cursor-not-allowed"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Gestão da Equipe (Roles)"
        requiredPlan="Max"
        description="Adicione secretárias e equipe para gerenciar seu consultório. Disponível no plano Max."
      />
    </div>
  );
}
