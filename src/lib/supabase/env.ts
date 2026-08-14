import { z } from "zod";

const supabaseEnvSchema = z.object({
  url: z.url("NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida."),
  anonKey: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória."),
});

export function getSupabaseEnv() {
  const result = supabaseEnvSchema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!result.success) {
    const details = result.error.issues.map((issue) => issue.message).join(" ");
    throw new Error(`Configuração do Supabase inválida. ${details}`);
  }

  return result.data;
}
