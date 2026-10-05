"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

import { Sparkles, Tag } from "lucide-react";
import { UpgradeModal } from "@/components/shared/upgrade-modal";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/agenda": { title: "Agenda", subtitle: "Consultas e dados dos pacientes" },
  "/agenda/horarios": { title: "Gerenciar horários", subtitle: "Adicione, edite ou remova horários disponíveis" },
  "/pacientes": { title: "Pacientes", subtitle: "Gerencie seus pacientes" },
  "/financeiro": { title: "Financeiro", subtitle: "Relatórios detalhados" },
  "/historico": { title: "Histórico", subtitle: "Todas as consultas" },
  "/integracoes": { title: "Integrações", subtitle: "Central de conexões do SaaS" },
  "/personalizacao": { title: "Personalização e Ajustes", subtitle: "Personalize sua experiência visual e do sistema" },
  "/marketing": { title: "Métricas de Conversões", subtitle: "Acompanhe suas visitas e agendamentos" },
  "/equipe": { title: "Gestão da Equipe (Tenant)", subtitle: "Gerencie permissões de acesso para secretárias e equipe" },
  "/admin": { title: "Painel Administrativo", subtitle: "Configurações do sistema e cupons" },
};

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userSlug: string;
  userRole?: string;
  activePlan?: string;
  subscriptionStatus?: string;
}

export function DashboardLayoutClient({
  children,
  userName,
  userEmail,
  userSlug,
  userRole,
  activePlan = "Starter",
  subscriptionStatus = "trial",
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const [systemNotification, setSystemNotification] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.config?.activeNotification) {
          setSystemNotification(data.config.activeNotification);
        }
      })
      .catch(() => {});
  }, []);

  const meta = PAGE_META[pathname] ?? { title: "BizAi" };
  const firstName = userName.split(" ")[0];
  const subtitle =
    pathname === "/dashboard"
      ? `Olá, ${firstName}!`
      : meta.subtitle;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Banner de Notificação Global do Admin */}
      {systemNotification && (
        <div className="bg-amber-500 text-black px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 relative z-50 shadow-md">
          <Tag className="h-4 w-4 shrink-0" />
          <span>{systemNotification}</span>
        </div>
      )}

      {/* Banner Global de Trial */}
      {subscriptionStatus === "trial" && activePlan === "Starter" && (
        <div className="bg-gradient-brand text-white px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-3 animate-fade-in relative z-40">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
            Aproveite o BizAi! Seu período de teste grátis do plano <strong>Starter</strong> expira em <strong>1 dia</strong>.
          </span>
          <button
            onClick={() => setShowUpgrade(true)}
            className="rounded-full bg-white px-4 py-1 text-[10px] font-bold text-black shadow-glass transition-all hover:scale-105"
          >
            Fazer Upgrade
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} userSlug={userSlug} userEmail={userEmail} userRole={userRole} />
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header
            title={meta.title}
            subtitle={subtitle}
            onMenuClick={() => setSidebarOpen(true)}
            userName={userName}
            userEmail={userEmail}
          />
          <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureName="SaaS Premium Upgrade"
        requiredPlan="Advanced"
        description="Libere automações completas de WhatsApp, e-mails, relatórios, equipe e assistente de IA."
      />
    </div>
  );
}

