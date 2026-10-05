"use client";

import dynamic from "next/dynamic";

const BookingView = dynamic(
  () => import("@/components/booking/booking-view").then((m) => m.BookingView),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-muted" /> }
);

interface BookingSectionProps {
  slug: string;
  professionalName?: string;
}

export function BookingSection({ slug, professionalName }: BookingSectionProps) {
  return (
    <section id="agendar" className="scroll-mt-24">
      <BookingView slug={slug} embedded professionalName={professionalName} />
    </section>
  );
}
