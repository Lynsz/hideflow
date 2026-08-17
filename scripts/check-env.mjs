import { existsSync } from "node:fs";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const errors = [];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const siteUrl = process.env.SITE_URL?.trim();

if (!supabaseUrl) {
  errors.push("NEXT_PUBLIC_SUPABASE_URL não foi definida.");
} else {
  try {
    const url = new URL(supabaseUrl);
    const isLocal =
      url.hostname === "127.0.0.1" || url.hostname === "localhost";
    const usesAllowedProtocol =
      url.protocol === "https:" || (url.protocol === "http:" && isLocal);
    if (!usesAllowedProtocol) {
      errors.push(
        "NEXT_PUBLIC_SUPABASE_URL deve usar HTTPS, exceto no Supabase local.",
      );
    }
  } catch {
    errors.push("NEXT_PUBLIC_SUPABASE_URL não contém uma URL válida.");
  }
}

if (!supabaseKey) {
  errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY não foi definida.");
} else if (
  supabaseKey.startsWith("sb_secret_") ||
  supabaseKey.toLowerCase().includes("service_role")
) {
  errors.push(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY não pode conter uma secret ou service role key.",
  );
} else {
  const jwtPayload = supabaseKey.split(".")[1];
  if (jwtPayload) {
    try {
      const payload = JSON.parse(
        Buffer.from(jwtPayload, "base64url").toString("utf8"),
      );
      if (payload.role === "service_role") {
        errors.push(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY contém uma service role key.",
        );
      }
    } catch {
      // Publishable keys are not JWTs. Values are never printed by this check.
    }
  }
}

if (siteUrl) {
  try {
    const url = new URL(siteUrl);
    const isLocal =
      url.hostname === "127.0.0.1" || url.hostname === "localhost";
    const usesAllowedProtocol =
      url.protocol === "https:" || (url.protocol === "http:" && isLocal);
    if (!usesAllowedProtocol) {
      errors.push("SITE_URL deve usar HTTPS fora do ambiente local.");
    }
  } catch {
    errors.push("SITE_URL não contém uma URL válida.");
  }
}

if (errors.length > 0) {
  console.error("Configuração de ambiente inválida:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Variáveis públicas do Supabase validadas sem expor valores.");
}
