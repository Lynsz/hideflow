import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Bem-vinda de volta"
      description="Acesse seu espaço e continue acompanhando suas oportunidades."
      footerText="Ainda não tem uma conta?"
      footerLinkLabel="Criar conta"
      footerLinkHref="/cadastro"
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
