import type {
  OfferPortfolioFilter,
  OfferPortfolioItem,
  OfferPortfolioState,
  OfferPortfolioSummary,
  OfferWithApplication,
} from "@/features/offers/types/offer";

const FILTERS: readonly OfferPortfolioFilter[] = [
  "all",
  "open",
  "due_soon",
  "overdue",
  "no_deadline",
];
const STATE_RANK: Record<OfferPortfolioState, number> = {
  overdue: 0,
  due_soon: 1,
  open: 2,
  closed: 3,
};

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function getPortfolioState(
  offer: OfferWithApplication,
  today: string,
  dueSoonEnd: string,
): OfferPortfolioState {
  const isOpen =
    offer.application.archived_at === null &&
    offer.application.status === "offer";
  if (!isOpen) return "closed";
  if (!offer.decision_deadline) return "open";
  if (offer.decision_deadline < today) return "overdue";
  if (offer.decision_deadline <= dueSoonEnd) return "due_soon";
  return "open";
}

export function parseOfferPortfolioFilter(
  value: string | string[] | undefined,
): OfferPortfolioFilter {
  const filter = first(value);
  return FILTERS.includes(filter as OfferPortfolioFilter)
    ? (filter as OfferPortfolioFilter)
    : "all";
}

export function buildOfferPortfolio(
  offers: OfferWithApplication[],
  today: string,
) {
  const dueSoonEnd = addDays(today, 7);
  return offers.map<OfferPortfolioItem>((offer) => ({
    ...offer,
    portfolioState: getPortfolioState(offer, today, dueSoonEnd),
  }));
}

export function filterAndSortOfferPortfolio(
  items: OfferPortfolioItem[],
  filter: OfferPortfolioFilter,
) {
  return items
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "open") return item.portfolioState !== "closed";
      if (filter === "no_deadline") {
        return (
          item.portfolioState === "open" && item.decision_deadline === null
        );
      }
      return item.portfolioState === filter;
    })
    .toSorted((left, right) => {
      const byState =
        STATE_RANK[left.portfolioState] - STATE_RANK[right.portfolioState];
      if (byState !== 0) return byState;

      const leftDeadline = left.decision_deadline ?? "9999-12-31";
      const rightDeadline = right.decision_deadline ?? "9999-12-31";
      const byDeadline = leftDeadline.localeCompare(rightDeadline);
      if (byDeadline !== 0) return byDeadline;

      const byReceived = right.received_at.localeCompare(left.received_at);
      return byReceived || left.id.localeCompare(right.id);
    });
}

export function summarizeOfferPortfolio(
  items: OfferPortfolioItem[],
): OfferPortfolioSummary {
  return items.reduce<OfferPortfolioSummary>(
    (summary, item) => {
      summary.total += 1;
      if (item.portfolioState !== "closed") summary.open += 1;
      if (item.portfolioState === "due_soon") summary.dueSoon += 1;
      if (item.portfolioState === "overdue") summary.overdue += 1;
      return summary;
    },
    { total: 0, open: 0, dueSoon: 0, overdue: 0 },
  );
}
