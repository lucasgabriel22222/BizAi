"use client";

import { LucideIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  isCurrency?: boolean;
  gradient?: "blue" | "purple" | "green" | "amber" | "red";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isCurrency,
}: StatCardProps) {
  const displayValue =
    typeof value === "number"
      ? isCurrency
        ? formatCurrency(value)
        : value.toLocaleString("pt-BR")
      : value;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">{title}</p>
          <p className="text-2xl font-black tracking-tight text-foreground">{displayValue}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p
              className={cn(
                "text-xs font-semibold",
                trend >= 0 ? "text-emerald-500" : "text-red-500"
              )}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% vs período anterior
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-transform duration-300 group-hover:scale-110"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
