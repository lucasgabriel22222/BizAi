"use client";

import { cn } from "@/lib/utils";
import type { PeriodPreset } from "@/lib/period";

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "month", label: "Mês" },
  { value: "custom", label: "Personalizado" },
];

interface PeriodSelectorProps {
  value: PeriodPreset;
  onChange: (preset: PeriodPreset) => void;
  customStart?: string;
  customEnd?: string;
  onCustomStartChange?: (v: string) => void;
  onCustomEndChange?: (v: string) => void;
  className?: string;
}

export function PeriodSelector({
  value,
  onChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  className,
}: PeriodSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all",
              value === p.value
                ? "bg-foreground text-background shadow-glass"
                : "border border-border/50 bg-card/50 hover:bg-accent"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {value === "custom" && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange?.(e.target.value)}
            className="h-10 rounded-xl border border-border/50 bg-background/50 px-3 text-sm"
          />
          <span className="text-muted-foreground">até</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange?.(e.target.value)}
            className="h-10 rounded-xl border border-border/50 bg-background/50 px-3 text-sm"
          />
        </div>
      )}
    </div>
  );
}
