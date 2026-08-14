import "server-only";

import { cache } from "react";

import type { AuthenticatedUser } from "@/features/auth/types/auth";
import { createClient } from "@/lib/supabase/server";

function getMetadataName(userMetadata: unknown) {
  if (typeof userMetadata !== "object" || userMetadata === null) return "";

  const fullName = Reflect.get(userMetadata, "full_name");
  return typeof fullName === "string" ? fullName.trim() : "";
}

export const getCurrentUser = cache(
  async (): Promise<AuthenticatedUser | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;

    if (error || !claims?.sub) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", claims.sub)
      .maybeSingle();

    const email = typeof claims.email === "string" ? claims.email : "";
    const metadataName = getMetadataName(claims.user_metadata);
    const fallbackName = email.split("@")[0] || "Usuário";

    return {
      id: claims.sub,
      email,
      fullName: profile?.full_name.trim() || metadataName || fallbackName,
      avatarUrl: profile?.avatar_url ?? null,
    };
  },
);
