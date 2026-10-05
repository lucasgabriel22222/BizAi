"use client";

import { useState, useEffect } from "react";
import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from "@/lib/constants";
import { AppointmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "Todas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "COMPLETED", label: "Concluídas" },
  { value: "CANCELLED", label: "Canceladas" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
];

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  price: number;
  notes?: string;
  reason?: string;
  patient: { name: string };
}

export function HistoryView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (["PENDING", "COMPLETED", "CANCELLED", "CONFIRMED"].includes(filter)) {
      params.set("status", filter);
    } else if (filter) {
      params.set("filter", filter);
    }

    fetch(`/api/appointments?${params}`)
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments || []))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all",
              filter === f.value
                ? "bg-gradient-brand text-white shadow-glass"
                : "bg-card border border-border/50 hover:bg-accent"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhuma consulta encontrada"
          description="Ajuste os filtros ou aguarde novas consultas"
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id} className="transition-all hover:shadow-glass">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{apt.patient.name}</h3>
                    <Badge className={APPOINTMENT_STATUS_COLORS[apt.status]}>
                      {APPOINTMENT_STATUS_LABELS[apt.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(apt.date)} · {apt.startTime} - {apt.endTime}
                  </p>
                  {apt.reason && (
                    <p className="text-sm text-muted-foreground">Motivo: {apt.reason}</p>
                  )}
                  {apt.notes && (
                    <p className="text-sm text-muted-foreground/80">Obs: {apt.notes}</p>
                  )}
                </div>
                <p className="text-lg font-bold text-brand-purple">
                  {formatCurrency(apt.price)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
