import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/public-profile";
import { PsicologoLanding } from "@/components/landing/psicologo-landing";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);

  if (!profile) {
    notFound();
  }

  return <PsicologoLanding data={profile} />;
}
