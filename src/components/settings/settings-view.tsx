"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ImageIcon,
  MessageSquare,
  Settings,
  Sparkles,
  Layout,
  Palette,
  Instagram,
  Phone,
  Facebook,
  Video,
  Linkedin,
  Share2,
  Bot,
  Briefcase,
  ExternalLink,
  Copy,
  Wand2,
} from "lucide-react";
import { ReviewsSettingsTab } from "./reviews-settings-tab";
import { LandingPageGenerator } from "@/components/site/landing-page-generator";
import { cn } from "@/lib/utils";

type Tab = "generator" | "site" | "reviews" | "clinic";

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    slug: string;
    specialty: string;
    avatar?: string | null;
    galleryImages?: { id: string; imageUrl: string; caption?: string | null }[];
    reviews?: { id: string; authorName: string; rating: number; comment: string; status: string; createdAt: string }[];
    subscription?: {
      id: string;
      plan: string;
      status: string;
    } | null;
    settings?: {
      landingConfig?: any;
      defaultDuration: number;
      defaultPrice: number;
      workStartHour: number;
      workEndHour: number;
      emailNotifications: boolean;
      pushNotifications: boolean;
      reminderMinutes: number;
      theme: string;
      landingHeadline?: string | null;
      landingBio?: string | null;
      yearsExperience?: number | null;
      birthPlace?: string | null;
      education?: string | null;
      specializationText?: string | null;
      officeAddress?: string | null;
      officeCity?: string | null;
      officeState?: string | null;
      officeZip?: string | null;
      showBirthPlace?: boolean;
      landingPublished?: boolean;
    } | null;
  };
}

const TABS: { id: Tab; label: string; icon: typeof Globe }[] = [
  { id: "site", label: "Criar & Personalizar Site", icon: Globe },
  { id: "reviews", label: "Feedbacks", icon: MessageSquare },
  { id: "clinic", label: "Clínica e sistema", icon: Settings },
];

export function SettingsView({ user }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState<Tab>("site");
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const config = (user.settings?.landingConfig as any) || {};

  // Estados da aba "Site"
  const [niche, setNiche] = useState(config.niche || "Psicólogo(a)");
  const [businessPrompt, setBusinessPrompt] = useState(config.businessPrompt || "");
  const [socials, setSocials] = useState({
    instagram: config.socials?.instagram || "",
    whatsapp: config.socials?.whatsapp || "",
    facebook: config.socials?.facebook || "",
    tiktok: config.socials?.tiktok || "",
    youtube: config.socials?.youtube || "",
    linkedin: config.socials?.linkedin || "",
  });

  const [primaryColor, setPrimaryColor] = useState(config.primaryColor || "#6366f1");
  const [secondaryColor, setSecondaryColor] = useState(config.secondaryColor || "#3b82f6");
  const [activeSections, setActiveSections] = useState({
    hero: config.activeSections?.hero !== false,
    about: config.activeSections?.about !== false,
    specialties: config.activeSections?.specialties !== false,
    testimonials: config.activeSections?.testimonials !== false,
    stats: config.activeSections?.stats !== false,
    faq: config.activeSections?.faq !== false,
    location: config.activeSections?.location !== false,
    cta: config.activeSections?.cta !== false,
    social: config.activeSections?.social !== false,
    footer: config.activeSections?.footer !== false,
  });

  const handleSectionToggle = (key: keyof typeof activeSections) => {
    setActiveSections({ ...activeSections, [key]: !activeSections[key] });
  };

  const handleSaveSiteConfig = async () => {
    setLoading(true);
    try {
      const newConfig = {
        ...config,
        niche,
        businessPrompt,
        socials,
        primaryColor,
        secondaryColor,
        activeSections,
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landingConfig: newConfig,
        }),
      });

      if (res.ok) {
        toast.success("Configurações do site salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar configurações do site.");
      }
    } catch {
      toast.error("Erro de conexão ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.password,
        }),
      });

      if (res.ok) {
        toast.success("Senha alterada com sucesso!");
        setPasswordData({ currentPassword: "", password: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao alterar senha");
      }
    } catch {
      toast.error("Erro na requisição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-foreground">
      {/* Navegação de Abas */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                tab === t.id
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ABA UNIFICADA: SITE */}
      {tab === "site" && (
        <div className="pt-2">
          <LandingPageGenerator />
        </div>
      )}




      {/* ABA 4: FEEDBACKS */}
      {tab === "reviews" && (
        <ReviewsSettingsTab initialReviews={user.reviews || []} />
      )}

      {/* ABA 5: CLÍNICA E SISTEMA */}
      {tab === "clinic" && (
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                Aparência do Painel
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              {["light", "dark", "system"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border text-xs font-bold capitalize transition-all",
                    theme === t
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Senha Atual"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
                <Input
                  label="Nova Senha"
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                />
                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Alterando..." : "Salvar Nova Senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
