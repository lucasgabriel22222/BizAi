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
  Plus,
  CalendarClock,
  CalendarDays,
  Sparkles,
  Clock,
  Ban,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { normalizeTime, toDateOnlyString } from "@/lib/period";

interface BusinessHour {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  slotDuration: number;
}

interface ScheduleException {
  id: string;
  date: string;
  type: string;
  reason?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function HorariosView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);

  // Controle de Modais / Modelos
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"model1" | "model2" | null>(null);

  // Estado Modelo 1 (Horário por dia útil da semana)
  const [weeklyConfig, setWeeklyConfig] = useState<
    Array<{
      dayOfWeek: number;
      isOpen: boolean;
      startTime: string;
      endTime: string;
      breakStart: string;
      breakEnd: string;
      slotDuration: number;
    }>
  >([
    { dayOfWeek: 1, isOpen: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:30", slotDuration: 50 },
    { dayOfWeek: 2, isOpen: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:30", slotDuration: 50 },
    { dayOfWeek: 3, isOpen: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:30", slotDuration: 50 },
    { dayOfWeek: 4, isOpen: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:30", slotDuration: 50 },
    { dayOfWeek: 5, isOpen: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:30", slotDuration: 50 },
    { dayOfWeek: 6, isOpen: true, startTime: "08:00", endTime: "12:00", breakStart: "", breakEnd: "", slotDuration: 50 },
    { dayOfWeek: 0, isOpen: false, startTime: "08:00", endTime: "12:00", breakStart: "", breakEnd: "", slotDuration: 50 },
  ]);

  // Estado Modelo 2 (Geração Automática por Duração de Serviço/Expediente)
  const [model2Config, setModel2Config] = useState({
    workStart: "08:00",
    workEnd: "18:00",
    pauseStart: "12:00",
    pauseEnd: "13:00",
    slotDuration: 30, // 30min ou 60min
    applyWeekdays: true,
  });

  // Seleção de dias específicos do mês
  const [selectedMonthDays, setSelectedMonthDays] = useState<string[]>([]);
  const [showMonthDayPicker, setShowMonthDayPicker] = useState(false);

  // Modal de Exceções / Bloqueios
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionForm, setExceptionForm] = useState({
    type: "HOLIDAY",
    reason: "Folga / Feriado",
    startTime: "14:00",
    endTime: "15:00",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const start = startOfMonth(currentMonth).toISOString();
    const end = endOfMonth(currentMonth).toISOString();

    const [availRes, configRes] = await Promise.all([
      fetch(`/api/availability?start=${start}&end=${end}`),
      fetch(`/api/schedule-config`),
    ]);

    const availData = availRes.ok ? await availRes.json() : {};
    const configData = configRes.ok ? await configRes.json() : {};

    setSlots((availData.slots || []).filter((s: Slot) => !s.isBooked));
    setBusinessHours(configData.businessHours || []);
    setExceptions(configData.exceptions || []);
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
  const monthDaysInterval = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const daySlots = slots
    .filter((s) => isSameDay(new Date(s.date), selectedDate))
    .sort((a, b) => normalizeTime(a.startTime).localeCompare(normalizeTime(b.startTime)));

  const getDaySlotCount = (day: Date) =>
    slots.filter((s) => isSameDay(new Date(s.date), day)).length;

  const dateParam = toDateOnlyString(selectedDate);
  const isSelectedDateBlocked = exceptions.some(
    (e) => isSameDay(new Date(e.date), selectedDate) && (e.type === "HOLIDAY" || e.type === "DAY_OFF")
  );

  // Aplicar regra para todos os dias úteis (Modelo 1)
  const handleApplyToAllWeekdays = () => {
    const monday = weeklyConfig.find((c) => c.dayOfWeek === 1);
    if (!monday) return;
    setWeeklyConfig((prev) =>
      prev.map((c) =>
        c.dayOfWeek >= 1 && c.dayOfWeek <= 5
          ? { ...c, isOpen: true, startTime: monday.startTime, endTime: monday.endTime, breakStart: monday.breakStart, breakEnd: monday.breakEnd, slotDuration: monday.slotDuration }
          : c
      )
    );
    toast.success("Regra copiada para Segunda a Sexta!");
  };

  // Salvar Regras do Modelo 1
  const handleSaveModel1 = async () => {
    setLoading(true);
    const res = await fetch("/api/schedule-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_business_hours",
        items: weeklyConfig,
        applyMonthDays: showMonthDayPicker,
        monthDays: selectedMonthDays,
      }),
    });

    if (res.ok) {
      toast.success("Agenda configurada com sucesso!");
      setShowConfigModal(false);
      setSelectedModel(null);
      fetchData();
    } else {
      toast.error("Erro ao salvar configuração.");
    }
    setLoading(false);
  };

  // Salvar Regras do Modelo 2 (Gerador por Duração de Consulta)
  const handleSaveModel2 = async () => {
    setLoading(true);
    // Transforma o modelo 2 em itens de business hours para seg-sex
    const items = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      dayOfWeek,
      isOpen: model2Config.applyWeekdays,
      startTime: model2Config.workStart,
      endTime: model2Config.workEnd,
      breakStart: model2Config.pauseStart,
      breakEnd: model2Config.pauseEnd,
      slotDuration: model2Config.slotDuration,
    }));
    // Adiciona sábado e domingo fechados por padrão
    items.push(
      { dayOfWeek: 6, isOpen: false, startTime: "08:00", endTime: "12:00", breakStart: "", breakEnd: "", slotDuration: model2Config.slotDuration },
      { dayOfWeek: 0, isOpen: false, startTime: "08:00", endTime: "12:00", breakStart: "", breakEnd: "", slotDuration: model2Config.slotDuration }
    );

    const res = await fetch("/api/schedule-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_business_hours",
        items,
        applyMonthDays: showMonthDayPicker,
        monthDays: selectedMonthDays,
      }),
    });

    if (res.ok) {
      toast.success("Grade de horários dividida dinamicamente e salva!");
      setShowConfigModal(false);
      setSelectedModel(null);
      fetchData();
    } else {
      toast.error("Erro ao gerar agenda.");
    }
    setLoading(false);
  };

  // Salvar Exceção / Bloqueio no Calendário
  const handleSaveException = async () => {
    const res = await fetch("/api/schedule-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_exception",
        date: dateParam,
        ...exceptionForm,
      }),
    });

    if (res.ok) {
      toast.success("Exceção registrada no calendário!");
      setShowExceptionModal(false);
      fetchData();
    } else {
      toast.error("Erro ao registrar exceção.");
    }
  };

  // Deletar Exceção
  const handleDeleteException = async (id: string) => {
    const res = await fetch("/api/schedule-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_exception", id }),
    });

    if (res.ok) {
      toast.success("Exceção removida!");
      fetchData();
    }
  };

  // Resetar / Limpar toda a agenda
  const handleResetSchedule = async () => {
    if (
      !confirm(
        "Tem certeza que deseja resetar toda a agenda?\nIsso apagará todas as configurações de horários e vedações livres. Consultas já agendadas por pacientes serão preservadas."
      )
    ) {
      return;
    }

    setLoading(true);
    const res = await fetch("/api/schedule-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_schedule" }),
    });

    if (res.ok) {
      toast.success("Agenda resetada com sucesso!");
      fetchData();
    } else {
      toast.error("Erro ao resetar agenda.");
    }
    setLoading(false);
  };

  const hasConfiguredAgenda = businessHours.length > 0 || slots.length > 0;

  return (
    <div className="space-y-6 text-foreground">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciar Horários da Agenda</h2>
          <p className="text-sm text-muted-foreground">
            Configure sua rotina semanal padrão, duração dos atendimentos e exceções de calendário.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowConfigModal(true)} variant="default">
            <SlidersHorizontal className="h-4 w-4" />
            {hasConfiguredAgenda ? "Reconfigurar Agenda" : "Criar Nova Agenda"}
          </Button>
          {hasConfiguredAgenda && (
            <>
              <Button variant="outline" onClick={() => setShowExceptionModal(true)}>
                <Ban className="h-4 w-4 text-amber-500" />
                Bloquear / Exceção
              </Button>
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={handleResetSchedule} disabled={loading}>
                <RotateCcw className="h-4 w-4" />
                Resetar Agenda
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ESTADO VAZIO: Nenhuma agenda criada ainda */}
      {!hasConfiguredAgenda && !loading && (
        <Card className="border-dashed border-2 border-border/80 bg-card/40 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl">
              <CalendarClock className="h-8 w-8 text-neutral-300" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-xl font-bold">Nenhuma agenda configurada</h3>
              <p className="text-sm text-muted-foreground">
                Crie sua rotina semanal ou divida automaticamente seus atendimentos por duração de consulta.
              </p>
            </div>
            <Button size="lg" className="mt-4" onClick={() => setShowConfigModal(true)}>
              <Plus className="h-5 w-5" />
              Criar Minha Agenda Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TELA PRINCIPAL: Calendário e Cards de Informação */}
      {hasConfiguredAgenda && (
        <div className="grid gap-6 xl:grid-cols-5">
          {/* Calendário de Exceções */}
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
                  const count = getDaySlotCount(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const inMonth = isSameMonth(day, currentMonth);
                  const exc = exceptions.find((e) => isSameDay(new Date(e.date), day));
                  const isHoliday = exc?.type === "HOLIDAY" || exc?.type === "DAY_OFF";

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "flex min-h-[44px] flex-col items-center justify-center rounded-lg p-1 text-sm transition-all relative",
                        !inMonth && "opacity-30",
                        isSelected && "bg-white text-black font-bold shadow-lg",
                        isToday(day) && !isSelected && "ring-1 ring-white/40",
                        isHoliday && !isSelected && "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}
                    >
                      <span>{format(day, "d")}</span>
                      {count > 0 && !isHoliday && (
                        <span
                          className={cn(
                            "text-[10px] font-bold",
                            isSelected ? "text-black" : "text-emerald-400"
                          )}
                        >
                          {count}
                        </span>
                      )}
                      {isHoliday && <span className="text-[9px] text-red-400 font-bold">Folga</span>}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Slots do Dia Selecionado */}
          <div className="space-y-4 xl:col-span-3">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    {isSelectedDateBlocked && (
                      <Badge variant="outline" className="ml-2 border-red-500/50 text-red-400 bg-red-500/10">
                        Dia Bloqueado
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {daySlots.length} horário(s) calculado(s) e disponível(is) para pacientes
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowExceptionModal(true)}>
                    <Ban className="h-4 w-4" />
                    Exceção neste dia
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Exceções ativas no dia */}
            {exceptions.filter((e) => isSameDay(new Date(e.date), selectedDate)).map((exc) => (
              <div
                key={exc.id}
                className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4" />
                  <span>
                    <strong>Exceção:</strong> {exc.reason} ({exc.type})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-amber-200 hover:text-white"
                  onClick={() => handleDeleteException(exc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Lista de Slots de Horário */}
            {daySlots.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-3">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                  >
                    <Clock className="mr-2 h-4 w-4 text-emerald-400" />
                    {normalizeTime(slot.startTime)} – {normalizeTime(slot.endTime)}
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum horário disponível neste dia.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / CONFIGURAÇÃO DE AGENDA (SELEÇÃO DE MODELO) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold">Criar / Configurar Agenda</h3>
                <p className="text-xs text-neutral-400">Escolha o modelo de funcionamento desejado</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowConfigModal(false)}>
                Fechar
              </Button>
            </div>

            {/* SELEÇÃO DO MODELO DE DROPDOWN / CARDS */}
            {!selectedModel && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  onClick={() => setSelectedModel("model1")}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/30 hover:bg-white/10 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold">Modelo 1: Rotina Semanal Padrão</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Defina o horário de abertura, almoço e fechamento para cada dia da semana. Ex: Seg-Sex (08:00 às 18:00 com almoço 12:00-13:30) e Sábado (08:00 às 12:00).
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                    Selecionar Modelo 1 <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>

                <div
                  onClick={() => setSelectedModel("model2")}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/30 hover:bg-white/10 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold">Modelo 2: Geração Automática por Duração</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Informe o início/fim do expediente, intervalo de almoço e a duração das suas consultas (ex: 30min ou 60min). O sistema divide todas as vagas automaticamente.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                    Selecionar Modelo 2 <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </div>
            )}

            {/* FORMULÁRIO MODELO 1 */}
            {selectedModel === "model1" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setSelectedModel(null)}>
                    ← Trocar Modelo
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleApplyToAllWeekdays}>
                    Copiar Seg ➔ Sex
                  </Button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {weeklyConfig.map((conf, index) => (
                    <div
                      key={conf.dayOfWeek}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2 w-32">
                        <Checkbox
                          checked={conf.isOpen}
                          onCheckedChange={(val) =>
                            setWeeklyConfig((prev) =>
                              prev.map((c, i) => (i === index ? { ...c, isOpen: Boolean(val) } : c))
                            )
                          }
                        />
                        <span className="font-bold">{DAY_NAMES[conf.dayOfWeek]}</span>
                      </div>

                      {conf.isOpen ? (
                        <>
                          <div className="flex items-center gap-1">
                            <span>Início:</span>
                            <input
                              type="time"
                              className="rounded border border-white/10 bg-black px-2 py-1 text-xs text-white"
                              value={conf.startTime}
                              onChange={(e) =>
                                setWeeklyConfig((prev) =>
                                  prev.map((c, i) => (i === index ? { ...c, startTime: e.target.value } : c))
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Fim:</span>
                            <input
                              type="time"
                              className="rounded border border-white/10 bg-black px-2 py-1 text-xs text-white"
                              value={conf.endTime}
                              onChange={(e) =>
                                setWeeklyConfig((prev) =>
                                  prev.map((c, i) => (i === index ? { ...c, endTime: e.target.value } : c))
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Almoço:</span>
                            <input
                              type="time"
                              className="rounded border border-white/10 bg-black px-1.5 py-1 text-xs text-white"
                              value={conf.breakStart}
                              onChange={(e) =>
                                setWeeklyConfig((prev) =>
                                  prev.map((c, i) => (i === index ? { ...c, breakStart: e.target.value } : c))
                                )
                              }
                            />
                            <span>-</span>
                            <input
                              type="time"
                              className="rounded border border-white/10 bg-black px-1.5 py-1 text-xs text-white"
                              value={conf.breakEnd}
                              onChange={(e) =>
                                setWeeklyConfig((prev) =>
                                  prev.map((c, i) => (i === index ? { ...c, breakEnd: e.target.value } : c))
                                )
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-neutral-500">Fechado</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Seleção de dias específicos do mês */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={showMonthDayPicker}
                      onCheckedChange={(v) => setShowMonthDayPicker(Boolean(v))}
                    />
                    <Label className="text-xs font-semibold cursor-pointer">
                      Aplicar esta regra para dias específicos do mês atual
                    </Label>
                  </div>

                  {showMonthDayPicker && (
                    <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl border border-white/10 bg-black">
                      {monthDaysInterval.map((d) => {
                        const dStr = toDateOnlyString(d);
                        const isSel = selectedMonthDays.includes(dStr);
                        return (
                          <button
                            key={dStr}
                            type="button"
                            onClick={() =>
                              setSelectedMonthDays((prev) =>
                                isSel ? prev.filter((x) => x !== dStr) : [...prev, dStr]
                              )
                            }
                            className={cn(
                              "py-1 text-xs rounded transition-all",
                              isSel ? "bg-white text-black font-bold" : "bg-white/5 text-neutral-300 hover:bg-white/10"
                            )}
                          >
                            {format(d, "d")}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button className="w-full bg-white text-black hover:bg-neutral-200" onClick={handleSaveModel1} disabled={loading}>
                  {loading ? "Salvando regras..." : "Salvar Regras de Funcionamento (Modelo 1)"}
                </Button>
              </div>
            )}

            {/* FORMULÁRIO MODELO 2 */}
            {selectedModel === "model2" && (
              <div className="space-y-6">
                <Button variant="outline" size="sm" onClick={() => setSelectedModel(null)}>
                  ← Trocar Modelo
                </Button>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Início do Expediente</Label>
                    <Input
                      type="time"
                      value={model2Config.workStart}
                      onChange={(e) => setModel2Config({ ...model2Config, workStart: e.target.value })}
                      className="bg-black border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Fim do Expediente</Label>
                    <Input
                      type="time"
                      value={model2Config.workEnd}
                      onChange={(e) => setModel2Config({ ...model2Config, workEnd: e.target.value })}
                      className="bg-black border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Início Almoço/Pause</Label>
                    <Input
                      type="time"
                      value={model2Config.pauseStart}
                      onChange={(e) => setModel2Config({ ...model2Config, pauseStart: e.target.value })}
                      className="bg-black border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Fim Almoço/Pause</Label>
                    <Input
                      type="time"
                      value={model2Config.pauseEnd}
                      onChange={(e) => setModel2Config({ ...model2Config, pauseEnd: e.target.value })}
                      className="bg-black border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Duração da Consulta (Geração de Slots)</Label>
                  <div className="flex gap-3">
                    {[30, 50, 60].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setModel2Config({ ...model2Config, slotDuration: dur })}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all",
                          model2Config.slotDuration === dur
                            ? "bg-white text-black border-white"
                            : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                        )}
                      >
                        {dur} minutos
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seleção de dias específicos do mês */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={showMonthDayPicker}
                      onCheckedChange={(v) => setShowMonthDayPicker(Boolean(v))}
                    />
                    <Label className="text-xs font-semibold cursor-pointer">
                      Aplicar divisão automática em dias específicos do mês
                    </Label>
                  </div>

                  {showMonthDayPicker && (
                    <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl border border-white/10 bg-black">
                      {monthDaysInterval.map((d) => {
                        const dStr = toDateOnlyString(d);
                        const isSel = selectedMonthDays.includes(dStr);
                        return (
                          <button
                            key={dStr}
                            type="button"
                            onClick={() =>
                              setSelectedMonthDays((prev) =>
                                isSel ? prev.filter((x) => x !== dStr) : [...prev, dStr]
                              )
                            }
                            className={cn(
                              "py-1 text-xs rounded transition-all",
                              isSel ? "bg-white text-black font-bold" : "bg-white/5 text-neutral-300 hover:bg-white/10"
                            )}
                          >
                            {format(d, "d")}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button className="w-full bg-white text-black hover:bg-neutral-200" onClick={handleSaveModel2} disabled={loading}>
                  {loading ? "Gerando horários..." : "Gerar Divisão Automática de Horários (Modelo 2)"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE EXCEÇÃO / BLOQUEIO */}
      {showExceptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold">Adicionar Exceção / Bloqueio</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowExceptionModal(false)}>
                Fechar
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Data da Exceção</Label>
                <Input
                  type="text"
                  disabled
                  value={format(selectedDate, "dd/MM/yyyy")}
                  className="bg-black text-neutral-400 border-white/10 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Tipo de Bloqueio</Label>
                <select
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white mt-1"
                  value={exceptionForm.type}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, type: e.target.value })}
                >
                  <option value="HOLIDAY">Dia Inteiro (Folga / Feriado)</option>
                  <option value="DAY_OFF">Férias</option>
                  <option value="BLOCK">Horário Pontual (Médico/Compromisso)</option>
                  <option value="EXTRA">Horário Extra de Atendimento</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Motivo / Descrição</Label>
                <Input
                  type="text"
                  placeholder="Ex: Feriado municipal, Consulta médica..."
                  value={exceptionForm.reason}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                  className="bg-black text-white border-white/10 mt-1"
                />
              </div>

              {(exceptionForm.type === "BLOCK" || exceptionForm.type === "EXTRA") && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">De</Label>
                    <Input
                      type="time"
                      value={exceptionForm.startTime}
                      onChange={(e) => setExceptionForm({ ...exceptionForm, startTime: e.target.value })}
                      className="bg-black text-white border-white/10 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Até</Label>
                    <Input
                      type="time"
                      value={exceptionForm.endTime}
                      onChange={(e) => setExceptionForm({ ...exceptionForm, endTime: e.target.value })}
                      className="bg-black text-white border-white/10 mt-1"
                    />
                  </div>
                </div>
              )}

              <Button className="w-full bg-white text-black hover:bg-neutral-200 mt-2" onClick={handleSaveException}>
                Salvar Exceção
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
