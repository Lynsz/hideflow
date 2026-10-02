import type { Database } from "@/types/database";

export type ApplicationOffer =
  Database["public"]["Tables"]["application_offers"]["Row"];

export type OfferWithApplication = ApplicationOffer & {
  application: {
    id: string;
    job_title: string;
    status: Database["public"]["Tables"]["applications"]["Row"]["status"];
    archived_at: string | null;
    company: { id: string; name: string };
  };
};

export type OfferPortfolioFilter =
  "all" | "open" | "due_soon" | "overdue" | "no_deadline";
export type OfferPortfolioState = "open" | "due_soon" | "overdue" | "closed";
export type OfferPortfolioItem = OfferWithApplication & {
  portfolioState: OfferPortfolioState;
};
export type OfferPortfolioSummary = {
  total: number;
  open: number;
  dueSoon: number;
  overdue: number;
};
export type OfferPortfolioResult = {
  items: OfferPortfolioItem[];
  summary: OfferPortfolioSummary;
  isLimited: boolean;
  today: string;
};
