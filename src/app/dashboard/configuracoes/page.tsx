import { Settings } from "lucide-react";
import type { Metadata } from "next";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  ChangePasswordForm,
  PreferencesForm,
  ProfileSettingsForm,
} from "@/features/settings/components/settings-forms";
import { getUserSettings } from "@/features/settings/services/settings-service";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const settings = await getUserSettings(user!.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header>
        <p className="text-muted-foreground text-xs font-medium">Sua conta</p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Configurações
          <Settings className="text-accent size-5" aria-hidden="true" />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Atualize seu perfil, seus padrões de uso e a segurança da conta.
        </p>
      </header>

      <div className="mt-7 grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ProfileSettingsForm
            email={user!.email}
            fullName={settings.fullName}
          />
          <PreferencesForm settings={settings} />
        </div>
        <ChangePasswordForm />
      </div>
    </main>
  );
}
