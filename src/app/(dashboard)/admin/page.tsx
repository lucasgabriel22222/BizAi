"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  DollarSign,
  Tag,
  Trash2,
  Plus,
  Save,
  Bell,
  BellOff,
  Users,
  TrendingUp,
  Eye,
  ShoppingCart,
  LogIn,
  Percent,
  Crown,
  UserPlus,
  RotateCcw,
  X,
  BarChart3,
  Settings,
  UserCog,
  Zap,
  Activity,
  UserCheck,
  UserX,
  Clock,
  Globe,
  Sparkles,
} from "lucide-react";

interface CouponData {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  notifyUsers: boolean;
  createdAt: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: string;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    trialStartedAt: string;
    trialEndsAt: string;
  } | null;
  _count?: {
    appointments: number;
    patients: number;
  };
}

interface MetricsData {
  totalVisitors: number;
  totalUsers: number;
  activeTrials: number;
  activePaidCount: number;
  mrr: number;
  conversionRate: number;
  retentionRate: number;
  totalCheckoutStarted: number;
  totalCheckoutCompleted: number;
  checkoutAbandonCount: number;
  checkoutAbandonRate: number;
  totalLogins: number;
  recentSales: {
    id: string;
    userName: string;
    userEmail: string;
    plan: string;
    amount: number;
    date: string;
  }[];
  recentLogins: {
    userId: string;
    userName: string;
    userEmail: string;
    ipAddress: string;
    date: string;
  }[];
  monthlyGrowthChart: {
    month: string;
    Visitas: number;
    Assinantes: number;
    Faturamento: number;
  }[];
}

interface ManagedSiteData {
  userId: string;
  userName: string;
  userEmail: string;
  subdomain: string;
  htmlCode: string;
  status: string; // PENDENTE, PUBLICADO, CANCELADO
  publishedUrl: string;
  chatMessages: any[];
  createdAt: string;
}

type TabId = "overview" | "sites" | "users" | "admins" | "settings";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [chartMetric, setChartMetric] = useState<"Visitas" | "Assinantes" | "Faturamento">("Visitas");

  // Configurações do sistema
  const [proPlanPrice, setProPlanPrice] = useState("97");
  const [activeNotification, setActiveNotification] = useState("");

  // Sites Gerenciados & Filtros
  const [managedSites, setManagedSites] = useState<ManagedSiteData[]>([]);
  const [siteFilter, setSiteFilter] = useState<"PENDENTE" | "PUBLICADO" | "CANCELADO" | "TODOS">("PENDENTE");
  const [selectedSite, setSelectedSite] = useState<ManagedSiteData | null>(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [updatingSiteStatus, setUpdatingSiteStatus] = useState(false);

  // Cupons
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [newCouponNotify, setNewCouponNotify] = useState(false);

  // Usuários
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userStatusUpdate, setUserStatusUpdate] = useState("active");

  // Admins
  const [admins, setAdmins] = useState<UserData[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Métricas
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, couponsRes, metricsRes, usersRes, sitesRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/coupons"),
        fetch("/api/admin/metrics"),
        fetch("/api/admin/users"),
        fetch("/api/admin/sites"),
      ]);

      const settingsData = await settingsRes.json();
      const couponsData = await couponsRes.json();
      const metricsData = await metricsRes.json();
      const usersData = await usersRes.json();
      const sitesData = await sitesRes.json();

      if (settingsData.config) {
        setProPlanPrice(String(settingsData.config.proPlanPrice || 97));
        setActiveNotification(settingsData.config.activeNotification || "");
      }

      setCoupons(couponsData.coupons || []);
      setMetrics(metricsData.metrics || null);
      setManagedSites(sitesData.sites || []);

      if (usersData.users) {
        setUsers(usersData.users);
        setAdmins(usersData.users.filter((u: UserData) => u.role === "ADMIN"));
      }
    } catch (e) {
      toast.error("Erro ao carregar dados do painel admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSiteStatus = async (userId: string, newStatus: string) => {
    setUpdatingSiteStatus(true);
    try {
      const res = await fetch("/api/admin/sites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status do site alterado para ${newStatus}! O usuário foi notificado no sininho.`);
        setShowSiteModal(false);
        await loadData();
      } else {
        toast.error(data.error || "Erro ao atualizar status do site.");
      }
    } catch {
      toast.error("Erro ao atualizar status do site.");
    } finally {
      setUpdatingSiteStatus(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proPlanPrice: Number(proPlanPrice),
          activeNotification: activeNotification.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Configurações salvas com sucesso!");
      } else {
        toast.error(data.error || "Erro ao salvar.");
      }
    } catch (e) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim() || !newCouponDiscount.trim()) {
      toast.error("Preencha o código do cupom e a porcentagem de desconto.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discountPercent: Number(newCouponDiscount),
          notifyUsers: newCouponNotify,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Cupom "${data.coupon.code}" criado com sucesso!`);
        setNewCouponCode("");
        setNewCouponDiscount("");
        setNewCouponNotify(false);
        await loadData();
      } else {
        toast.error(data.error || "Erro ao criar cupom.");
      }
    } catch (e) {
      toast.error("Erro ao criar cupom.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom de desconto?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Cupom de desconto excluído.");
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error("Erro ao excluir cupom.");
      }
    } catch (e) {
      toast.error("Erro ao excluir.");
    }
  };

  const handleClearNotification = async () => {
    setActiveNotification("");
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proPlanPrice: Number(proPlanPrice),
        activeNotification: null,
      }),
    });
    toast.success("Banner de notificação removido com sucesso!");
  };

  const handleUpdateUserPlan = async (userId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: "Starter", status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Plano atualizado no banco de dados com sucesso!");
        setShowUserModal(false);
        await loadData();
      } else {
        toast.error(data.error || "Erro ao atualizar plano.");
      }
    } catch (e) {
      toast.error("Erro ao atualizar plano do usuário.");
    }
  };

  const handleRemoveUserPlan = async (userId: string) => {
    if (!confirm("Tem certeza que deseja TIRAR o plano deste usuário no banco de dados de verdade?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, removePlan: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Plano removido e cancelado no banco de dados de verdade.");
        setShowUserModal(false);
        await loadData();
      } else {
        toast.error(data.error || "Erro ao remover plano.");
      }
    } catch (e) {
      toast.error("Erro ao remover plano do usuário.");
    }
  };

  const handleResetAllLogins = async () => {
    if (!confirm("ATENÇÃO: Deseja apagar TODOS os logins do banco de dados e resetar todas as assinaturas?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_all_logins" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Todos os logins e assinaturas do banco foram apagados/resetados de verdade!");
        await loadData();
      } else {
        toast.error(data.error || "Erro ao resetar logins.");
      }
    } catch (e) {
      toast.error("Erro ao resetar logins do banco.");
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error("Informe o email do novo administrador.");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_admin", email: newAdminEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${newAdminEmail} agora é um administrador com acesso total!`);
        setNewAdminEmail("");
        await loadData();
      } else {
        toast.error(data.error || "Erro ao adicionar administrador.");
      }
    } catch (e) {
      toast.error("Erro ao adicionar administrador.");
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover as permissões de administrador desta conta?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_admin", userId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Acesso de administrador removido.");
        await loadData();
      } else {
        toast.error(data.error || "Erro ao remover administrador.");
      }
    } catch (e) {
      toast.error("Erro ao remover administrador.");
    }
  };

  const openUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setUserStatusUpdate(user.subscription?.status || "active");
    setShowUserModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-emerald-400 text-sm font-semibold animate-pulse">
        Carregando dados da plataforma...
      </div>
    );
  }

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Visão geral", icon: BarChart3 },
    { id: "sites", label: "Gerenciar Sites", icon: Globe },
    { id: "users", label: "Usuários do sistema", icon: Users },
    { id: "admins", label: "Administradores", icon: Crown },
    { id: "settings", label: "Configurações & Cupons", icon: Settings },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-white">
      {/* Header Executivo Estilo Dark Neon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/10 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
            Visão geral da plataforma
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Métricas em tempo real de acessos, cadastros, conversões e faturamento do BizAi.
          </p>
        </div>

        {/* Abas Superiores */}
        <div className="flex gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-bold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB: VISÃO GERAL ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Top 4 KPI Cards de Acessos, Assinantes, Retenção e Faturamento do SaaS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 - Pessoas que Acessaram */}
            <div className="relative group rounded-2xl bg-neutral-900/90 border border-emerald-500/30 p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:border-emerald-500/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Eye className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  Total no site
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-400">Pessoas que entraram no site</p>
                <p className="text-2xl font-black text-white mt-1 tracking-tight">
                  {metrics?.totalVisitors || 0} acessos
                </p>
              </div>
            </div>

            {/* Card 2 - Pessoas que Assinaram */}
            <div className="relative group rounded-2xl bg-neutral-900/90 border border-emerald-500/30 p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:border-emerald-500/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {metrics?.conversionRate || 0}% conversão
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-400">Pessoas que assinaram o plano</p>
                <p className="text-2xl font-black text-white mt-1 tracking-tight">
                  {metrics?.activePaidCount || 0} assinantes
                </p>
              </div>
            </div>

            {/* Card 3 - Pessoas que Continuaram */}
            <div className="relative group rounded-2xl bg-neutral-900/90 border border-emerald-500/30 p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:border-emerald-500/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {metrics?.activeTrials || 0} em teste
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-400">Pessoas ativas / no sistema</p>
                <p className="text-2xl font-black text-white mt-1 tracking-tight">
                  {metrics?.totalUsers || 0} cadastrados
                </p>
              </div>
            </div>

            {/* Card 4 - Faturamento Mensal */}
            <div className="relative group rounded-2xl bg-neutral-900/90 border border-emerald-500/30 p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:border-emerald-500/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  MRR do SaaS
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-400">Faturamento Mensal (Vendas)</p>
                <p className="text-2xl font-black text-emerald-400 mt-1 tracking-tight">
                  R$ {(metrics?.mrr || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico Principal do SaaS & Funil de Checkout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gráfico de Crescimento do SaaS */}
            <div className="lg:col-span-8 rounded-2xl bg-neutral-900/80 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Crescimento & Evolução da Plataforma
                  </h3>
                  <p className="text-xs text-neutral-400">Acompanhe acessos, novos assinantes e receita mensal</p>
                </div>
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10">
                  {(["Visitas", "Assinantes", "Faturamento"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setChartMetric(m)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                        chartMetric === m
                          ? "bg-emerald-500 text-black shadow-sm font-extrabold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.monthlyGrowthChart || []}>
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="month" stroke="#737373" fontSize={12} />
                    <YAxis stroke="#737373" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0a0a",
                        borderColor: "#10b981",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={chartMetric}
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#growthGradient)"
                      dot={{ r: 4, fill: "#10B981", stroke: "#000", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Funil Rastreamento Checkout */}
            <div className="lg:col-span-4 rounded-2xl bg-neutral-900/80 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-400" />
                  Rastreamento do Checkout
                </h3>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 font-semibold">Chegaram no Checkout</p>
                    <p className="text-lg font-black text-white">{metrics?.totalCheckoutStarted || 0} pessoas</p>
                  </div>
                  <ShoppingCart className="h-6 w-6 text-amber-400 opacity-60" />
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-400 font-semibold">Chegaram e Compraram</p>
                    <p className="text-lg font-black text-emerald-400">{metrics?.totalCheckoutCompleted || 0} compras</p>
                  </div>
                  <UserCheck className="h-6 w-6 text-emerald-400 opacity-60" />
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-400 font-semibold">Chegaram e Saíram / Abandonaram</p>
                    <p className="text-lg font-black text-red-400">{metrics?.checkoutAbandonCount || 0} saídas ({metrics?.checkoutAbandonRate || 0}%)</p>
                  </div>
                  <UserX className="h-6 w-6 text-red-400 opacity-60" />
                </div>
              </div>
            </div>
          </div>

          {/* Vendas & Logins Reais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-white/10 bg-neutral-900/90 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  Últimas Vendas do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[350px] overflow-y-auto">
                {(!metrics?.recentSales || metrics.recentSales.length === 0) ? (
                  <p className="text-xs text-neutral-400 text-center py-8">Nenhuma venda registrada ainda.</p>
                ) : (
                  metrics.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3">
                      <div>
                        <p className="text-xs font-bold text-white">{sale.userName}</p>
                        <p className="text-[10px] text-neutral-400">{sale.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-400">R$ {sale.amount?.toFixed(2)}</p>
                        <p className="text-[10px] text-neutral-500">{new Date(sale.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-neutral-900/90 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <LogIn className="h-5 w-5 text-blue-400" />
                  Logins Efetuados no Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[350px] overflow-y-auto">
                {(!metrics?.recentLogins || metrics.recentLogins.length === 0) ? (
                  <p className="text-xs text-neutral-400 text-center py-8">Nenhum login registrado.</p>
                ) : (
                  metrics.recentLogins.map((login, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3">
                      <div>
                        <p className="text-xs font-bold text-white">{login.userName}</p>
                        <p className="text-[10px] text-neutral-400">{login.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-neutral-400 font-mono">IP: {login.ipAddress}</p>
                        <p className="text-[10px] text-emerald-400">{new Date(login.date).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ================= TAB: GERENCIAR SITES ================= */}
      {activeTab === "sites" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Globe className="h-6 w-6 text-emerald-400" />
                Gerenciamento de Sites Solicitados ({managedSites.length})
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Filtre os sites por categoria (Pendentes, Publicados, Cancelados) para aprovar e publicar no Netlify.
              </p>
            </div>

            {/* Sub-abas de Categoria */}
            <div className="flex gap-1 bg-black/60 p-1.5 rounded-xl border border-white/10 shrink-0">
              {[
                { id: "PENDENTE", label: "Pendentes", color: "text-amber-400", count: managedSites.filter((s) => s.status === "PENDENTE").length },
                { id: "PUBLICADO", label: "Publicados", color: "text-emerald-400", count: managedSites.filter((s) => s.status === "PUBLICADO").length },
                { id: "CANCELADO", label: "Cancelados", color: "text-red-400", count: managedSites.filter((s) => s.status === "CANCELADO").length },
                { id: "TODOS", label: "Todos", color: "text-white", count: managedSites.length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSiteFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    siteFilter === f.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full bg-black/50 ${f.color}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Card className="border-white/10 bg-neutral-900/90 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-neutral-950/80 text-neutral-400">
                      <th className="text-left p-4 font-semibold">Cliente</th>
                      <th className="text-left p-4 font-semibold">Subdomínio</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Solicitação / Chat</th>
                      <th className="text-left p-4 font-semibold">Ações / Publicar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {managedSites.filter((s) => siteFilter === "TODOS" || s.status === siteFilter).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-neutral-400 text-xs">
                          Nenhum site encontrado na categoria <strong>{siteFilter}</strong>.
                        </td>
                      </tr>
                    ) : (
                      managedSites
                        .filter((s) => siteFilter === "TODOS" || s.status === siteFilter)
                        .map((site) => (
                        <tr key={site.userId} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-white">{site.userName}</p>
                              <p className="text-xs text-neutral-400">{site.userEmail}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              {site.subdomain}.netlify.app
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge className={
                              site.status === "PUBLICADO" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold" :
                              site.status === "PENDENTE" ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold animate-pulse" :
                              "bg-red-500/20 text-red-400 border-red-500/40 font-bold"
                            }>
                              {site.status === "PUBLICADO" ? "● PUBLICADO" :
                               site.status === "PENDENTE" ? "● PENDENTE (Análise)" : "CANCELADO"}
                            </Badge>
                          </td>
                          <td className="p-4 text-xs text-neutral-300">
                            {site.chatMessages?.length > 0 ? (
                              <span className="text-emerald-400 font-medium">
                                {site.chatMessages.length} mensagem(ns) no chat
                              </span>
                            ) : (
                              <span className="text-neutral-500">Sem solicitações</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSite(site);
                                setShowSiteModal(true);
                              }}
                              className="gap-1.5 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver Detalhes / Alterar Status
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL GERENCIAR STATUS E CHAT DO SITE */}
      {showSiteModal && selectedSite && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSiteModal(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-400" />
                Gerenciar Publicação do Site
              </h3>
              <p className="text-xs text-neutral-400">
                Altere o status do site após abrir e publicar o serviço no Netlify/Hospedagem.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-xl border border-white/10">
                <div>
                  <p className="text-neutral-400 font-semibold">Cliente</p>
                  <p className="font-bold text-white text-sm">{selectedSite.userName}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-semibold">E-mail</p>
                  <p className="font-bold text-white text-sm">{selectedSite.userEmail}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-semibold">Subdomínio Escolhido</p>
                  <p className="font-mono text-emerald-400 font-bold">{selectedSite.subdomain}.netlify.app</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-semibold">Status Atual</p>
                  <p className="font-bold text-amber-400">{selectedSite.status}</p>
                </div>
              </div>

              {/* Mensagens do Chat enviadas pelo cliente */}
              <div className="space-y-2">
                <p className="font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Solicitações e Mensagens do Cliente:
                </p>
                <div className="max-h-[160px] overflow-y-auto rounded-xl border border-white/10 bg-black/60 p-3 space-y-2">
                  {selectedSite.chatMessages?.length === 0 ? (
                    <p className="text-neutral-500 text-center py-4">Nenhuma mensagem no chat.</p>
                  ) : (
                    selectedSite.chatMessages.map((msg: any) => (
                      <div key={msg.id} className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                        <p className="font-bold text-emerald-400 text-[10px]">{msg.senderName || msg.sender}:</p>
                        <p className="text-neutral-200">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dropdown de Alteração de Status */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                <p className="font-bold text-emerald-400 uppercase tracking-wider">Alterar Status do Site (Dropdown)</p>
                <p className="text-neutral-300 leading-relaxed">
                  Após abrir o Netlify ou seu serviço de hospedagem e marcar o site como lançado, selecione <strong>PUBLICADO</strong> abaixo. O usuário será notificado automaticamente no sininho!
                </p>

                <div className="flex gap-3 pt-2">
                  <select
                    defaultValue={selectedSite.status}
                    onChange={(e) => handleUpdateSiteStatus(selectedSite.userId, e.target.value)}
                    disabled={updatingSiteStatus}
                    className="w-full h-10 rounded-xl border border-emerald-500/40 bg-black text-white px-3 font-bold text-xs focus:outline-none"
                  >
                    <option value="PENDENTE">● PENDENTE (Em Análise)</option>
                    <option value="PUBLICADO">● PUBLICADO (Site no Ar)</option>
                    <option value="CANCELADO">● CANCELADO</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: USUÁRIOS ================= */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-400" />
              Todos os Logins e Usuários ({users.length})
            </h2>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetAllLogins}
              className="gap-2 bg-red-600/80 hover:bg-red-500 font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar Todos os Logins & Apagar do Banco
            </Button>
          </div>

          <Card className="border-white/10 bg-neutral-900/90 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-neutral-950/80 text-neutral-400">
                      <th className="text-left p-4 font-semibold">Nome</th>
                      <th className="text-left p-4 font-semibold">Email</th>
                      <th className="text-left p-4 font-semibold">Status Plano</th>
                      <th className="text-left p-4 font-semibold">Data Cadastro</th>
                      <th className="text-left p-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white">{user.name}</p>
                              <p className="text-xs text-neutral-400">/{user.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-300">{user.email}</td>
                        <td className="p-4">
                          <Badge className={
                            user.subscription?.status === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                            user.subscription?.status === "trial" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                            "bg-red-500/20 text-red-400 border-red-500/30"
                          }>
                            {user.subscription?.status === "active" ? "Plano Ativo / Pago" :
                             user.subscription?.status === "trial" ? "Em Teste (1 dia)" : "Sem Plano / Cancelado"}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs text-neutral-400">
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserDetails(user)}
                            className="gap-1.5 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-400" />
                            Ver Conta / Atualizar Plano
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= TAB: ADMINISTRADORES ================= */}
      {activeTab === "admins" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-white/10 bg-neutral-900/90 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <UserPlus className="h-5 w-5 text-emerald-400" />
                Adicionar Novo Administrador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Email da conta cadastrada"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="max-w-md bg-black/50 border-white/10 text-white"
                />
                <Button onClick={handleAddAdmin} className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold">
                  <Plus className="h-4 w-4" />
                  Adicionar Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-neutral-900/90 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Crown className="h-5 w-5 text-emerald-400" />
                Administradores Ativos ({admins.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{admin.name}</p>
                      <p className="text-xs text-neutral-400">{admin.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover Acesso
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= TAB: CONFIGURAÇÕES & CUPONS ================= */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Valor do Plano Pro */}
          <Card className="border-white/10 bg-neutral-900/90">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                Valor da Assinatura Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-neutral-400">R$</span>
                <Input
                  type="number"
                  value={proPlanPrice}
                  onChange={(e) => setProPlanPrice(e.target.value)}
                  className="max-w-[160px] font-bold text-lg bg-black/50 border-white/10 text-white"
                />
                <span className="text-xs text-neutral-400">/ mês</span>
              </div>
            </CardContent>
          </Card>

          {/* Banner de Notificação */}
          <Card className="border-white/10 bg-neutral-900/90">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Bell className="h-5 w-5 text-amber-400" />
                Banner de Notificação Global no Topo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Ex: 🎉 Use o cupom BIZAI10 para 10% de desconto!"
                value={activeNotification}
                onChange={(e) => setActiveNotification(e.target.value)}
                className="bg-black/50 border-white/10 text-white"
              />
              <div className="flex gap-3">
                <Button onClick={handleSaveSettings} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Notificação
                </Button>
                {activeNotification && (
                  <Button variant="outline" onClick={handleClearNotification} className="border-white/10 text-white hover:bg-white/10">
                    Remover Banner
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GERENCIADOR DE CUPONS DE DESCONTO COMPLETO */}
          <Card className="border-white/10 bg-neutral-900/90 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Tag className="h-5 w-5 text-emerald-400" />
                Gerenciar Cupons de Desconto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulário de Novo Cupom */}
              <div className="rounded-xl border border-dashed border-emerald-500/30 p-5 space-y-4 bg-black/40">
                <p className="text-sm font-bold text-white">Criar Novo Cupom de Desconto</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Código do Cupom</label>
                    <Input
                      placeholder="Ex: BIZAI10"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="font-mono uppercase bg-black border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Desconto (%)</label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      min="1"
                      max="100"
                      className="bg-black border-white/10 text-white font-bold"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCreateCoupon} disabled={saving} className="w-full gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold">
                      <Plus className="h-4 w-4" />
                      Criar Cupom
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="notify"
                    checked={newCouponNotify}
                    onCheckedChange={(checked) => setNewCouponNotify(!!checked)}
                  />
                  <label htmlFor="notify" className="text-xs text-neutral-300 cursor-pointer select-none">
                    Notificar todos os usuários via banner global no topo automaticamente
                  </label>
                </div>
              </div>

              {/* Lista de Cupons Ativos */}
              {coupons.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-6">Nenhum cupom de desconto cadastrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {coupon.discountPercent}% OFF
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL DETALHES E ATUALIZAÇÃO DO USUÁRIO */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserCog className="h-5 w-5 text-emerald-400" />
                Informações da Conta do Usuário
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-4 rounded-xl border border-white/10">
                <div>
                  <p className="text-neutral-400 font-semibold">Nome</p>
                  <p className="font-bold text-white text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-semibold">Email</p>
                  <p className="font-bold text-white text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-semibold">Slug</p>
                  <p className="font-mono text-emerald-400">/{selectedUser.slug}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-semibold">Cargo</p>
                  <p className="font-bold text-white">{selectedUser.role}</p>
                </div>
              </div>

              {/* Atualização de Plano */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gerenciar Plano do Usuário</p>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-300 font-semibold">Status do Plano</label>
                  <select
                    value={userStatusUpdate}
                    onChange={(e) => setUserStatusUpdate(e.target.value)}
                    className="w-full h-10 rounded-lg border border-white/10 bg-black text-white px-3 text-xs focus:outline-none focus:border-emerald-400"
                  >
                    <option value="active">Ativo / Pago</option>
                    <option value="trial">Trial (Em teste - 1 dia)</option>
                    <option value="cancelled">Cancelado / Sem Plano</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleUpdateUserPlan(selectedUser.id, userStatusUpdate)}
                    className="w-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black gap-1.5"
                  >
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveUserPlan(selectedUser.id)}
                    className="w-full text-xs font-bold bg-red-600/80 hover:bg-red-500 gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    Tirar Plano no Banco
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
