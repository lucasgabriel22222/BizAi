"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Wallet,
  Lock, 
  Info,
  Tag,
  User,
  Mail,
  Phone,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BizAiLogo } from "@/components/shared/BizAi-logo";

function isValidEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(trimmed)) return false;

  const domain = trimmed.split("@")[1];
  if (!domain || domain.length < 4) return false;

  const invalidDomains = [
    "teste.com", "test.com", "exemplo.com", "example.com", 
    "asdf.com", "123.com", "mailinator.com", "tempmail.com", 
    "yopmail.com", "qq.com", "abc.com", "fake.com"
  ];
  if (invalidDomains.includes(domain)) return false;

  return true;
}

export default function TransparentCheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "mercadopago">("pix");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preço vindo do Admin
  const [basePrice, setBasePrice] = useState<number>(97);
  const [productTitle, setProductTitle] = useState<string>("Plano BizAi Pro");
  const [productType, setProductType] = useState<"subscription" | "site">("subscription");
  const [availableCoupons, setAvailableCoupons] = useState<Array<{ code: string; discountPercent: number }>>([]);

  // Form states - Dados Pessoais Obrigatórios
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  // Form states - Cartão de Crédito
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Cupom de desconto
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get("type");
    if (typeParam === "site") {
      setProductType("site");
      setProductTitle("Licenciamento & Publicação de Site");
      setBasePrice(397);
    } else {
      fetch("/api/admin/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.config?.proPlanPrice) {
            setBasePrice(Number(data.config.proPlanPrice));
          }
          if (data.coupons && Array.isArray(data.coupons)) {
            setAvailableCoupons(data.coupons);
          }
        })
        .catch(() => {});
    }
  }, []);

  const discountAmount = appliedCoupon ? (basePrice * appliedCoupon.discountPercent) / 100 : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    const cleanCoupon = coupon.trim().toUpperCase();

    // Procura nos cupons do admin primeiro
    const foundAdminCoupon = availableCoupons.find((c) => c.code === cleanCoupon);
    if (foundAdminCoupon) {
      setAppliedCoupon({ code: foundAdminCoupon.code, discountPercent: foundAdminCoupon.discountPercent });
      toast.success(`Cupom ${foundAdminCoupon.code} aplicado! ${foundAdminCoupon.discountPercent}% de desconto.`);
      return;
    }

    // Cupons padrões fallback
    if (cleanCoupon === "BizAi10") {
      setAppliedCoupon({ code: "BizAi10", discountPercent: 10 });
      toast.success("Cupom BizAi10 aplicado! 10% de desconto.");
    } else if (cleanCoupon === "PRO50") {
      setAppliedCoupon({ code: "PRO50", discountPercent: 50 });
      toast.success("Cupom PRO50 aplicado! 50% de desconto.");
    } else {
      toast.error("Cupom inválido ou expirado.");
    }
  };

  const validatePersonalDetails = () => {
    if (!fullName.trim() || fullName.trim().split(" ").length < 2) {
      toast.error("Por favor, informe seu nome completo (nome e sobrenome).");
      return false;
    }
    if (!email.trim() || !isValidEmail(email)) {
      toast.error("Por favor, insira um endereço de e-mail válido (ex: seu@gmail.com).");
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Por favor, informe um número de telefone/celular válido com DDD.");
      return false;
    }
    if (!cpf.trim() || cpf.replace(/\D/g, "").length < 11) {
      toast.error("Por favor, informe um CPF válido com 11 dígitos.");
      return false;
    }
    return true;
  };

  const handleGeneratePix = async () => {
    if (!validatePersonalDetails()) return;
    if (!acceptedTerms) {
      toast.error("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fullName.split(" ")[0],
          lastName: fullName.split(" ").slice(1).join(" "),
          docNumber: cpf.replace(/\D/g, ""),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          amount: finalPrice,
        }),
      });

      const data = await res.json();

      if (data.qrCode) {
        const params = new URLSearchParams({
          code: data.qrCode,
          qr: data.qrCodeBase64 || "",
          pid: String(data.paymentId || ""),
        });
        router.push(`/checkout/pix-modal?${params.toString()}`);
      } else {
        toast.error(data.error || "Não foi possível gerar o código PIX.");
      }
    } catch (err) {
      toast.error("Ocorreu um erro ao conectar com o serviço de pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePersonalDetails()) return;

    if (!cardHolder.trim() || !cardNumber.trim() || !cardExp.trim() || !cardCvc.trim()) {
      toast.error("Preencha todos os dados do cartão de crédito (Titular, Número, Validade e CVV).");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          phone: phone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
          cardHolder: cardHolder.trim(),
          cardNumber: cardNumber.replace(/\D/g, ""),
          cardExp: cardExp.trim(),
          cardCvc: cardCvc.trim(),
          amount: finalPrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Pagamento aprovado com sucesso!");
        if (productType === "site") {
          router.push("/checkout/success?type=site");
        } else {
          router.push("/checkout/success");
        }
      } else {
        toast.error(data.error || "Pagamento não aprovado. Verifique os dados do cartão.");
      }
    } catch (err) {
      toast.error("Ocorreu um erro ao processar o pagamento com cartão.");
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPagoWallet = async () => {
    if (!validatePersonalDetails()) return;
    if (!acceptedTerms) {
      toast.error("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalPrice }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error("Não foi possível iniciar o checkout do Mercado Pago.");
      }
    } catch (err) {
      toast.error("Erro ao redirecionar para o Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <BizAiLogo className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Lock className="h-4 w-4 text-emerald-500" />
          <span>Checkout 100% Seguro & Criptografado</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Formulário de Checkout */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">{productTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha a melhor forma de pagamento para liberar seu acesso instantâneo.
            </p>
          </div>

          {/* Abas de Pagamento */}
          <div className="grid grid-cols-3 gap-2 bg-muted p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setPaymentMethod("pix")}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs font-bold transition-all ${
                paymentMethod === "pix"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <QrCode className="h-4 w-4 text-emerald-500" />
              <span>PIX</span>
            </button>

            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs font-bold transition-all ${
                paymentMethod === "card"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span>Cartão</span>
            </button>

            <button
              onClick={() => setPaymentMethod("mercadopago")}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs font-bold transition-all ${
                paymentMethod === "mercadopago"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="h-4 w-4 text-sky-500" />
              <span>Mercado Pago</span>
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* SEÇÃO OBRIGATÓRIA: DADOS PESSOAIS DO CLIENTE */}
            <div className="space-y-4 border-b border-border pb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados do Titular da Assinatura (Obrigatórios)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ex: Lucas Anjos"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Seu E-mail Real *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seuemail@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Telefone / Celular (com DDD) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">CPF do Titular *</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Aba PIX */}
            {paymentMethod === "pix" && (
              <div className="space-y-6 pt-2">
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start gap-3 text-emerald-600 dark:text-emerald-400">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold">Aprovação imediata via PIX</p>
                    <p>Ao clicar em "Gerar PIX", você será redirecionado para a tela com o QR Code e o código Copia e Cola para concluir o pagamento no seu banco.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo Aba Cartão */}
            {paymentMethod === "card" && (
              <form onSubmit={handleCardPayment} className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Dados do Cartão de Crédito (Obrigatórios)
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Nome Impresso no Cartão *</label>
                    <Input 
                      placeholder="NOME COMO ESTÁ NO CARTÃO"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="uppercase text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Número do Cartão *</label>
                    <Input 
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="font-mono text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Validade (MM/AA) *</label>
                      <Input 
                        placeholder="MM/AA"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        maxLength={5}
                        className="font-mono text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Código de Segurança (CVV) *</label>
                      <Input 
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        maxLength={4}
                        className="font-mono text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Conteúdo Aba Mercado Pago Wallet */}
            {paymentMethod === "mercadopago" && (
              <div className="space-y-4 pt-2">
                <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-4 flex items-start gap-3 text-sky-600 dark:text-sky-400">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold">Pague com sua conta Mercado Pago</p>
                    <p>Você será redirecionado para o ambiente seguro do Mercado Pago para concluir o pagamento com saldo ou cartões salvos.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Checkbox de Termos de Uso (OBRIGATÓRIO) */}
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-snug select-none cursor-pointer">
                  Li e aceito os <Link href="#" className="underline font-semibold text-foreground">Termos de Uso</Link> e a <Link href="#" className="underline font-semibold text-foreground">Política de Privacidade</Link>.*
                </label>
              </div>

              {/* Botão Principal de Finalização */}
              {paymentMethod === "pix" && (
                <Button
                  onClick={handleGeneratePix}
                  disabled={!acceptedTerms || loading}
                  className="w-full h-12 text-sm font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  {loading ? "Gerando PIX..." : `Gerar PIX de R$ ${finalPrice.toFixed(2).replace(".", ",")}`}
                </Button>
              )}

              {paymentMethod === "card" && (
                <Button
                  onClick={handleCardPayment}
                  disabled={!acceptedTerms || loading}
                  className="w-full h-12 text-sm font-bold gap-2 bg-foreground text-background hover:opacity-90 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  {loading ? "Processando Cartão..." : `Pagar R$ ${finalPrice.toFixed(2).replace(".", ",")} no Cartão`}
                </Button>
              )}

              {paymentMethod === "mercadopago" && (
                <Button
                  onClick={handleMercadoPagoWallet}
                  disabled={!acceptedTerms || loading}
                  className="w-full h-12 text-sm font-bold gap-2 bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50"
                >
                  <Wallet className="h-4 w-4" />
                  {loading ? "Redirecionando..." : `Pagar R$ ${finalPrice.toFixed(2).replace(".", ",")} via Mercado Pago`}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Resumo do Pedido & Benefícios */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resumo do Pedido</span>
              <h3 className="text-xl font-extrabold mt-1">{productTitle}</h3>
            </div>

            <div className="space-y-3 border-b border-border pb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">{productType === "site" ? "Valor de Ativação" : "Valor Mensal"}</span>
                <div className="text-right">
                  <span className="text-2xl font-black">R$ {basePrice.toFixed(2).replace(".", ",")}</span>
                  {productType === "subscription" && <span className="text-xs text-muted-foreground block">/ mês</span>}
                </div>
              </div>

              {/* Cupom aplicado */}
              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs text-emerald-500 font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Tag className="h-3.5 w-3.5" />
                    Cupom {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
                  </span>
                  <span>- R$ {discountAmount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-base font-bold">
                <span>Total a pagar</span>
                <span className="text-xl text-emerald-500">R$ {finalPrice.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            {/* Campo de Cupom */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Cupom de Desconto
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="EX: BizAi10 ou PRO50"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  className="font-mono text-xs uppercase"
                />
                <Button onClick={handleApplyCoupon} variant="secondary" className="shrink-0 text-xs font-bold">
                  Aplicar
                </Button>
              </div>
            </div>

            {/* Lista de Benefícios */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">O que está incluso:</span>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  "Agenda inteligente & Horários automáticos",
                  "Site/Página pública customizada",
                  "Integração completa com WhatsApp",
                  "Atendente com Inteligência Artificial",
                  "Lembretes e confirmações automáticas",
                  "Gestão completa de pacientes e prontuários",
                  "Controle financeiro detalhado",
                  "Gestão de equipe e secretária",
                  "Suporte prioritário"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selos de Segurança */}
            <div className="pt-4 border-t border-border flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Garantia de satisfação com suporte dedicado 24/7.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

