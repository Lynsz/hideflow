import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { getCurrentUser } from "@/features/auth/services/get-current-user";

export const metadata: Metadata = { title: "Criar conta" };
export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

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
