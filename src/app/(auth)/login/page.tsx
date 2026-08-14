import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getSafeRedirectPath } from "@/features/auth/services/redirects";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const initialError =
    params.confirmation === "error"
      ? "Não foi possível confirmar seu e-mail. Solicite um novo link."
      : undefined;

  return (
    <AuthShell
      title="Bem-vinda de volta"
      description="Acesse seu espaço e continue acompanhando suas oportunidades."
      footerText="Ainda não tem uma conta?"
      footerLinkLabel="Criar conta"
      footerLinkHref="/cadastro"
    >
      <AuthForm
        mode="login"
        redirectTo={getSafeRedirectPath(
          typeof params.next === "string" ? params.next : undefined,
        )}
        initialError={initialError}
      />
    </AuthShell>
  );
}
