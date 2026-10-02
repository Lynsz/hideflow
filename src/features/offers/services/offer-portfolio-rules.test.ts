import { describe, expect, it } from "vitest";

import {
  buildOfferPortfolio,
  filterAndSortOfferPortfolio,
  parseOfferPortfolioFilter,
  summarizeOfferPortfolio,
} from "@/features/offers/services/offer-portfolio-rules";
import type { OfferWithApplication } from "@/features/offers/types/offer";

function offer(
  id: string,
  deadline: string | null,
  status: OfferWithApplication["application"]["status"] = "offer",
): OfferWithApplication {
  return {
    id,
    user_id: "user-1",
    application_id: `application-${id}`,
    salary_amount: 8_000,
    salary_period: "monthly",
    currency: "BRL",
    bonus_amount: null,
    equity: null,
    benefits: null,
    received_at: "2026-09-25",
    decision_deadline: deadline,
    notes: null,
    created_at: "2026-09-25T12:00:00.000Z",
    updated_at: "2026-09-25T12:00:00.000Z",
    application: {
      id: `application-${id}`,
      job_title: `Vaga ${id}`,
      status,
      archived_at: null,
      company: { id: `company-${id}`, name: `Empresa ${id}` },
    },
  };
}

describe("offer portfolio rules", () => {
  it("normaliza filtros desconhecidos", () => {
    expect(parseOfferPortfolioFilter("overdue")).toBe("overdue");
    expect(parseOfferPortfolioFilter("invalid")).toBe("all");
    expect(parseOfferPortfolioFilter(["open"])).toBe("all");
  });

  it("deriva os estados usando prazo civil e situação da candidatura", () => {
    const items = buildOfferPortfolio(
      [
        offer("overdue", "2026-09-30"),
        offer("soon", "2026-10-08"),
        offer("open", null),
        offer("closed", "2026-10-02", "hired"),
      ],
      "2026-10-01",
    );

    expect(items.map((item) => item.portfolioState)).toEqual([
      "overdue",
      "due_soon",
      "open",
      "closed",
    ]);
    expect(summarizeOfferPortfolio(items)).toEqual({
      total: 4,
      open: 3,
      dueSoon: 1,
      overdue: 1,
    });
  });

  it("filtra pendências sem prazo e ordena por urgência", () => {
    const items = buildOfferPortfolio(
      [
        offer("closed", "2026-10-02", "hired"),
        offer("open", null),
        offer("soon", "2026-10-03"),
        offer("overdue", "2026-09-30"),
      ],
      "2026-10-01",
    );

    expect(
      filterAndSortOfferPortfolio(items, "all").map((item) => item.id),
    ).toEqual(["overdue", "soon", "open", "closed"]);
    expect(
      filterAndSortOfferPortfolio(items, "no_deadline").map((item) => item.id),
    ).toEqual(["open"]);
  });
});
