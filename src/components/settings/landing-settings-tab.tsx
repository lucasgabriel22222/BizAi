"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, User } from "lucide-react";
interface LandingSettingsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  bookingUrl: string;
}

export function LandingSettingsTab({ register, bookingUrl }: LandingSettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-purple" />
            Sua página pública
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground break-all">
            Link: <code className="rounded bg-muted px-2 py-1">{bookingUrl}</code>
          </p>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("landingPublished")} className="rounded" />
            <span className="text-sm">Página publicada (visível para pacientes)</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-purple" />
            Perfil na landing page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Nome profissional" {...register("name")} />
          <Input label="Especialidade (título curto)" {...register("specialty")} />
          <Input
            label="URL da foto de perfil"
            placeholder="https://..."
            {...register("avatar")}
          />
          <p className="text-xs text-muted-foreground">
            Cole o link de uma imagem (Google Drive público, Imgur, Supabase Storage, etc.)
          </p>
          <Input
            label="Título principal (headline)"
            placeholder="Psicóloga clínica — acolhimento e transformação"
            {...register("landingHeadline")}
          />
          <Textarea
            label="Apresentação / sobre você"
            placeholder="Conte um pouco sobre sua abordagem e como você ajuda seus pacientes..."
            {...register("landingBio")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Anos de experiência"
              type="number"
              min={0}
              {...register("yearsExperience")}
            />
            <Input label="Formação acadêmica" placeholder="UFX — Psicologia" {...register("education")} />
          </div>
          <Input
            label="Especialização"
            placeholder="TCC, ansiedade, depressão..."
            {...register("specializationText")}
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("showBirthPlace")} className="rounded" />
            <span className="text-sm">Mostrar naturalidade na página</span>
          </label>
          <Input label="Natural de (cidade/estado)" {...register("birthPlace")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço do consultório</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input label="Endereço" className="sm:col-span-2" {...register("officeAddress")} />
          <Input label="Cidade" {...register("officeCity")} />
          <Input label="Estado (UF)" maxLength={2} {...register("officeState")} />
          <Input label="CEP" {...register("officeZip")} />
        </CardContent>
      </Card>
    </div>
  );
}
