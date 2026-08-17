import "server-only";

import type {
  PreferencesValues,
  ProfileSettingsValues,
} from "@/features/settings/schemas/settings-schema";
import type { UserSettings } from "@/features/settings/types/settings";
import { createClient } from "@/lib/supabase/server";

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, default_currency, analytics_period")
    .eq("id", userId)
    .single();

  if (error) throw new Error("Não foi possível carregar as configurações.");

  return {
    fullName: data.full_name,
    defaultCurrency: data.default_currency,
    analyticsPeriod: data.analytics_period,
  };
}

export async function updateProfileSettings(
  userId: string,
  values: ProfileSettingsValues,
) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .update({ full_name: values.fullName })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
}

export async function updateUserPreferences(
  userId: string,
  values: PreferencesValues,
) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .update({
      default_currency: values.defaultCurrency,
      analytics_period: values.analyticsPeriod,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
}
