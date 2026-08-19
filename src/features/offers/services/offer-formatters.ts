import { OFFER_SALARY_PERIOD_LABELS } from "@/features/offers/constants";
import type { ApplicationOffer } from "@/features/offers/types/offer";

export function formatOfferMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatOfferSalary(
  offer: Pick<ApplicationOffer, "salary_amount" | "salary_period" | "currency">,
) {
  return `${formatOfferMoney(offer.salary_amount, offer.currency)} · ${OFFER_SALARY_PERIOD_LABELS[offer.salary_period].toLowerCase()}`;
}

export function formatOfferDate(value: string | null) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${value}T12:00:00Z`),
  );
}

export function getAnnualBaseSalary(
  offer: Pick<ApplicationOffer, "salary_amount" | "salary_period">,
) {
  return offer.salary_period === "monthly"
    ? offer.salary_amount * 12
    : offer.salary_amount;
}
