"use server";

import { cookies, headers } from "next/headers";

import {
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_PATH,
} from "@/features/auth/constants";
import {
  newPasswordSchema,
  passwordRecoveryRequestSchema,
} from "@/features/auth/schemas/auth-schema";
import { getAuthErrorMessage } from "@/features/auth/services/auth-errors";
import type { AuthActionResult } from "@/features/auth/types/auth";
import { createClient } from "@/lib/supabase/server";

const RECOVERY_RESPONSE =
  "Se houver uma conta com este e-mail, você receberá as instruções de recuperação.";

function getVerifiedRequestOrigin(requestHeaders: Headers) {
  const origin = requestHeaders.get("origin");
  if (!origin) return null;

  try {
    const url = new URL(origin);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export async function requestPasswordRecovery(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = passwordRecoveryRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Informe um e-mail válido para recuperar sua conta.",
    };
  }

  try {
    const requestHeaders = await headers();
    const origin = getVerifiedRequestOrigin(requestHeaders);
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      origin
        ? {
            redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(PASSWORD_RECOVERY_PATH)}`,
          }
        : undefined,
    );

    // The public response is deliberately identical for existing and unknown
    // addresses so this endpoint cannot be used to enumerate accounts.
    if (error) console.error("Pedido de recuperação não enviado", error);
    return { success: true, message: RECOVERY_RESPONSE };
  } catch (error) {
    console.error("Falha inesperada na recuperação de senha", error);
    return { success: true, message: RECOVERY_RESPONSE };
  }
}

export async function resetPassword(input: unknown): Promise<AuthActionResult> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos informados e tente novamente.",
    };
  }

  const cookieStore = await cookies();
  if (cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value !== "active") {
    return {
      success: false,
      message: "Este link de recuperação é inválido ou expirou.",
    };
  }

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return {
        success: false,
        message: "Este link de recuperação é inválido ou expirou.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    if (error) return { success: false, message: getAuthErrorMessage(error) };

    cookieStore.delete(PASSWORD_RECOVERY_COOKIE);
    const { error: signOutError } = await supabase.auth.signOut({
      scope: "global",
    });
    if (signOutError) {
      console.error(
        "Senha redefinida, mas a revogação global falhou",
        signOutError,
      );
      await supabase.auth.signOut({ scope: "local" });
    }

    return {
      success: true,
      message: "Senha redefinida. Entre novamente com sua nova senha.",
      redirectTo: "/login?feedback=password-reset",
    };
  } catch (error) {
    console.error("Falha inesperada ao redefinir senha", error);
    return { success: false, message: getAuthErrorMessage(error) };
  }
}
