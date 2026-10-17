import { describe, expect, it } from "vitest";

import {
  filterAndSortActivityPortfolio,
  parseActivityPortfolioFilter,
  summarizeActivityPortfolio,
} from "@/features/activities/services/activity-portfolio-rules";
import type { ActivityPortfolioItem } from "@/features/activities/types/activity";

function activity(
  id: string,
  type: ActivityPortfolioItem["activity_type"],
  occurredAt: string,
  applicationId = "application-1",
): ActivityPortfolioItem {
  return {
    id,
    application_id: applicationId,
    activity_type: type,
    title: `Registro ${id}`,
    notes: null,
    occurred_at: occurredAt,
    application: {
      id: applicationId,
      job_title: "Pessoa Desenvolvedora",
      archived_at: null,
      company: { id: "company-1", name: "HireFlow" },
    },
  };
}

describe("activity portfolio rules", () => {
  const items = [
    activity("email", "email", "2026-10-15T12:00:00.000Z"),
    activity(
      "linkedin",
      "linkedin",
      "2026-10-14T12:00:00.000Z",
      "application-2",
    ),
    activity("note", "note", "2026-10-01T12:00:00.000Z"),
    activity("phone", "phone_call", "2026-10-15T12:00:00.000Z"),
  ];

  it("normalizes URL filters", () => {
    expect(parseActivityPortfolioFilter("outreach")).toBe("outreach");
    expect(parseActivityPortfolioFilter("invalid")).toBe("all");
    expect(parseActivityPortfolioFilter(["notes"])).toBe("all");
  });

  it("filters interaction groups and keeps deterministic recency order", () => {
    expect(
      filterAndSortActivityPortfolio(items, "outreach").map((item) => item.id),
    ).toEqual(["email", "phone", "linkedin"]);
    expect(
      filterAndSortActivityPortfolio(items, "linkedin").map((item) => item.id),
    ).toEqual(["linkedin"]);
    expect(
      filterAndSortActivityPortfolio(items, "notes").map((item) => item.id),
    ).toEqual(["note"]);
  });

  it("summarizes activity volume without duplicating applications", () => {
    expect(
      summarizeActivityPortfolio(items, "2026-10-16T12:00:00.000Z"),
    ).toEqual({ total: 4, outreach: 3, applications: 2, recent: 3 });
  });
});
