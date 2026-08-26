import { describe, expect, it } from "vitest";

import { weeklyReviewSchema } from "@/features/weekly-review/schemas/weekly-review-schema";
import { EMPTY_WEEKLY_REVIEW } from "@/features/weekly-review/services/weekly-review-calculator";

describe("weeklyReviewSchema", () => {
  it("aceita revisão parcial e remove espaços externos", () => {
    expect(
      weeklyReviewSchema.parse({
        ...EMPTY_WEEKLY_REVIEW,
        wins: "  Mantive o ritmo  ",
      }).wins,
    ).toBe("Mantive o ritmo");
  });

  it.each(["", "1", "3", "5"])("aceita a avaliação %s", (rating) => {
    expect(
      weeklyReviewSchema.safeParse({
        ...EMPTY_WEEKLY_REVIEW,
        overallRating: rating,
      }).success,
    ).toBe(true);
  });

  it("rejeita avaliação fora da escala", () => {
    expect(
      weeklyReviewSchema.safeParse({
        ...EMPTY_WEEKLY_REVIEW,
        overallRating: "6",
      }).success,
    ).toBe(false);
  });

  it("aplica os limites diferentes das seções", () => {
    expect(
      weeklyReviewSchema.safeParse({
        ...EMPTY_WEEKLY_REVIEW,
        wins: "x".repeat(4001),
      }).success,
    ).toBe(false);
    expect(
      weeklyReviewSchema.safeParse({
        ...EMPTY_WEEKLY_REVIEW,
        nextWeekFocus: "x".repeat(2001),
      }).success,
    ).toBe(false);
  });
});
