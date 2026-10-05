import { Suspense } from "react";
import { PremiumAuthShell } from "@/components/auth/premium-auth-shell";
import { PremiumLoginForm } from "@/components/auth/premium-login-form";

export default function LoginPage() {
  return (
    <PremiumAuthShell>
      <Suspense fallback={<p className="text-center text-sm text-white/50">Carregando...</p>}>
        <PremiumLoginForm />
      </Suspense>
    </PremiumAuthShell>
  );
}
