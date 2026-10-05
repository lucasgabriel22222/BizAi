import { AppointmentStatus, AppointmentType } from "@prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  CONFIRMED: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  CANCELLED: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  INITIAL: "Primeira consulta",
  FOLLOW_UP: "Retorno",
  ONLINE: "Online",
  IN_PERSON: "Presencial",
  EMERGENCY: "Emergência",
};

export const GENDER_LABELS: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
  PREFER_NOT_SAY: "Prefiro não informar",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/agenda", label: "Agenda", icon: "Calendar" },
  { href: "/pacientes", label: "Pacientes", icon: "Users" },
  { href: "/financeiro", label: "Financeiro", icon: "DollarSign" },
  { href: "/integracoes", label: "Integrações", icon: "Link" },
  { href: "/personalizacao", label: "Site", icon: "Globe" },
  { href: "/marketing", label: "Conversões", icon: "TrendingUp" },
  { href: "/equipe", label: "Equipe", icon: "Users" },
  { href: "/historico", label: "Histórico", icon: "History" },
] as const;

export const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
