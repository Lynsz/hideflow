"use server";

import { headers } from "next/headers";

import { loginSchema, signUpSchema } from "@/features/auth/schemas/auth-schema";
import { getAuthErrorMessage } from "@/features/auth/services/auth-errors";
import { getSafeRedirectPath } from "@/features/auth/services/redirects";
import type { AuthActionResult } from "@/features/auth/types/auth";
import { createClient } from "@/lib/supabase/server";

const VALIDATION_ERROR = "Revise os campos informados e tente novamente.";

export async function login(
  input: unknown,
  requestedRedirect?: string,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: VALIDATION_ERROR };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { success: false, message: getAuthErrorMessage(error) };
    }

    return {
      success: true,
      message: "Login realizado com sucesso.",
      redirectTo: getSafeRedirectPath(requestedRedirect),
    };
  } catch (error) {
    console.error("Falha inesperada no login", error);
    return { success: false, message: getAuthErrorMessage(error) };
  }
}

export async function signUp(input: unknown): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: VALIDATION_ERROR };
  }

  try {
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
        ...(origin ? { emailRedirectTo: `${origin}/auth/callback` } : {}),
      },
    });

    if (error) {
      return { success: false, message: getAuthErrorMessage(error) };
    }

    if (data.session) {
      return {
        success: true,
        message: "Conta criada com sucesso.",
        redirectTo: "/dashboard",
      };
    }

    return {
      success: true,
      message:
        "Conta criada. Confira seu e-mail para confirmar o cadastro antes de entrar.",
    };
  } catch (error) {
    console.error("Falha inesperada no cadastro", error);
    return { success: false, message: getAuthErrorMessage(error) };
  }
}

export async function logout(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      return { success: false, message: getAuthErrorMessage(error) };
    }

    return {
      success: true,
      message: "Sessão encerrada.",
      redirectTo: "/login",
    };
  } catch (error) {
    console.error("Falha inesperada no logout", error);
    return { success: false, message: getAuthErrorMessage(error) };
  }
}
