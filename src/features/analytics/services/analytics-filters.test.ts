import { describe, expect, it } from "vitest";

import {
  buildAnalyticsUrl,
  parseAnalyticsFilters,
} from "@/features/analytics/services/analytics-filters";

describe("analytics filters", () => {
  it("usa 12 meses como período padrão", () => {
    expect(parseAnalyticsFilters({})).toEqual({ period: "12m", companyId: "" });
  });

  it("usa a preferência informada quando a URL não define período", () => {
    expect(parseAnalyticsFilters({}, "6m")).toEqual({
      period: "6m",
      companyId: "",
    });
  });

  it("aceita período e empresa válidos", () => {
    expect(
      parseAnalyticsFilters({
        period: "6m",
        company: "11111111-1111-4111-8111-111111111111",
      }),
    ).toEqual({
      period: "6m",
      companyId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("descarta valores manipulados", () => {
    expect(
      parseAnalyticsFilters({ period: "forever", company: "not-a-uuid" }),
    ).toEqual({ period: "12m", companyId: "" });
  });

  it("gera URL canônica sem parâmetros padrão", () => {
    expect(buildAnalyticsUrl({ period: "12m", companyId: "" })).toBe(
      "/dashboard/analytics",
    );
    expect(
      buildAnalyticsUrl({
        period: "all",
        companyId: "11111111-1111-4111-8111-111111111111",
      }),
    ).toBe(
      "/dashboard/analytics?period=all&company=11111111-1111-4111-8111-111111111111",
    );
  });
});
