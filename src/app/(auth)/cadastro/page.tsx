import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Comece seu HireFlow"
      description="Crie sua conta para reunir candidaturas, entrevistas e próximos passos."
      footerText="Já possui uma conta?"
      footerLinkLabel="Entrar"
      footerLinkHref="/login"
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
