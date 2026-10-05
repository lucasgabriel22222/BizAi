"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  History,
  Settings,
  Sparkles,
  Link as LinkIcon,
  TrendingUp,
  Globe,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { BookingLinkCard } from "@/components/shared/booking-link-card";
import { BizAiLogo } from "@/components/shared/BizAi-logo";

const iconMap = {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  History,
  Settings,
  Link: LinkIcon,
  Sparkles,
  TrendingUp,
  Globe,
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  userSlug?: string;
  userEmail?: string;
  userRole?: string;
}

export function Sidebar({ open, onClose, userSlug, userEmail, userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <BizAiLogo size={36} />
          </Link>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-foreground text-background font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          {(userRole === "ADMIN" || userEmail === "anjoslucas962@gmail.com") && (
            <Link
              href="/admin"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 mt-4 border border-amber-500/30 bg-amber-500/10 text-amber-500 font-bold hover:bg-amber-500/20"
              )}
            >
              <Shield className="h-5 w-5" />
              Painel Admin
            </Link>
          )}
        </nav>

        {userSlug && (
          <div className="border-t border-border p-4">
            <BookingLinkCard slug={userSlug} compact />
          </div>
        )}
      </aside>
    </>
  );
}

