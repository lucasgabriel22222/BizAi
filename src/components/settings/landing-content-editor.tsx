"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { mergeLandingConfig } from "@/lib/landing-defaults";
import type { LandingConfig } from "@/lib/landing-types";
import { Plus, Trash2, Save, ExternalLink } from "lucide-react";

interface LandingContentEditorProps {
  userName: string;
  specialty: string;
  avatar: string;
  slug: string;
  storedConfig: unknown;
  landingPublished?: boolean;
}

export function LandingContentEditor({
  userName,
  specialty,
  avatar,
  slug,
  storedConfig,
  landingPublished = true,
}: LandingContentEditorProps) {
  const [config, setConfig] = useState<LandingConfig>(() =>
    mergeLandingConfig(storedConfig, userName, specialty)
  );
  const [profile, setProfile] = useState({ name: userName, specialty, avatar: avatar || "" });
  const [published, setPublished] = useState(landingPublished);
  const [loading, setLoading] = useState(false);

  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/agendar/${slug}`
      : `/agendar/${slug}`;

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          specialty: profile.specialty,
          avatar: profile.avatar || "",
          landingConfig: config,
          landingPublished: published,
          landingHeadline: `${config.hero.titleLine1} ${config.hero.titleHighlight}`,
          landingBio: config.about.paragraphs.join("\n\n"),
          yearsExperience: parseInt(config.hero.stats[0]?.num || "0", 10) || undefined,
          education: config.credentials[0]?.value,
          specializationText: config.credentials[1]?.value,
          officeAddress: config.booking.info[0]?.subtitle,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Página pública atualizada!");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const updateStat = (i: number, field: "num" | "label", value: string) => {
    const stats = [...config.hero.stats];
    stats[i] = { ...stats[i], [field]: value };
    setConfig({ ...config, hero: { ...config.hero, stats } });
  };

  const updateService = (i: number, field: "name" | "desc" | "num", value: string) => {
    const items = [...config.services.items];
    items[i] = { ...items[i], [field]: value };
    setConfig({ ...config, services: { ...config.services, items } });
  };

  const updateCred = (i: number, field: "label" | "value" | "sub", value: string) => {
    const credentials = [...config.credentials];
    credentials[i] = { ...credentials[i], [field]: value };
    setConfig({ ...config, credentials });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Página pública visível para pacientes</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="font-medium">Visualizar página</p>
            <p className="text-sm text-muted-foreground break-all">{bookingUrl}</p>
          </div>
          <a href={bookingUrl} target="_blank" rel="noreferrer">
            <Button type="button" variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              Abrir site
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Perfil e foto</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Especialidade" value={profile.specialty} onChange={(e) => setProfile({ ...profile, specialty: e.target.value })} />
          <Input label="URL da foto" className="sm:col-span-2" value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} placeholder="https://..." />
          <Input label="CRP" value={config.profileCard.crp} onChange={(e) => setConfig({ ...config, profileCard: { ...config.profileCard, crp: e.target.value } })} />
          <Input label="Tags (separadas por vírgula)" value={config.profileCard.tags.join(", ")} onChange={(e) => setConfig({ ...config, profileCard: { ...config.profileCard, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) } })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hero (topo da página)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Badge" value={config.hero.badge} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, badge: e.target.value } })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Título linha 1" value={config.hero.titleLine1} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, titleLine1: e.target.value } })} />
            <Input label="Destaque (gradiente)" value={config.hero.titleHighlight} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, titleHighlight: e.target.value } })} />
            <Input label="Título linha 3" value={config.hero.titleLine3} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, titleLine3: e.target.value } })} />
          </div>
          <Textarea label="Subtítulo" value={config.hero.subtitle} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })} />
          {config.hero.stats.map((s, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2 rounded-xl border border-border/50 p-3">
              <Input label={`Stat ${i + 1} — número`} value={s.num} onChange={(e) => updateStat(i, "num", e.target.value)} />
              <Input label={`Stat ${i + 1} — label`} value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)} />
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Botão principal" value={config.hero.ctaPrimary} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaPrimary: e.target.value } })} />
            <Input label="Botão secundário" value={config.hero.ctaSecondary} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaSecondary: e.target.value } })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Badges flutuantes (card da foto)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {config.floatBadges.map((b, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2 rounded-xl border p-3">
              <Input label="Título" value={b.title} onChange={(e) => { const floatBadges = [...config.floatBadges]; floatBadges[i] = { ...b, title: e.target.value }; setConfig({ ...config, floatBadges }); }} />
              <Input label="Subtítulo" value={b.subtitle} onChange={(e) => { const floatBadges = [...config.floatBadges]; floatBadges[i] = { ...b, subtitle: e.target.value }; setConfig({ ...config, floatBadges }); }} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sobre</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Chip" value={config.about.chip} onChange={(e) => setConfig({ ...config, about: { ...config.about, chip: e.target.value } })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Título" value={config.about.title} onChange={(e) => setConfig({ ...config, about: { ...config.about, title: e.target.value } })} />
            <Input label="Destaque" value={config.about.titleHighlight} onChange={(e) => setConfig({ ...config, about: { ...config.about, titleHighlight: e.target.value } })} />
          </div>
          <Input label="Complemento do título" value={config.about.titleSuffix} onChange={(e) => setConfig({ ...config, about: { ...config.about, titleSuffix: e.target.value } })} />
          {config.about.paragraphs.map((p, i) => (
            <Textarea key={i} label={`Parágrafo ${i + 1}`} value={p} onChange={(e) => { const paragraphs = [...config.about.paragraphs]; paragraphs[i] = e.target.value; setConfig({ ...config, about: { ...config.about, paragraphs } }); }} />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setConfig({ ...config, about: { ...config.about, paragraphs: [...config.about.paragraphs, ""] } })}>
            <Plus className="h-4 w-4" /> Parágrafo
          </Button>
          <Input label="Pílulas (vírgula)" value={config.about.pills.join(", ")} onChange={(e) => setConfig({ ...config, about: { ...config.about, pills: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cards de credenciais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {config.credentials.map((c, i) => (
            <div key={i} className="space-y-2 rounded-xl border p-3">
              <Input label="Label" value={c.label} onChange={(e) => updateCred(i, "label", e.target.value)} />
              <Input label="Valor" value={c.value} onChange={(e) => updateCred(i, "value", e.target.value)} />
              <Input label="Subtítulo" value={c.sub} onChange={(e) => updateCred(i, "sub", e.target.value)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Especialidades (cards)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Título seção" value={config.services.title} onChange={(e) => setConfig({ ...config, services: { ...config.services, title: e.target.value } })} />
          <Input label="Destaque" value={config.services.titleHighlight} onChange={(e) => setConfig({ ...config, services: { ...config.services, titleHighlight: e.target.value } })} />
          <Textarea label="Subtítulo" value={config.services.subtitle} onChange={(e) => setConfig({ ...config, services: { ...config.services, subtitle: e.target.value } })} />
          {config.services.items.map((item, i) => (
            <div key={i} className="space-y-2 rounded-xl border p-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Card {item.num}</span>
                <button type="button" onClick={() => { const items = config.services.items.filter((_, j) => j !== i); setConfig({ ...config, services: { ...config.services, items } }); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
              <Input label="Número" value={item.num} onChange={(e) => updateService(i, "num", e.target.value)} />
              <Input label="Nome" value={item.name} onChange={(e) => updateService(i, "name", e.target.value)} />
              <Textarea label="Descrição" value={item.desc} onChange={(e) => updateService(i, "desc", e.target.value)} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => {
            const n = String(config.services.items.length + 1).padStart(2, "0");
            setConfig({ ...config, services: { ...config.services, items: [...config.services.items, { num: n, name: "Nova especialidade", desc: "Descrição..." }] } });
          }}>
            <Plus className="h-4 w-4" /> Card
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Menu e seções</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Link Sobre" value={config.nav.linkSobre} onChange={(e) => setConfig({ ...config, nav: { ...config.nav, linkSobre: e.target.value } })} />
            <Input label="Link Especialidades" value={config.nav.linkEspecialidades} onChange={(e) => setConfig({ ...config, nav: { ...config.nav, linkEspecialidades: e.target.value } })} />
            <Input label="Link Depoimentos" value={config.nav.linkDepoimentos} onChange={(e) => setConfig({ ...config, nav: { ...config.nav, linkDepoimentos: e.target.value } })} />
            <Input label="Botão do menu" value={config.nav.ctaText} onChange={(e) => setConfig({ ...config, nav: { ...config.nav, ctaText: e.target.value } })} />
          </div>
          <Input label="Chip — Especialidades" value={config.services.chip} onChange={(e) => setConfig({ ...config, services: { ...config.services, chip: e.target.value } })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Chip — Depoimentos" value={config.testimonials.chip} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, chip: e.target.value } })} />
            <Input label="Título — Depoimentos" value={config.testimonials.title} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, title: e.target.value } })} />
          </div>
          <Input label="Chip — Agendamento" value={config.booking.chip} onChange={(e) => setConfig({ ...config, booking: { ...config.booking, chip: e.target.value } })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Agendamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Título" value={config.booking.title} onChange={(e) => setConfig({ ...config, booking: { ...config.booking, title: e.target.value } })} />
          <Textarea label="Subtítulo" value={config.booking.subtitle} onChange={(e) => setConfig({ ...config, booking: { ...config.booking, subtitle: e.target.value } })} />
          {config.booking.info.map((item, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2 rounded-xl border p-3">
              <Input label="Título" value={item.title} onChange={(e) => { const info = [...config.booking.info]; info[i] = { ...item, title: e.target.value }; setConfig({ ...config, booking: { ...config.booking, info } }); }} />
              <Input label="Texto" value={item.subtitle} onChange={(e) => { const info = [...config.booking.info]; info[i] = { ...item, subtitle: e.target.value }; setConfig({ ...config, booking: { ...config.booking, info } }); }} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={save} loading={loading} className="w-full" size="lg">
        <Save className="h-4 w-4" />
        Salvar página pública
      </Button>
    </div>
  );
}
