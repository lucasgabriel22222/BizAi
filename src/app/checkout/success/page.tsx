"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Globe, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const [isSitePayment, setIsSitePayment] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("type") === "site") {
      setIsSitePayment(true);
    }
  }, []);

  if (isSitePayment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 font-sans text-foreground">
        <div className="mx-auto max-w-lg text-center space-y-6 bg-card border border-border p-8 rounded-2xl shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <Globe className="h-10 w-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Pagamento Confirmado!
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Seu site já foi preparado!</h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seu pedido de publicação do site foi recebido com sucesso e enviado para a nossa <strong>equipe de suporte e análise técnica</strong>.
            Em breve seu site estará no ar e você receberá uma notificação no sininho assim que a publicação for concluída!
          </p>

          <div className="rounded-xl bg-muted p-4 text-xs text-left space-y-2 border border-border">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>Status do Pedido: Pendente de Publicação</span>
            </div>
            <p className="text-muted-foreground">
              Nossa equipe já está revisando o código e ativando o certificado SSL e a hospedagem de alta performance para o seu subdomínio.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/personalizacao">
              <Button size="lg" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                Ir para Meus Sites
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 font-sans text-foreground">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Pagamento Confirmado!</h1>
        <p className="text-muted-foreground">
          Seu plano <strong>Pro</strong> já foi ativado com sucesso. Você tem acesso ilimitado a todas as funcionalidades do sistema.
        </p>
        <div className="pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="w-full gap-2">
              Ir para o Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
