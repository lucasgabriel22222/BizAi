"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, User, Phone, Mail, Calendar, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientForm } from "./patient-form";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  avatar?: string;
  totalSpent: number;
  completedCount: number;
  lastAppointment?: { date: string; startTime: string };
  nextAppointment?: { date: string; startTime: string };
}

export function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/patients?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setPatients(data.patients || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Excluir o paciente ${name}? Esta ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Paciente excluído");
      fetchPatients();
    } else {
      toast.error("Erro ao excluir paciente");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por nome, CPF, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-border/50 bg-card/50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
        <Button onClick={() => { setSelectedPatient(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          Novo paciente
        </Button>
      </div>

      {showForm && (
        <PatientForm
          patient={selectedPatient}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchPatients(); }}
        />
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={User}
          title="Nenhum paciente encontrado"
          description="Cadastre seu primeiro paciente ou ajuste a busca"
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Cadastrar paciente
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="group transition-all hover:shadow-glass-lg"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white font-bold">
                    {getInitials(patient.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{patient.name}</h3>
                    <p className="text-xs text-muted-foreground">CPF: {patient.cpf}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatient(patient);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={(e) => handleDelete(e, patient.id, patient.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  {patient.lastAppointment && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Última: {formatDate(patient.lastAppointment.date)}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total gasto</p>
                    <p className="font-semibold text-brand-purple">
                      {formatCurrency(patient.totalSpent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Consultas</p>
                    <p className="font-semibold">{patient.completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
