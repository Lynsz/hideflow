import type { Metadata } from "next";

import { PasswordRecoveryForm } from "@/features/auth/components/password-recovery-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export const metadata: Metadata = { title: "Recuperar senha" };
export const dynamic = "force-dynamic";

export default async function PasswordRecoveryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialError =
    params.feedback === "invalid"
      ? "Solicite um novo link para continuar com segurança."
      : undefined;

  return (
    <AuthShell
      title="Recupere seu acesso"
      description="Informe o e-mail da conta. Se ele estiver cadastrado, enviaremos um link temporário para criar uma nova senha."
      footerText="Lembrou sua senha?"
      footerLinkLabel="Voltar ao login"
      footerLinkHref="/login"
    >
      <PasswordRecoveryForm initialError={initialError} />
    </AuthShell>
  );
}
