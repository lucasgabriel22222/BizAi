"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, Mail } from "lucide-react";
import { RiUserFill } from "@remixicon/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { loginSchema, type LoginInput } from "@/lib/validators";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth-security";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

type LoginMode = "password" | "otp";

export function PremiumLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const useSupabase = isSupabaseConfigured();

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const redirect = searchParams.get("redirect") || "/dashboard";

  const syncSession = async () => {
    const res = await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Erro ao sincronizar sessão");
    }
    router.push(redirect);
    router.refresh();
  };

  const handleGoogleOAuth = async () => {
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirect) callbackUrl.searchParams.set("next", redirect);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  };

  const handleMicrosoftOAuth = async () => {
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirect) callbackUrl.searchParams.set("next", redirect);
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo: callbackUrl.toString() },
    });
  };

  const handleSendOtp = async () => {
    if (!otpEmail) {
      toast.error("Insira seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (redirect) callbackUrl.searchParams.set("next", redirect);
      const { error } = await supabase.auth.signInWithOtp({
        email: otpEmail,
        options: { emailRedirectTo: callbackUrl.toString() },
      });
      if (error) throw new Error(error.message);
      setOtpSent(true);
      toast.success("Verifique seu email para o link de acesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar link");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      if (useSupabase) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw new Error(error.message);
        await syncSession();
        toast.success("Bem-vindo de volta!");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Bem-vindo de volta!");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex w-full max-w-[440px] border border-white/[0.08] bg-black shadow-2xl flex-col gap-6 p-5 md:p-8 text-white">
      <CardHeader className="flex flex-col items-center gap-2 p-0">
        <div className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl md:size-20 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10">
          <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-neutral-900 border border-white/[0.08] shadow-xs ring-1 ring-inset ring-border md:size-14">
            <RiUserFill className="size-6 text-muted-foreground/80 md:size-7" />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5 text-center">
          <CardTitle className="md:text-xl font-medium text-white">
            Acesse sua conta
          </CardTitle>
          <CardDescription className="tracking-[-0.006em] text-neutral-400">
            Insira suas credenciais para acessar sua clínica.
          </CardDescription>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0 flex flex-col gap-4">
        {useSupabase && (
          <>
            {/* OAuth Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleGoogleOAuth}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#050505] py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.05]"
              >
                <GoogleIcon />
                Continuar com Google
              </button>
              <button
                type="button"
                onClick={handleMicrosoftOAuth}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#050505] py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.05]"
              >
                <MicrosoftIcon />
                Continuar com Microsoft
              </button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.08]" />
              </div>
              <span className="relative mx-auto block w-fit bg-black px-2 text-xs text-neutral-500">
                ou e-mail
              </span>
            </div>

            {/* Mode toggle tabs */}
            <div className="flex rounded-lg border border-white/[0.08] bg-white/5 p-1 gap-1">
              <button
                type="button"
                onClick={() => { setLoginMode("password"); setOtpSent(false); }}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                  loginMode === "password"
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Senha
              </button>
              <button
                type="button"
                onClick={() => { setLoginMode("otp"); setOtpSent(false); }}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  loginMode === "otp"
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Mail className="h-3 w-3" />
                Link mágico
              </button>
            </div>
          </>
        )}

        {/* OTP Mode */}
        {useSupabase && loginMode === "otp" ? (
          otpSent ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/5 p-4 text-center text-sm text-neutral-300">
              ✉️ Verifique seu email para o link de acesso
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="otp-email">E-mail</Label>
                <Input
                  id="otp-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  className="rounded-lg border-white/[0.08] bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/20"
                />
              </div>
              <Button
                type="button"
                onClick={handleSendOtp}
                className="w-full bg-white text-black hover:bg-neutral-200"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar link de acesso"}
              </Button>
            </div>
          )
        ) : (
          /* Password Mode */
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                  placeholder="Senha"
                  type={isVisible ? "text" : "password"}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  className="text-neutral-400 hover:text-white absolute inset-y-0 end-0 flex h-10 w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none"
                  type="button"
                  onClick={toggleVisibility}
                  aria-label={isVisible ? "Esconder senha" : "Mostrar senha"}
                  aria-pressed={isVisible}
                  aria-controls="password"
                >
                  {isVisible ? (
                    <EyeOffIcon size={16} aria-hidden="true" />
                  ) : (
                    <EyeIcon size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-1">
              <div className="flex items-start gap-2">
                <Checkbox id="keep-me-logged-in" />
                <Label
                  htmlFor="keep-me-logged-in"
                  className="block cursor-pointer text-neutral-400"
                >
                  Lembrar-me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-xs text-neutral-400 hover:text-white hover:underline transition">
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        )}

        <Separator className="my-2" />

        <p className="text-center text-xs text-neutral-400">
          Não tem uma conta?{" "}
          <Link href="/register" className="font-semibold text-white hover:underline">
            Crie uma conta grátis
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
