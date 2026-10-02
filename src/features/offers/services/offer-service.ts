import "server-only";

import type { OfferFormValues } from "@/features/offers/schemas/offer-schema";
import {
  buildOfferPortfolio,
  filterAndSortOfferPortfolio,
  summarizeOfferPortfolio,
} from "@/features/offers/services/offer-portfolio-rules";
import type {
  OfferPortfolioFilter,
  OfferPortfolioResult,
  OfferWithApplication,
} from "@/features/offers/types/offer";
import { createClient } from "@/lib/supabase/server";

const OFFER_PORTFOLIO_LIMIT = 300;
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

export async function getOfferPortfolio(
  userId: string,
  filter: OfferPortfolioFilter,
  today = new Date().toISOString().slice(0, 10),
): Promise<OfferPortfolioResult> {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("application_offers")
    .select(OFFER_WITH_APPLICATION_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .order("received_at", { ascending: false })
    .order("id")
    .range(0, OFFER_PORTFOLIO_LIMIT - 1);
  if (error) throw new Error("Não foi possível carregar as propostas.");

  const offers = data satisfies OfferWithApplication[];
  const portfolio = buildOfferPortfolio(offers, today);
  return {
    items: filterAndSortOfferPortfolio(portfolio, filter),
    summary: summarizeOfferPortfolio(portfolio),
    isLimited: (count ?? offers.length) > offers.length,
    today,
  };
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
