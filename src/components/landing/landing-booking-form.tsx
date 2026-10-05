"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { normalizeTime, toDateOnlyString } from "@/lib/period";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

interface Slot {
  id: string;
  startTime: string;
}

interface LandingBookingFormProps {
  slug: string;
  defaultDuration: number;
}

export function LandingBookingForm({ slug, defaultDuration }: LandingBookingFormProps) {
  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    birthDate: "",
    gender: "PREFER_NOT_SAY",
    reason: "",
    notes: "",
  });

  const [successMsg, setSuccessMsg] = useState("");

  const fetchSlots = useCallback(async () => {
    if (!selectedDate) return;
    const res = await fetch(`/api/booking/${slug}?date=${toDateOnlyString(selectedDate)}`);
    const data = await res.json();
    setSlots(data.slots || []);
  }, [slug, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()));
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = startOfDay(new Date());

  const goTo = (n: number) => setStep(n);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/booking/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: toDateOnlyString(selectedDate),
          startTime: normalizeTime(selectedTime),
          slug,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const dStr = `${WEEKDAYS[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}`;
      setSuccessMsg(
        `Olá, ${form.name}! Consulta confirmada para ${dStr} às ${normalizeTime(selectedTime)}. Enviamos confirmação para ${form.email}.`
      );
      goTo(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao agendar");
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({
      name: "", cpf: "", phone: "", email: "", birthDate: "",
      gender: "PREFER_NOT_SAY", reason: "", notes: "",
    });
    goTo(1);
  };

  const canStep2 = !!selectedDate;
  const canConfirm =
    selectedTime &&
    form.name.trim() &&
    form.cpf.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.birthDate &&
    form.reason.trim();

  return (
    <div className="booking-form">
      <div className="steps">
        <div className={`step-bar ${step >= 1 ? (step === 1 ? "active" : "done") : ""}`} />
        <div className={`step-bar ${step >= 2 ? (step === 2 ? "active" : "done") : ""}`} />
        <div className={`step-bar ${step >= 3 ? "active" : ""}`} />
        <span className="step-label">Passo {Math.min(step, 3)} de 3</span>
      </div>

      {step === 1 && (
        <div className="form-step active">
          <div className="step-title">Escolha a data</div>
          <p className="step-sub">Selecione um dia disponível</p>
          <div className="cal-header">
            <button type="button" className="cal-nav" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>‹</button>
            <span className="cal-month">{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button type="button" className="cal-nav" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</button>
          </div>
          <div className="cal-weekdays">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <span key={d} className="cal-weekday">{d}</span>
            ))}
          </div>
          <div className="cal-days">
            {days.map((day) => {
              const inMonth = day.getMonth() === currentMonth.getMonth();
              const past = isBefore(day, today);
              const isToday = isSameDay(day, today);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const unavailable = past || !inMonth;

              return (
                <div
                  key={day.toISOString()}
                  className={`cal-day${unavailable ? " unavailable" : " available"}${isToday ? " today" : ""}${selected ? " selected" : ""}${!inMonth ? " empty" : ""}`}
                  onClick={() => {
                    if (unavailable || !inMonth) return;
                    setSelectedDate(day);
                    setSelectedTime(null);
                  }}
                >
                  {inMonth ? day.getDate() : ""}
                </div>
              );
            })}
          </div>
          <div className="form-nav" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn-primary" style={{ flex: 1 }} disabled={!canStep2} onClick={() => goTo(2)}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-step active">
          <div className="step-title">Horário & dados</div>
          <p className="step-sub">
            {selectedDate &&
              `${WEEKDAYS[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}`}
          </p>
          <div style={{ marginBottom: "1.8rem" }}>
            <div style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)", marginBottom: "0.7rem" }}>
              Horários disponíveis
            </div>
            <div className="time-grid">
              {slots.length === 0 ? (
                <p style={{ gridColumn: "1/-1", color: "var(--muted)", fontSize: "0.85rem" }}>Nenhum horário neste dia</p>
              ) : (
                slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`time-slot${selectedTime === slot.startTime ? " selected" : ""}`}
                    onClick={() => setSelectedTime(slot.startTime)}
                  >
                    {normalizeTime(slot.startTime)}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="fields-row">
            <div className="field">
              <label>Nome completo</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" />
            </div>
            <div className="field">
              <label>CPF</label>
              <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
            </div>
          </div>
          <div className="fields-row">
            <div className="field">
              <label>Telefone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" />
            </div>
          </div>
          <div className="field">
            <label>Data de nascimento</label>
            <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Motivo da consulta</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Descreva brevemente" />
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--faint)", marginBottom: "1rem" }}>
            Duração: {defaultDuration} min · Consulta confirmada automaticamente após o agendamento
          </p>
          <div className="form-nav">
            <button type="button" className="btn-back" onClick={() => goTo(1)}>← Voltar</button>
            <button type="button" className="btn-primary" style={{ flex: 1 }} disabled={!canConfirm || loading} onClick={handleConfirm}>
              {loading ? "Agendando..." : "Confirmar agendamento"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-step active">
          <div className="success-state" style={{ display: "flex" }}>
            <div className="success-icon">✓</div>
            <div className="success-title">Consulta confirmada!</div>
            <p className="success-sub">{successMsg}</p>
            <button type="button" className="btn-primary" style={{ marginTop: "0.5rem" }} onClick={resetBooking}>
              Agendar nova consulta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
