"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BizAiLogo } from "@/components/shared/BizAi-logo";

function PixModalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const qrCode = searchParams.get("code") || "";
  const qrCodeBase64 = searchParams.get("qr") || "";
  const paymentId = searchParams.get("pid") || "";

  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "approved" | "error">("pending");
  const [polling, setPolling] = useState(true);

  const handleCopy = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast.success("Código PIX copiado com sucesso!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId || paymentStatus === "approved") return;
    try {
      const res = await fetch(`/api/checkout/status?id=${paymentId}`);
      const data = await res.json();
      if (data.status === "approved") {
        setPaymentStatus("approved");
        setPolling(false);
        toast.success("Pagamento confirmado! Seu plano Pro foi ativado!");
      }
    } catch {
      // silently retry
    }
  }, [paymentId, paymentStatus]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(checkPaymentStatus, 4000);
    return () => clearInterval(interval);
  }, [polling, checkPaymentStatus]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-600/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <BizAiLogo className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Pagamento 100% Seguro</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {paymentStatus === "approved" ? (
            /* TELA DE CONFIRMADO */
            <div className="bg-[#121216] border border-emerald-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="h-14 w-14" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Pagamento Confirmado!</h1>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Seu plano <strong className="text-white">BizAi Pro</strong> foi ativado com sucesso. Todas as funcionalidades já estão liberadas na sua conta.
                </p>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <Button size="lg" className="w-full gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm h-12 rounded-xl shadow-lg shadow-emerald-500/20" onClick={() => router.push("/dashboard")}>
                  <Sparkles className="h-4 w-4" />
                  Acessar meu Dashboard
                </Button>
                <Link href="/" className="text-xs text-neutral-400 hover:text-white text-center block pt-2">
                  Voltar para a página inicial
                </Link>
              </div>
            </div>
          ) : (
            /* TELA DO PIX ESTILO MISTER CONTAS / BizAi DARK */
            <div className="bg-[#121216] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              
              {/* Header do Card */}
              <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white uppercase">Checkout Transparente</h1>
                  <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">Pagamento Instantâneo via PIX</p>
                </div>
              </div>

              {/* Container do QR Code */}
              {qrCodeBase64 ? (
                <div className="flex justify-center py-2">
                  <div className="p-4 bg-white rounded-3xl shadow-2xl border border-white/20">
                    <img
                      src={`data:image/png;base64,${qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-56 h-56 object-contain rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                  <p className="text-xs text-neutral-400">Gerando código PIX...</p>
                </div>
              )}

              {/* Status Polling Badge */}
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-xl py-2.5 px-4 shadow-inner">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>

              {/* Copia e Cola */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Código PIX Copia e Cola
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 font-mono text-xs text-neutral-300 truncate">
                    {qrCode || "Carregando código..."}
                  </div>
                  <Button 
                    onClick={handleCopy} 
                    className="shrink-0 font-extrabold uppercase text-xs h-auto px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all active:scale-95"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1.5" />
                    )}
                    <span>{copied ? "Copiado!" : "Copiar Código"}</span>
                  </Button>
                </div>
              </div>

              {/* Instruções de Pagamento */}
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2 text-xs text-neutral-400 leading-relaxed">
                <p className="font-bold text-white text-xs">Como pagar:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Abra o app do seu banco e escolha a opção <strong>PIX</strong>.</li>
                  <li>Selecione <strong>Ler QR Code</strong> ou a opção <strong>PIX Copia e Cola</strong>.</li>
                  <li>Confirme o pagamento. A liberação ocorre <strong>instantaneamente</strong>!</li>
                </ol>
              </div>

              {/* Botão de Voltar */}
              <div className="text-center pt-2">
                <Link
                  href="/checkout/transparent"
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar ao checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PixModalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <PixModalContent />
    </Suspense>
  );
}

