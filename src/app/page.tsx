import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "BizAi — Gestão premium para psicólogos",
  description:
    "Transforme sua clínica com agenda inteligente, página profissional, financeiro e agendamento online. Teste grátis por 1 dia no plano Starter.",
  openGraph: {
    title: "BizAi — SaaS premium para psicólogos",
    description:
      "Agenda, pacientes, financeiro e página pública em um sistema internacional.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}

