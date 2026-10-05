"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, Sparkles } from "lucide-react";
import { RiUserAddFill } from "@remixicon/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { premiumRegisterSchema } from "@/lib/validators";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, validateSignupEmail } from "@/lib/auth-security";
import { slugify } from "@/lib/utils";

type RegisterForm = z.infer<typeof premiumRegisterSchema>;

export function PremiumRegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slugPreview, setSlugPreview] = useState("");
  const [passVisible, setPassVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const useSupabase = isSupabaseConfigured();
  const appHost =
    typeof window !== "undefined" ? window.location.host : "BizAi.com";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(premiumRegisterSchema),
    defaultValues: { specialty: "Psicologia" },
  });

  const name = watch("name");
  const slug = watch("slug");

  useEffect(() => {
    if (!slug && name) {
      const s = slugify(name);
      setValue("slug", s);
      setSlugPreview(s);
    } else {
      setSlugPreview(slug || "");
    }
  }, [name, slug, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    const emailErr = validateSignupEmail(data.email);
    if (emailErr) {
      toast.error(emailErr);
      return;
    }

    setLoading(true);
    try {
      if (useSupabase) {
        const supabase = createClient();
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.name,
              slug: data.slug,
              specialty: data.specialty,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw new Error(error.message);

        if (signUpData.session) {
          const syncRes = await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              slug: data.slug,
              specialty: data.specialty,
            }),
          });
          if (!syncRes.ok) {
            const j = await syncRes.json();
            throw new Error(j.error);
          }
          toast.success("Conta criada! Bem-vindo ao BizAi.");
          router.push("/dashboard");
          router.refresh();
          return;
        }

        toast.success("Verifique seu email para confirmar a conta.");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Conta criada! 7 dias grátis começaram agora.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex w-full max-w-[440px] border border-white/[0.08] bg-black shadow-2xl flex-col gap-6 p-5 md:p-8 text-white">
      <CardHeader className="flex flex-col items-center gap-2 p-0">
        <div className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl md:size-20 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10">
          <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-neutral-900 border border-white/[0.08] shadow-xs ring-1 ring-inset ring-border md:size-14">
            <RiUserAddFill className="size-6 text-muted-foreground/80 md:size-7" />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5 text-center">
          <CardTitle className="md:text-xl font-medium text-white">
            Crie sua conta
          </CardTitle>
          <CardDescription className="tracking-[-0.006em] text-neutral-400">
            Preencha os campos abaixo para iniciar seu teste grátis.
          </CardDescription>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-center text-xs text-emerald-400 font-medium">
            7 dias grátis · Sem cartão de crédito
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Dra. Ana Silva"
              className="rounded-lg border-white/[0.08] bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/20"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="rounded-lg border-white/[0.08] bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/20"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                className="pe-9 rounded-lg border-white/[0.08] bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/20"
                placeholder="Senha (mín. 8 caracteres)"
                type={passVisible ? "text" : "password"}
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                className="text-neutral-400 hover:text-white absolute inset-y-0 end-0 flex h-10 w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none"
                type="button"
                onClick={() => setPassVisible(!passVisible)}
              >
                {passVisible ? (
                  <EyeOffIcon size={16} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                className="pe-9 rounded-lg border-white/[0.08] bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/20"
                placeholder="Repita a senha"
                type={confirmPassVisible ? "text" : "password"}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <button
                className="text-neutral-400 hover:text-white absolute inset-y-0 end-0 flex h-10 w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none"
                type="button"
                onClick={() => setConfirmPassVisible(!confirmPassVisible)}
              >
                {confirmPassVisible ? (
                  <EyeOffIcon size={16} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="slug">Seu link público</Label>
            <Input
              id="slug"
              placeholder="ana-silva"
              className="rounded-lg border-white/[0.08] bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/20"
              error={errors.slug?.message}
              {...register("slug", {
                onChange: (e) => setSlugPreview(slugify(e.target.value)),
              })}
            />
            <p className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-400">
              Preview:{" "}
              <span className="font-mono text-white">
                {appHost}/agendar/{slugPreview || "seu-link"}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="specialty">Especialidade</Label>
            <Input
              id="specialty"
              placeholder="Psicologia Clínica"
              className="rounded-lg border-white/[0.08] bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/20"
              error={errors.specialty?.message}
              {...register("specialty")}
            />
          </div>

          <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 mt-2" disabled={loading}>
            {loading ? "Criando conta..." : "Começar teste grátis"}
          </Button>

          <Separator className="my-2" />

          <p className="text-center text-xs text-neutral-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-semibold text-white hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

