"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_TYPE_LABELS,
  GENDER_LABELS,
} from "@/lib/constants";
import { AppointmentStatus, AppointmentType, Gender } from "@prisma/client";
import { normalizeTime } from "@/lib/period";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  price: number;
  reason?: string | null;
  notes?: string | null;
  patient: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
    gender?: Gender | null;
    notes?: string | null;
  };
}

function maskCpf(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.***.***-${d.slice(-2)}`;
}

export function AgendaView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const start = startOfMonth(currentMonth).toISOString();
    const end = endOfMonth(currentMonth).toISOString();

    const res = await fetch(`/api/availability?start=${start}&end=${end}`);
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dayAppointments = appointments
    .filter((a) => isSameDay(new Date(a.date), selectedDate))
    .sort((a, b) => normalizeTime(a.startTime).localeCompare(normalizeTime(b.startTime)));

  const getDayAppointmentCount = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.date), day)).length;

  const deleteAppointment = async (id: string) => {
    if (!confirm("Excluir esta consulta?")) return;
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Consulta excluída");
      fetchData();
    }
  };

  const updateStatus = async (id: string, status: "COMPLETED" | "CANCELLED") => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(
        status === "COMPLETED" ? "Consulta concluída!" : "Consulta cancelada"
      );
      fetchData();
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Visualize consultas com dados do paciente, motivo e observações.
        </p>
        <Link href="/agenda/horarios">
          <Button>
            <CalendarClock className="h-4 w-4" />
            Gerenciar horários
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
              >
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                <div key={i} className="py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const count = getDayAppointmentCount(day);
                const isSelected = isSameDay(day, selectedDate);
                const inMonth = isSameMonth(day, currentMonth);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "flex min-h-[44px] flex-col items-center justify-center rounded-lg p-1 text-sm transition-all",
                      !inMonth && "opacity-30",
                      isSelected && "bg-foreground text-background font-bold shadow-sm",
                      isToday(day) && !isSelected && "ring-1 ring-ring"
                    )}
                  >
                    <span>{format(day, "d")}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "text-[10px] font-bold",
                          isSelected ? "text-background" : "text-emerald-500 font-extrabold"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {dayAppointments.length} consulta(s) neste dia
              </p>
            </CardHeader>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Carregando...
              </CardContent>
            </Card>
          ) : dayAppointments.length > 0 ? (
            <div className="space-y-4">
              {dayAppointments.map((apt) => (
                <Card key={apt.id} className="overflow-hidden">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xl font-semibold text-foreground">{apt.patient.name}</p>
                          <Badge className={APPOINTMENT_STATUS_COLORS[apt.status]}>
                            {APPOINTMENT_STATUS_LABELS[apt.status]}
                          </Badge>
                          <Badge variant="outline">
                            {APPOINTMENT_TYPE_LABELS[apt.type]}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-foreground/80">
                          {normalizeTime(apt.startTime)} – {normalizeTime(apt.endTime)} ·{" "}
                          {formatCurrency(apt.price)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(apt.status === AppointmentStatus.CONFIRMED ||
                          apt.status === AppointmentStatus.PENDING) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => updateStatus(apt.id, "COMPLETED")}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Concluir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/30 text-red-600 hover:bg-red-500/10"
                              onClick={() => updateStatus(apt.id, "CANCELLED")}
                            >
                              <XCircle className="h-4 w-4" />
                              Cancelar
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteAppointment(apt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
                      <div className="flex items-start gap-2 text-sm">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">CPF</p>
                          <p className="font-medium text-foreground">{maskCpf(apt.patient.cpf)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Telefone</p>
                          <p className="font-medium text-foreground">{apt.patient.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="break-all font-medium text-foreground">{apt.patient.email}</p>
                        </div>
                      </div>
                      {apt.patient.gender && (
                        <div className="flex items-start gap-2 text-sm">
                          <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Gênero</p>
                            <p className="font-medium text-foreground">{GENDER_LABELS[apt.patient.gender] ?? apt.patient.gender}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {apt.reason && (
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <MessageSquare className="h-4 w-4" />
                          Motivo da consulta
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90">{apt.reason}</p>
                      </div>
                    )}

                    {(apt.notes || apt.patient.notes) && (
                      <div className="rounded-xl border border-border/50 p-4">
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Observações
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Consulta: </span>
                            {apt.notes}
                          </p>
                        )}
                        {apt.patient.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Paciente: </span>
                            {apt.patient.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma consulta neste dia.
                <div className="mt-4">
                  <Link href="/agenda/horarios">
                    <Button variant="outline" size="sm">
                      <CalendarClock className="h-4 w-4" />
                      Gerenciar horários disponíveis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
