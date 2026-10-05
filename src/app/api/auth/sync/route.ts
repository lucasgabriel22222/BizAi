import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncPrismaUserAndSession } from "@/lib/auth-sync";
import {
  checkRateLimit,
  getClientIp,
  isSupabaseConfigured,
  sanitizeText,
  validateSignupEmail,
} from "@/lib/auth-security";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }

  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`sync:${ip}`, 20, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const emailErr = validateSignupEmail(user.email);
  if (emailErr) {
    return NextResponse.json({ error: emailErr }, { status: 400 });
  }

  const name =
    sanitizeText(body.name as string, 120) ||
    (user.user_metadata?.full_name as string) ||
    user.email.split("@")[0];

  const prismaUser = await syncPrismaUserAndSession({
    email: user.email,
    name,
    slug: body.slug as string | undefined,
    specialty: sanitizeText((body.specialty as string) || "Psicologia", 80),
  });

  return NextResponse.json({
    user: {
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      slug: prismaUser.slug,
    },
  });
}
