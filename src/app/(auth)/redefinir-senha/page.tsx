import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { NewPasswordForm } from "@/features/auth/components/new-password-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { PASSWORD_RECOVERY_COOKIE } from "@/features/auth/constants";
import { getCurrentUser } from "@/features/auth/services/get-current-user";

export const metadata: Metadata = { title: "Redefinir senha" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const [user, cookieStore] = await Promise.all([getCurrentUser(), cookies()]);
  if (!user || cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value !== "active") {
    redirect("/recuperar-senha?feedback=invalid");
  }

  return (
    <AuthShell
      title="Crie uma nova senha"
      description="O link foi validado. Escolha uma senha diferente e mantenha sua conta protegida."
      footerText="Precisa começar de novo?"
      footerLinkLabel="Solicitar outro link"
      footerLinkHref="/recuperar-senha"
    >
      <NewPasswordForm />
    </AuthShell>
  );
}
