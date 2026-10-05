"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  GraduationCap,
  Award,
  Calendar,
  Star,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingSection } from "./booking-section";
import { ReviewForm } from "./review-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PublicProfileData {
  name: string;
  specialty: string;
  slug: string;
  avatar: string | null;
  settings: {
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
  } | null;
  gallery: { id: string; imageUrl: string; caption?: string | null }[];
  reviews: {
    id: string;
    authorName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

interface PublicLandingPageProps {
  profile: PublicProfileData;
}

export function PublicLandingPage({ profile }: PublicLandingPageProps) {
  const [reviews, setReviews] = useState(profile.reviews);
  const s = profile.settings;

  const headline =
    s?.landingHeadline ||
    `${profile.name} — ${profile.specialty}`;
  const fullAddress = [s?.officeAddress, s?.officeCity, s?.officeState, s?.officeZip]
    .filter(Boolean)
    .join(", ");

  const scrollToBooking = () => {
    document.getElementById("agendar")?.scrollIntoView({ behavior: "smooth" });
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/10" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:py-24 md:text-left">
          <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-3xl border-4 border-white/20 shadow-glass-lg md:h-64 md:w-64">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-brand text-5xl font-bold text-white">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-purple">
              {profile.specialty}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{headline}</h1>
            {s?.landingBio && (
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">{s.landingBio}</p>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start">
              {s?.yearsExperience != null && s.yearsExperience > 0 && (
                <span className="rounded-full bg-card/80 px-4 py-2 text-sm font-medium backdrop-blur">
                  {s.yearsExperience}+ anos de experiência
                </span>
              )}
              {avgRating && (
                <span className="flex items-center gap-1 rounded-full bg-card/80 px-4 py-2 text-sm font-medium backdrop-blur">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {avgRating} ({reviews.length} avaliações)
                </span>
              )}
            </div>

            <Button size="lg" className="mt-8 gap-2" onClick={scrollToBooking}>
              <Calendar className="h-5 w-5" />
              Agendar consulta
            </Button>
          </div>
        </div>

        <div className="flex justify-center pb-8">
          <ChevronDown className="h-6 w-6 animate-bounce text-muted-foreground" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-12">
        {/* Sobre */}
        <section>
          <h2 className="mb-8 text-2xl font-bold">Sobre</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {s?.education && (
              <div className="flex gap-4 rounded-2xl border border-border/50 bg-card/50 p-6">
                <GraduationCap className="h-8 w-8 shrink-0 text-brand-purple" />
                <div>
                  <h3 className="font-semibold">Formação</h3>
                  <p className="mt-1 text-muted-foreground">{s.education}</p>
                </div>
              </div>
            )}
            {s?.specializationText && (
              <div className="flex gap-4 rounded-2xl border border-border/50 bg-card/50 p-6">
                <Award className="h-8 w-8 shrink-0 text-brand-purple" />
                <div>
                  <h3 className="font-semibold">Especialização</h3>
                  <p className="mt-1 text-muted-foreground">{s.specializationText}</p>
                </div>
              </div>
            )}
            {s?.showBirthPlace && s?.birthPlace && (
              <div className="flex gap-4 rounded-2xl border border-border/50 bg-card/50 p-6 md:col-span-2">
                <MapPin className="h-8 w-8 shrink-0 text-brand-blue" />
                <div>
                  <h3 className="font-semibold">Natural de</h3>
                  <p className="mt-1 text-muted-foreground">{s.birthPlace}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Galeria */}
        {profile.gallery.length > 0 && (
          <section>
            <h2 className="mb-8 text-2xl font-bold">Galeria</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.gallery.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/50"
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.caption || "Foto"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-sm text-white">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Local */}
        {fullAddress && (
          <section>
            <h2 className="mb-6 text-2xl font-bold">Local de atendimento</h2>
            <div className="flex gap-4 rounded-2xl border border-border/50 bg-card/50 p-6">
              <MapPin className="h-8 w-8 shrink-0 text-brand-purple" />
              <p className="text-lg text-muted-foreground">{fullAddress}</p>
            </div>
          </section>
        )}

        {/* Feedbacks */}
        <section>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-7 w-7 text-brand-purple" />
                O que dizem os pacientes
              </h2>
              <p className="mt-2 text-muted-foreground">
                Avaliações reais de quem já foi atendido
              </p>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="mb-10 grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border/50 bg-card/50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.authorName}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn(
                            "h-4 w-4",
                            n <= r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-muted-foreground">{r.comment}</p>
                  <p className="mt-3 text-xs text-muted-foreground/60">
                    {format(new Date(r.createdAt), "MMMM yyyy", { locale: ptBR })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-8 text-muted-foreground">
              Ainda não há avaliações publicadas. Seja o primeiro após sua consulta!
            </p>
          )}

          <ReviewForm
            slug={profile.slug}
            onSuccess={() => {
              fetch(`/api/public/${profile.slug}`)
                .then((r) => r.json())
                .then((data) => setReviews(data.reviews || []));
            }}
          />
        </section>

        {/* Agendamento */}
        <BookingSection slug={profile.slug} professionalName={profile.name} />
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {profile.name} · Agendamento via BizAi</p>
      </footer>
    </div>
  );
}

