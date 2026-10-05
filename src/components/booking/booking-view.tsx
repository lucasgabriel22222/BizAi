"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addDays,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sparkles, Calendar, Clock, CheckCircle, ChevronLeft } from "lucide-react";
import { bookingSchema, type BookingInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeTime, toDateOnlyString } from "@/lib/period";
import { toast } from "sonner";

interface BookingViewProps {
  slug: string;
  embedded?: boolean;
  professionalName?: string;
}

interface Professional {
  name: string;
  specialty: string;
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

export function BookingView({ slug, embedded = false, professionalName }: BookingViewProps) {
  const [step, setStep] = useState(1);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState(200);

  const days = eachDayOfInterval({
    start: new Date(),
    end: addDays(new Date(), 30),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { slug, gender: "PREFER_NOT_SAY" },
  });

  useEffect(() => {
    fetch(`/api/booking/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error("Profissional não encontrado");
          return;
        }
        setProfessional(data.professional);
      });
  }, [slug]);

  useEffect(() => {
    if (!selectedDate) return;
    fetch(`/api/booking/${slug}?date=${toDateOnlyString(selectedDate)}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setDefaultPrice(data.defaultPrice ?? 200);
      });
  }, [slug, selectedDate]);

  const onSubmit = async (data: BookingInput) => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/booking/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: toDateOnlyString(selectedDate),
          startTime: normalizeTime(selectedTime),
          slug,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setConfirmed(true);
      setStep(4);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao agendar");
    } finally {
      setLoading(false);
    }
  };

  if (!professional) {
    const loader = (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
      </div>
    );
    if (embedded) {
      return (
        <div className="rounded-2xl border border-border/50 bg-card/80 p-6">{loader}</div>
      );
    }
    return loader;
  }

  const prof = professional ?? { name: professionalName ?? "", specialty: "" };

  const content = (
    <>
        {!embedded && (
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glass-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{prof.name}</h1>
          <p className="text-muted-foreground">{prof.specialty}</p>
          <p className="mt-2 text-sm text-brand-purple">Agendamento online</p>
        </div>
        )}
        {embedded && (
          <h2 className="mb-6 text-2xl font-bold">Agende sua consulta</h2>
        )}

        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                step >= s ? "w-8 bg-gradient-brand" : "w-2 bg-muted"
              )}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-white/20 bg-card/80 p-6 shadow-glass-lg backdrop-blur-xl sm:p-8">
          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold">Consulta confirmada!</h2>
                <p className="mt-2 text-muted-foreground">
                  Sua consulta foi agendada com sucesso. Você receberá uma confirmação em breve.
                </p>
                {selectedDate && selectedTime && (
                  <p className="mt-4 font-medium">
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {normalizeTime(selectedTime)}
                  </p>
                )}
              </motion.div>
            ) : step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5 text-brand-purple" />
                  Escolha a data
                </h2>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {days.map((day) => {
                    const disabled = isBefore(day, startOfDay(new Date()));
                    const selected = selectedDate && isSameDay(day, selectedDate);
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedTime(null);
                          setValue("date", day.toISOString());
                        }}
                        className={cn(
                          "flex flex-col items-center rounded-xl p-2 text-sm transition-all",
                          disabled && "opacity-30 cursor-not-allowed",
                          selected
                            ? "bg-gradient-brand text-white shadow-glass"
                            : "hover:bg-accent border border-border/50"
                        )}
                      >
                        <span className="text-xs text-muted-foreground">
                          {format(day, "EEE", { locale: ptBR })}
                        </span>
                        <span className="font-bold">{format(day, "d")}</span>
                      </button>
                    );
                  })}
                </div>
                <Button
                  className="mt-6 w-full"
                  disabled={!selectedDate}
                  onClick={() => setStep(2)}
                >
                  Continuar
                </Button>
              </motion.div>
            ) : step === 2 ? (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(1)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5 text-brand-purple" />
                  Escolha o horário
                </h2>
                {slots.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhum horário disponível nesta data
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => {
                          setSelectedTime(slot.startTime);
                          setValue("startTime", slot.startTime);
                        }}
                        className={cn(
                          "rounded-xl border py-3 text-sm font-medium transition-all",
                          selectedTime === slot.startTime
                            ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                            : "border-border/50 hover:border-brand-purple/50"
                        )}
                      >
                        {normalizeTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Valor: R$ {defaultPrice.toFixed(2)}
                </p>
                <Button
                  className="mt-6 w-full"
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                >
                  Continuar
                </Button>
              </motion.div>
            ) : (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(2)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
                <h2 className="mb-4 text-lg font-semibold">Seus dados</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input label="Nome completo" error={errors.name?.message} {...register("name")} />
                  <Input label="CPF" error={errors.cpf?.message} {...register("cpf")} />
                  <Input label="Telefone" error={errors.phone?.message} {...register("phone")} />
                  <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
                  <Input label="Data de nascimento" type="date" error={errors.birthDate?.message} {...register("birthDate")} />
                  <Select
                    label="Gênero"
                    options={[
                      { value: "MALE", label: "Masculino" },
                      { value: "FEMALE", label: "Feminino" },
                      { value: "OTHER", label: "Outro" },
                      { value: "PREFER_NOT_SAY", label: "Prefiro não informar" },
                    ]}
                    error={errors.gender?.message}
                    {...register("gender")}
                  />
                  <Textarea label="Motivo da consulta" error={errors.reason?.message} {...register("reason")} />
                  <Textarea label="Observações (opcional)" {...register("notes")} />
                  <Button type="submit" className="w-full" loading={loading}>
                    Confirmar agendamento
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-glass-lg backdrop-blur-xl sm:p-8" suppressHydrationWarning>
        {content}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" suppressHydrationWarning>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="relative mx-auto max-w-2xl px-4 py-12">{content}</div>
    </div>
  );
}
