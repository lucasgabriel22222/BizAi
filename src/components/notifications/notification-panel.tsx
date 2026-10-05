"use client";

import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border/50 bg-card/95 p-4 shadow-glass-lg backdrop-blur-xl sm:w-96">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-purple" />
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl p-3 transition-colors ${
                n.read ? "bg-muted/30" : "bg-gradient-brand-soft border border-brand-purple/20"
              }`}
            >
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
              <p className="mt-2 text-xs text-muted-foreground/60">
                {formatDateTime(n.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
