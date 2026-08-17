"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getAuthErrorMessage } from "@/features/auth/services/auth-errors";
import {
  changePasswordSchema,
  preferencesSchema,
  profileSettingsSchema,
} from "@/features/settings/schemas/settings-schema";
import {
  updateProfileSettings,
  updateUserPreferences,
} from "@/features/settings/services/settings-service";
import type { SettingsActionResult } from "@/features/settings/types/settings";
import { createClient } from "@/lib/supabase/server";

const SESSION_EXPIRED = "Sua sessão expirou. Entre novamente.";
const INVALID_FIELDS = "Revise os campos informados e tente novamente.";

export async function updateProfile(
  input: unknown,
): Promise<SettingsActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: SESSION_EXPIRED };

  const parsed = profileSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: INVALID_FIELDS };

  const { data, error } = await updateProfileSettings(user.id, parsed.data);
  if (error || !data) {
    return { success: false, message: "Não foi possível atualizar o perfil." };
  }

  revalidatePath("/dashboard", "layout");
  return { success: true, message: "Perfil atualizado com sucesso." };
}

export async function updatePreferences(
  input: unknown,
): Promise<SettingsActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: SESSION_EXPIRED };

  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: INVALID_FIELDS };

  const { data, error } = await updateUserPreferences(user.id, parsed.data);
  if (error || !data) {
    return {
      success: false,
      message: "Não foi possível atualizar as preferências.",
    };
  }

  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/candidaturas/nova");
  revalidatePath("/dashboard/configuracoes");
  return { success: true, message: "Preferências atualizadas com sucesso." };
}

export async function changePassword(
  input: unknown,
): Promise<SettingsActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: SESSION_EXPIRED };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: INVALID_FIELDS };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
      current_password: parsed.data.currentPassword,
    });

    if (error) return { success: false, message: getAuthErrorMessage(error) };

    const { error: signOutError } = await supabase.auth.signOut({
      scope: "global",
    });
    if (signOutError) {
      console.error(
        "Senha alterada, mas a revogação global falhou",
        signOutError,
      );
      await supabase.auth.signOut({ scope: "local" });
    }

    return {
      success: true,
      message: "Senha alterada. Entre novamente com a nova senha.",
      redirectTo: "/login?feedback=password-changed",
    };
  } catch (error) {
    console.error("Falha inesperada ao alterar senha", error);
    return { success: false, message: getAuthErrorMessage(error) };
  }
}
