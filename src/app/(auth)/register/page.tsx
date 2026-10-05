import { PremiumAuthShell } from "@/components/auth/premium-auth-shell";
import { PremiumRegisterForm } from "@/components/auth/premium-register-form";

export default function RegisterPage() {
  return (
    <PremiumAuthShell>
      <PremiumRegisterForm />
    </PremiumAuthShell>
  );
}
