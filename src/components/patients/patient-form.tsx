"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { patientSchema, type PatientInput } from "@/lib/validators";
import { toast } from "sonner";

interface PatientFormProps {
  patient?: { id: string; name: string; cpf: string; phone: string; email: string; notes?: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PatientForm({ patient, onClose, onSuccess }: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!patient?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient || {},
  });

  const onSubmit = async (data: PatientInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/patients/${patient.id}` : "/api/patients";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(isEdit ? "Paciente atualizado!" : "Paciente cadastrado!");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-glass-lg animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEdit ? "Editar paciente" : "Novo paciente"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome completo" error={errors.name?.message} {...register("name")} />
          <Input label="CPF" placeholder="000.000.000-00" error={errors.cpf?.message} {...register("cpf")} />
          <Input label="Telefone" error={errors.phone?.message} {...register("phone")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Data de nascimento" type="date" {...register("birthDate")} />
          <Select
            label="Gênero"
            options={[
              { value: "", label: "Selecione" },
              { value: "MALE", label: "Masculino" },
              { value: "FEMALE", label: "Feminino" },
              { value: "OTHER", label: "Outro" },
              { value: "PREFER_NOT_SAY", label: "Prefiro não informar" },
            ]}
            {...register("gender")}
          />
          <Textarea label="Observações" {...register("notes")} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
