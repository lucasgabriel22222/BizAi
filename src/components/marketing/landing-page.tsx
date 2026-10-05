"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  Calendar,
  Globe,
  DollarSign,
  Users,
  Clock,
  Star,
  BarChart3,
  Zap,
  Check,
  ArrowRight,
  Play,
  Shield,
  TrendingUp,
  Link2,
} from "lucide-react";
import { PremiumBackground } from "./premium-background";
import { DashboardMockup } from "./dashboard-mockup";
import { BizAiLogo } from "../shared/BizAi-logo";
import { cn } from "@/lib/utils";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const FEATURES = [
  { icon: Calendar, title: "Agenda inteligente", desc: "Visualize consultas com dados completos do paciente." },
  { icon: Globe, title: "Página profissional", desc: "Landing premium editável com sua identidade." },
  { icon: DollarSign, title: "Controle financeiro", desc: "Ganhos, médias e evolução em tempo real." },
  { icon: Users, title: "Gestão de pacientes", desc: "Histórico, contatos e observações centralizados." },
  { icon: Link2, title: "Agendamento online", desc: "Pacientes agendam 24h com link personalizado." },
  { icon: Clock, title: "Horários automáticos", desc: "Defina disponibilidade em poucos cliques." },
  { icon: Star, title: "Avaliações", desc: "Feedbacks verificados após consultas concluídas." },
  { icon: BarChart3, title: "Relatórios", desc: "Métricas claras para decisões estratégicas." },
  { icon: Zap, title: "Automação", desc: "Menos tarefas manuais, mais tempo clínico." },
];

const STEPS = [
  { n: "01", title: "Crie sua conta", desc: "Cadastro rápido com link personalizado." },
  { n: "02", title: "Configure sua agenda", desc: "Horários, pausas e valores em minutos." },
  { n: "03", title: "Compartilhe seu link", desc: "Envie para pacientes e redes sociais." },
  { n: "04", title: "Receba agendamentos", desc: "Consultas entram confirmadas automaticamente." },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    features: [
      "Dashboard completo",
      "Agenda inteligente",
      "Página pública profissional",
      "Sistema de agendamento",
      "Horários disponíveis",
      "Controle financeiro",
      "Histórico de consultas",
      "Gestão de pacientes",
      "Avaliações",
      "Página totalmente editável",
      "Link personalizado",
      "Responsivo mobile",
      "7 dias grátis",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    price: 97,
    popular: true,
    features: [
      "Tudo do Starter",
      "WhatsApp automático",
      "Lembretes automáticos",
      "Confirmação automática",
      "Reagendamento automático",
      "Relatórios avançados",
      "Google Calendar",
      "Automação completa",
    ],
  },
  {
    id: "max",
    name: "Max",
    price: 197,
    features: [
      "Tudo do Advanced",
      "Domínio próprio",
      "Multi usuários",
      "Equipe / secretária",
      "Dashboard avançado",
      "IA para atendimento",
      "API futura",
      "Recursos exclusivos",
      "Acesso antecipado",
    ],
  },
];

// Continuous Feedback Marquee Component
const FEEDBACKS = [
  {
    id: 1,
    name: "Dra. Camila Vasconcelos",
    role: "Psicóloga Clínica",
    avatar: "CV",
    stars: 5,
    text: "O BizAi mudou completamente a organização do meu consultório. Meus pacientes adoram agendar direto pela minha página.",
  },
  {
    id: 2,
    name: "Dr. Ricardo Almeida",
    role: "Terapeuta Cognitivo-Comportamental",
    avatar: "RA",
    stars: 5,
    text: "A IA para criação da landing page publicou meu site em menos de 2 minutos! Profissionalismo impecável.",
  },
  {
    id: 3,
    name: "Fernanda Lima",
    role: "Psicanalista & Mentora",
    avatar: "FL",
    stars: 5,
    text: "Reduzi a inadimplência a zero e minhas faltas caíram 80% com as automações de lembretes. Recomendo fortemente.",
  },
  {
    id: 4,
    name: "Dr. Marcelo Siqueira",
    role: "Psiquiatra e Neurologista",
    avatar: "MS",
    stars: 5,
    text: "Interface escura moderna, minimalista e rápida. O controle financeiro integrado me dá visão exata do faturamento diário.",
  },
  {
    id: 5,
    name: "Dra. Juliana Mendes",
    role: "Psicopedagoga",
    avatar: "JM",
    stars: 5,
    text: "Sistema completo, substituiu 3 ferramentas pagas que eu usava antes. O BizAi entrega tudo o que promete.",
  },
  {
    id: 6,
    name: "Lucas Barbosa",
    role: "Gestor de Clínica Multidisciplinar",
    avatar: "LB",
    stars: 5,
    text: "A facilidade de personalizar o site com nossas cores e links de redes sociais é fantástica. Suporte muito atencioso.",
  }
];

function FeedbackMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      {/* Left/Right Fade Gradient Masks */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-black to-transparent" />

      <motion.div
        className="flex gap-6 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          ease: "linear",
          duration: 30,
          repeat: Infinity,
        }}
      >
        {[...FEEDBACKS, ...FEEDBACKS].map((fb, idx) => (
          <div
            key={`${fb.id}-${idx}`}
            className="w-[320px] sm:w-[380px] shrink-0 rounded-2xl border border-white/10 bg-[#08080a] p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-white/20 hover:bg-[#0c0c10]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-sm text-white border border-white/10">
                  {fb.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{fb.name}</h4>
                  <p className="text-xs text-white/40">{fb.role}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-amber-400">
              {Array.from({ length: fb.stars }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="mt-4 text-xs text-white/70 leading-relaxed font-sans">
              "{fb.text}"
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [planPrice, setPlanPrice] = useState<number>(97);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.config?.proPlanPrice) {
          setPlanPrice(Number(data.config.proPlanPrice));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="relative min-h-screen text-white selection:bg-white/20">
      <PremiumBackground />

      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-white/10 bg-black/80 backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <BizAiLogo size={40} />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              { label: "Recursos", href: "#recursos" },
              { label: "Depoimentos", href: "#depoimentos" },
              { label: "Planos", href: "#planos" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-neutral-400 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-400 hover:text-white transition px-3 py-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Teste grátis Starter
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-4 pb-24 pt-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ContainerScroll
            titleComponent={
              <div className="text-center mb-4">
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SaaS premium para profissionais
                </motion.span>

                <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-white">
                  Transforme sua empresa em uma{" "}
                  <br />
                  <span className="text-white text-4xl md:text-6xl font-black mt-2 leading-tight block">
                    máquina de gestão.
                  </span>
                </h1>

                <p className="mx-auto mt-8 max-w-2xl text-base md:text-lg text-neutral-400 leading-relaxed">
                  Automatize processos, elimine tarefas desnecessárias e tenha mais controle sobre sua operação — economizando tempo, reduzindo custos e deixando sua empresa trabalhar por você.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Começar teste grátis — Starter
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-medium backdrop-blur-sm transition hover:bg-white/10 text-white active:scale-[0.98]"
                  >
                    Entrar na minha conta
                  </Link>
                  <a
                    href="#depoimentos"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-8 py-3.5 text-sm font-medium text-neutral-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <Star className="h-4 w-4 text-amber-400" />
                    Ver depoimentos
                  </a>
                </div>

                <p className="mt-4 text-xs text-neutral-500 mb-12">
                  1 dia grátis no plano Starter · Sem cartão de crédito · Cancele quando quiser
                </p>
              </div>
            }
          >
            <DashboardMockup />
          </ContainerScroll>
        </div>
      </section>

      <section id="recursos" className="px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Tudo que sua empresa precisa</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/50">
              Recursos pensados para profissionais que valorizam organização e imagem premium.
            </p>
          </FadeIn>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.05}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/40">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl opacity-0 transition group-hover:opacity-100" />
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-white/60">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/50">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Como funciona</h2>
          </FadeIn>
          <div className="relative mt-16">
            <div className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent md:left-1/2 md:block" />
            <div className="space-y-12">
              {STEPS.map((step, i) => (
                <FadeIn key={step.n} delay={i * 0.1}>
                  <div
                    className={cn(
                      "relative flex flex-col gap-4 md:w-1/2",
                      i % 2 === 0 ? "md:mr-auto md:pr-12 md:text-right" : "md:ml-auto md:pl-12"
                    )}
                  >
                    <span className="text-4xl font-bold text-white/20">{step.n}</span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-white/50">{step.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="depoimentos" className="px-4 py-24 lg:px-8 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold sm:text-4xl">O que nossos clientes dizem</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/50">
              Profissionais de todo o Brasil confiam no BizAi para impulsionar seus negócios.
            </p>
          </FadeIn>
          <FeedbackMarquee />
        </div>
      </section>

      <section className="px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/[0.02] p-8 lg:p-12">
          <FadeIn>
            <h2 className="text-3xl font-bold">Por que psicólogos escolhem o BizAi</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Menos faltas com lembretes",
                "Organização total da clínica",
                "Imagem profissional premium",
                "Automação de agendamentos",
                "Experiência moderna para pacientes",
                "Mais consultas confirmadas",
              ].map((b) => (
                <div key={b} className="flex items-center gap-3 text-sm text-white/80">
                  <Check className="h-5 w-5 shrink-0 text-emerald-400" />
                  {b}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="planos" className="relative w-full bg-black py-24 font-sans text-white sm:py-32 selection:bg-white selection:text-black">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          {/* Header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="mb-4 max-w-2xl text-balance text-4xl font-medium tracking-tighter text-white sm:text-5xl lg:text-6xl">
              Preços transparentes. <br className="hidden sm:block" />
              <span className="text-neutral-500">Escala sem limites.</span>
            </h2>
            <p className="max-w-xl text-balance text-base text-neutral-400 sm:text-lg">
              Um único plano completo com todas as funcionalidades liberadas. Sem taxas ocultas. Cancelamento simples.
            </p>

            {/* Billing Toggle */}
            <div className="mt-10 flex items-center gap-3">
              <span className={cn("text-sm font-medium", !isAnnual ? "text-white" : "text-neutral-500")}>Mensal</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-white/[0.12] transition-colors hover:bg-white/[0.2]"
                aria-label="Alternar ciclo de cobrança"
              >
                <div
                  className={cn(
                    "absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out",
                    isAnnual ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <span className={cn("flex items-center gap-2 text-sm font-medium", isAnnual ? "text-white" : "text-neutral-500")}>
                Anual
                <span className="rounded-full bg-white/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
                  Economize 20%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Card - Single Pro Plan */}
          <div className="mx-auto max-w-xl">
            <div className="relative flex flex-col rounded-2xl border border-white/[0.25] bg-black p-8 sm:p-10 shadow-2xl">
              {/* Top Highlight Accent */}
              <div className="absolute inset-x-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-white to-transparent" />
              
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Plano Pro</h3>
                  <p className="mt-2 text-sm text-neutral-400">Acesso completo e ilimitado a todas as ferramentas do sistema.</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
                  Tudo Incluso
                </span>
              </div>
              
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tighter text-white">
                  R$ {isAnnual ? Math.round(planPrice * 0.8) : planPrice}
                </span>
                <span className="text-base font-medium text-neutral-400">
                  / mês
                </span>
              </div>
              
              <Link
                href="/checkout/transparent"
                className="mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-base font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-white/10"
              >
                Assinar Plano Pro
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <div className="mb-6 h-px w-full bg-white/[0.1]" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-200">
                {[
                  "Dashboard completo",
                  "Agenda inteligente",
                  "Site/Landing editável",
                  "WhatsApp automático",
                  "IA para atendimento",
                  "Lembretes & confirmações",
                  "Gestão de pacientes",
                  "Controle financeiro",
                  "Equipe & multi-usuários",
                  "Domínio próprio",
                  "Relatórios avançados",
                  "Suporte prioritário 24/7",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-white" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO FAQ - PERGUNTAS E RESPOSTAS */}
      <section id="faq" className="px-4 py-24 lg:px-8 bg-black/60 border-t border-white/10">
        <div className="mx-auto max-w-4xl">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Perguntas Frequentes</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/50">
              Tire todas as suas dúvidas sobre o BizAi e a geração de sites via IA.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {[
              {
                q: "Como funciona a geração automática de site via IA?",
                a: "Basta preencher os dados do seu negócio (nome, nicho, WhatsApp, serviços e cores da marca). Nossa IA integrada cria o código completo da sua Landing Page otimizada e responsiva em segundos.",
              },
              {
                q: "Quantas gerações gratuitas eu tenho direito?",
                a: "No plano gratuito de avaliação, você pode gerar a Landing Page 1 única vez para visualizar o resultado profissional. Para gerar novos modelos ou realizar edições ilimitadas, basta assinar o plano BizAi Pro.",
              },
              {
                q: "Como funciona a taxa de ativação de R$ 397,00?",
                a: "A taxa de ativação é um pagamento único que cobre o registro do seu domínio, a configuração da hospedagem de alta performance e a emissão do certificado SSL de segurança.",
              },
              {
                q: "Como o agendamento de clientes se conecta ao meu WhatsApp?",
                a: "Todos os botões de CTA e agendamento gerados no site redirecionam diretamente o cliente para o seu número de WhatsApp formatado, com uma mensagem personalizada sobre o serviço desejado.",
              },
              {
                q: "Posso cancelar minha assinatura a qualquer momento?",
                a: "Sim! Não há fidelidade ou multa rescisória. Você pode gerenciar ou cancelar sua assinatura diretamente no painel do cliente quando desejar.",
              },
            ].map((faq, idx) => (
              <FadeIn key={idx} delay={idx * 0.05}>
                <details className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition duration-300 [&_summary::-webkit-details-marker]:hidden open:bg-white/[0.04] open:border-white/20">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-white text-base">
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 rounded-full border border-white/10 p-1 transition group-open:-rotate-180">
                      <ArrowRight className="h-4 w-4 text-white/60 rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-4 text-sm text-neutral-400 leading-relaxed font-sans border-t border-white/5 pt-4">
                    {faq.a}
                  </p>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#050505] p-12 text-center backdrop-blur-sm shadow-2xl shadow-black/50">
            <Shield className="mx-auto h-10 w-10 text-white" />
            <h2 className="mt-4 text-3xl font-bold">Pronto para elevar sua empresa?</h2>
            <p className="mt-4 text-white/60">
              Junte-se a profissionais que já operam com padrão internacional.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200 cursor-pointer"
            >
              <TrendingUp className="h-4 w-4" />
              Começar teste grátis — 1 dia Starter
            </Link>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-white/10 px-4 py-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <BizAiLogo size={32} />
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-white/50">
            <Link href="#recursos">Recursos</Link>
            <Link href="#planos">Planos</Link>
            <Link href="#faq">FAQ</Link>
            <Link href="/login">Login</Link>
            <span>Termos</span>
            <span>Privacidade</span>
          </div>
          <p className="text-xs text-white/30">© {new Date().getFullYear()} BizAi</p>
        </div>
      </footer>
    </div>
  );
}


