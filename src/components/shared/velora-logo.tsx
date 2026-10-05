"use client";

import { cn } from "@/lib/utils";

interface BizAiLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function BizAiLogo({ className, size = 44, showText = false }: BizAiLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none transition-all duration-300 hover:scale-105 active:scale-95", className)}>
      <img
        src="/BizAi.png"
        alt="BizAi Logo"
        width={size * 3}
        height={size}
        className="h-9 w-auto object-contain shrink-0"
      />
      {showText && (
        <span className="font-extrabold text-xl tracking-tight text-foreground font-sans">
          BizAi
        </span>
      )}
    </div>
  );
}

// Alias para retrocompatibilidade
export const VeloraLogo = BizAiLogo;

