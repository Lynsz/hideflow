import "server-only";

import { normalizeTechnologyName } from "@/features/technologies/services/technology-normalizer";
import { createClient } from "@/lib/supabase/server";

export async function getTechnologyOptions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technologies")
    .select("id, name")
    .eq("user_id", userId)
    .order("name")
    .limit(200);

  if (error) throw new Error("Não foi possível carregar as tecnologias.");
  return data;
}

async function findTechnology(userId: string, normalizedName: string) {
  const supabase = await createClient();
  return supabase
    .from("technologies")
    .select("id, name")
    .eq("user_id", userId)
    .eq("normalized_name", normalizedName)
    .maybeSingle();
}

async function findOrCreateTechnology(userId: string, rawName: string) {
  const { name, normalizedName } = normalizeTechnologyName(rawName);
  const existing = await findTechnology(userId, normalizedName);
  if (existing.error) return { data: null, error: existing.error };
  if (existing.data) return { data: existing.data, error: null };

  const supabase = await createClient();
  const inserted = await supabase
    .from("technologies")
    .insert({ user_id: userId, name })
    .select("id, name")
    .single();

  if (!inserted.error) return inserted;
  if (inserted.error.code !== "23505") return inserted;

  return findTechnology(userId, normalizedName);
}

export async function addTechnologyToApplication(
  userId: string,
  applicationId: string,
  name: string,
) {
  const supabase = await createClient();
  const application = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", userId)
    .eq("id", applicationId)
    .maybeSingle();

  if (application.error || !application.data) {
    return { outcome: "not_found" as const, error: application.error };
  }

  const technology = await findOrCreateTechnology(userId, name);
  if (technology.error || !technology.data) {
    return { outcome: "error" as const, error: technology.error };
  }

  const link = await supabase.from("application_technologies").insert({
    user_id: userId,
    application_id: applicationId,
    technology_id: technology.data.id,
  });

  if (!link.error) return { outcome: "created" as const };
  if (link.error.code === "23505") return { outcome: "exists" as const };
  return { outcome: "error" as const, error: link.error };
}

export async function removeTechnologyFromApplication(
  userId: string,
  applicationId: string,
  technologyId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("application_technologies")
    .delete()
    .eq("user_id", userId)
    .eq("application_id", applicationId)
    .eq("technology_id", technologyId)
    .select("technology_id")
    .maybeSingle();
}
