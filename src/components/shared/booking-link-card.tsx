"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookingLinkCardProps {
  slug: string;
  compact?: boolean;
  className?: string;
}

export function BookingLinkCard({ slug, compact = false, className }: BookingLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customPublishedUrl, setCustomPublishedUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const publishedUrl = data?.user?.settings?.landingConfig?.publishedUrl;
        if (publishedUrl && typeof publishedUrl === "string" && publishedUrl.startsWith("http")) {
          setCustomPublishedUrl(publishedUrl);
        }
      })
      .catch(() => {});
  }, []);

  const defaultUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/agendar/${slug}`
      : `/agendar/${slug}`;

  const url = customPublishedUrl || defaultUrl;

  const displayUrl = customPublishedUrl
    ? customPublishedUrl.replace(/^https?:\/\//, "")
    : `/agendar/${slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado com sucesso!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  if (!mounted) {
    return <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-white/50">Carregando link...</div>;
  }

  if (compact) {
    return (
      <div className={cn("rounded-xl bg-gradient-brand-soft p-4", className)}>
        <div className="mb-2 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-brand-purple" />
          <p className="text-xs font-semibold text-brand-purple">Página de agendamento</p>
        </div>
        <p className="mb-3 truncate text-xs text-muted-foreground font-mono" title={url}>
          {displayUrl}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={copy}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            Copiar
          </Button>
          <a href={url} target="_blank" rel="noreferrer" className="flex-1">
            <Button size="sm" className="w-full text-xs">
              <ExternalLink className="h-3 w-3" />
              Abrir
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-brand-purple/20 bg-gradient-brand-soft p-5", className)}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand">
          <Link2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-semibold">Link do Seu Site Oficial</p>
          <p className="text-xs text-muted-foreground">
            Compartilhe seu site com os clientes. Agendamentos entram confirmados diretamente no sistema.
          </p>
        </div>
      </div>
      <code className="mb-3 block rounded-xl border border-border/50 bg-background/80 p-3 text-sm font-mono break-all">
        {url}
      </code>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copiar link
        </Button>
        <a href={url} target="_blank" rel="noreferrer">
          <Button size="sm">
            <ExternalLink className="h-4 w-4" />
            Ver site publicado
          </Button>
        </a>
      </div>
    </div>
  );
}
