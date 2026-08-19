import "server-only";

import type { OfferFormValues } from "@/features/offers/schemas/offer-schema";
import { createClient } from "@/lib/supabase/server";

const OFFER_WITH_APPLICATION_SELECT =
  "id, user_id, application_id, salary_amount, salary_period, currency, bonus_amount, equity, benefits, received_at, decision_deadline, notes, created_at, updated_at, application:applications!application_offers_application_owner_fkey(id, job_title, status, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;

const emptyToNull = (value: string) => (value === "" ? null : value);

function payload(values: OfferFormValues) {
  return {
    salary_amount: Number(values.salaryAmount),
    salary_period: values.salaryPeriod,
    currency: values.currency,
    bonus_amount: values.bonusAmount === "" ? null : Number(values.bonusAmount),
    equity: emptyToNull(values.equity),
    benefits: emptyToNull(values.benefits),
    received_at: values.receivedAt,
    decision_deadline: emptyToNull(values.decisionDeadline),
    notes: emptyToNull(values.notes),
  };
}

export async function getOffers(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_offers")
    .select(OFFER_WITH_APPLICATION_SELECT)
    .eq("user_id", userId)
    .order("received_at", { ascending: false })
    .order("id");
  if (error) throw new Error("Não foi possível carregar as propostas.");
  return data;
}

export async function saveOfferRecord(userId: string, values: OfferFormValues) {
  const supabase = await createClient();
  return supabase
    .from("application_offers")
    .upsert(
      {
        user_id: userId,
        application_id: values.applicationId,
        ...payload(values),
      },
      { onConflict: "application_id" },
    )
    .select("id, application_id")
    .single();
}

export async function deleteOfferRecord(userId: string, applicationId: string) {
  const supabase = await createClient();
  return supabase
    .from("application_offers")
    .delete()
    .eq("user_id", userId)
    .eq("application_id", applicationId)
    .select("id, application_id")
    .maybeSingle();
}
