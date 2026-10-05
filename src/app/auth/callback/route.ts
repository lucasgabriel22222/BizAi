import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncPrismaUserAndSession } from "@/lib/auth-sync";
import { isSupabaseConfigured } from "@/lib/auth-security";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      const meta = user.user_metadata || {};
      await syncPrismaUserAndSession({
        email: user.email,
        name: (meta.full_name as string) || (meta.name as string) || user.email.split("@")[0],
        slug: meta.slug as string | undefined,
        specialty: (meta.specialty as string) || "Psicologia",
      });
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
