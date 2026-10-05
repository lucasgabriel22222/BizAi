import type { LandingConfig } from "./landing-types";

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  hero: {
    badge: "Disponível para novos pacientes",
    titleLine1: "Cuidando da sua",
    titleHighlight: "saúde mental",
    titleLine3: "com excelência",
    subtitle:
      "Especialista em ansiedade, TCC e desenvolvimento pessoal. Atendimento presencial e online para todo o Brasil.",
    stats: [
      { num: "8+", label: "Anos de experiência" },
      { num: "500+", label: "Pacientes atendidos" },
      { num: "98%", label: "Satisfação" },
    ],
    ctaPrimary: "Agendar consulta",
    ctaSecondary: "Conhecer mais",
  },
  profileCard: {
    crp: "CRP 06/00000",
    tags: ["Ansiedade", "TCC", "Depressão", "Burnout"],
    ratingText: "5.0 · avaliações",
  },
  floatBadges: [
    { title: "CRP Ativo", subtitle: "Verificado pelo CFP" },
    { title: "Próx. disponível", subtitle: "Consulte a agenda" },
  ],
  about: {
    chip: "✦ Sobre mim",
    title: "Uma abordagem",
    titleHighlight: "humanizada",
    titleSuffix: "para resultados reais",
    paragraphs: [
      "Psicólogo clínico com formação sólida e anos dedicados ao cuidado da saúde mental. Minha prática é fundamentada na Terapia Cognitivo-Comportamental (TCC).",
      "Acredito que cada pessoa carrega uma história única. Por isso, construo um espaço seguro e sem julgamentos onde você pode ser quem realmente é.",
    ],
    pills: [
      "Ansiedade",
      "Depressão",
      "Burnout",
      "Relacionamentos",
      "Autoestima",
      "Desenvolvimento pessoal",
    ],
  },
  credentials: [
    {
      label: "Formação",
      value: "Bacharelado em Psicologia",
      sub: "Universidade — Ano de conclusão",
    },
    {
      label: "Especialização",
      value: "Terapia Cognitivo-Comportamental",
      sub: "Pós-graduação",
    },
    {
      label: "Registro profissional",
      value: "CRP 00/00000",
      sub: "Conselho Regional de Psicologia — Ativo",
    },
    {
      label: "Atendimento",
      value: "Presencial & Online",
      sub: "Consultório · Todo o Brasil via plataforma",
    },
  ],
  services: {
    chip: "✦ Especialidades",
    title: "O que posso",
    titleHighlight: "fazer por você",
    subtitle:
      "Abordagens terapêuticas baseadas em evidências para promover bem-estar duradouro.",
    items: [
      {
        num: "01",
        name: "Ansiedade & Pânico",
        desc: "Técnicas cognitivas e comportamentais para controlar pensamentos intrusivos e preocupações excessivas.",
      },
      {
        num: "02",
        name: "Depressão",
        desc: "Tratamento humanizado para recuperar motivação, prazer nas atividades e qualidade de vida.",
      },
      {
        num: "03",
        name: "Burnout & Estresse",
        desc: "Estratégias para lidar com o esgotamento profissional e reequilibrar suas energias.",
      },
      {
        num: "04",
        name: "Relacionamentos",
        desc: "Melhora de vínculos afetivos, comunicação e resolução de conflitos.",
      },
      {
        num: "05",
        name: "Autoconhecimento",
        desc: "Processo terapêutico de descoberta pessoal para construção de uma identidade mais sólida.",
      },
      {
        num: "06",
        name: "Atendimento Online",
        desc: "Sessões por videoconferência com a mesma qualidade do presencial.",
      },
    ],
  },
  testimonials: {
    chip: "✦ Depoimentos",
    title: "O que dizem os pacientes",
  },
  booking: {
    chip: "✦ Agendamento",
    title: "Dê o primeiro passo hoje",
    subtitle:
      "Agende sua consulta em minutos. Sessão com duração personalizada conforme sua configuração.",
    info: [
      { title: "Presencial", subtitle: "Endereço do consultório" },
      { title: "Online", subtitle: "Videoconferência — todo o Brasil" },
      { title: "Duração", subtitle: "50 minutos por sessão" },
    ],
  },
  nav: {
    linkSobre: "Sobre",
    linkEspecialidades: "Especialidades",
    linkDepoimentos: "Depoimentos",
    ctaText: "Agendar consulta",
  },
};

export function mergeLandingConfig(
  stored: unknown,
  userName: string,
  specialty: string
): LandingConfig {
  const base = JSON.parse(JSON.stringify(DEFAULT_LANDING_CONFIG)) as LandingConfig;

  if (!stored || typeof stored !== "object") {
    return base;
  }

  const s = stored as Partial<LandingConfig>;
  return {
    hero: { ...base.hero, ...s.hero, stats: s.hero?.stats ?? base.hero.stats },
    profileCard: { ...base.profileCard, ...s.profileCard, tags: s.profileCard?.tags ?? base.profileCard.tags },
    floatBadges: s.floatBadges ?? base.floatBadges,
    about: {
      ...base.about,
      ...s.about,
      titleSuffix: s.about?.titleSuffix ?? base.about.titleSuffix,
      paragraphs: s.about?.paragraphs ?? base.about.paragraphs,
      pills: s.about?.pills ?? base.about.pills,
    },
    credentials: s.credentials ?? base.credentials,
    services: {
      ...base.services,
      ...s.services,
      items: s.services?.items ?? base.services.items,
    },
    testimonials: { ...base.testimonials, ...s.testimonials },
    booking: {
      ...base.booking,
      ...s.booking,
      info: s.booking?.info ?? base.booking.info,
    },
    nav: { ...base.nav, ...s.nav },
    primaryColor: s.primaryColor,
    secondaryColor: s.secondaryColor,
    activeSections: s.activeSections,
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 1)
    .join("")
    .toUpperCase();
}
