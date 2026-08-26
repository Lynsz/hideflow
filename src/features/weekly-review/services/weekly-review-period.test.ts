import { describe, expect, it } from "vitest";

import {
  formatWeeklyReviewDate,
  isValidReviewWeekStart,
  parseWeeklyReviewPeriod,
  shiftWeeklyReviewPeriod,
} from "@/features/weekly-review/services/weekly-review-period";

describe("weekly review period", () => {
  it("seleciona a segunda-feira UTC da semana atual", () => {
    expect(
      parseWeeklyReviewPeriod(undefined, "2026-08-25T18:00:00.000Z"),
    ).toEqual({
      period: {
        start: "2026-08-24T00:00:00.000Z",
        endExclusive: "2026-08-31T00:00:00.000Z",
        startDate: "2026-08-24",
        endDateExclusive: "2026-08-31",
      },
      currentWeekStart: "2026-08-24",
    });
  });

  it("normaliza uma data intermediária e bloqueia semanas futuras", () => {
    expect(
      parseWeeklyReviewPeriod("2026-08-19", "2026-08-25T18:00:00.000Z").period
        .startDate,
    ).toBe("2026-08-17");
    expect(
      parseWeeklyReviewPeriod("2026-09-10", "2026-08-25T18:00:00.000Z").period
        .startDate,
    ).toBe("2026-08-24");
  });

  it("navega por semanas e rejeita datas que não são segunda-feira", () => {
    expect(shiftWeeklyReviewPeriod("2026-08-24", -1)).toBe("2026-08-17");
    expect(() => shiftWeeklyReviewPeriod("2026-08-25", 1)).toThrow(
      "Início de semana inválido.",
    );
  });

  it("valida semana para mutations e formata datas civis", () => {
    expect(
      isValidReviewWeekStart("2026-08-24", "2026-08-25T18:00:00.000Z"),
    ).toBe(true);
    expect(
      isValidReviewWeekStart("2026-08-31", "2026-08-25T18:00:00.000Z"),
    ).toBe(false);
    expect(formatWeeklyReviewDate("2026-08-24")).toMatch(/^24 ago\.?$/);
  });
});
