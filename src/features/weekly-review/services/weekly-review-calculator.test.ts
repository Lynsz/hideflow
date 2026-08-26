import { describe, expect, it } from "vitest";

import {
  calculateWeeklyReviewProgress,
  EMPTY_WEEKLY_REVIEW,
} from "@/features/weekly-review/services/weekly-review-calculator";

describe("calculateWeeklyReviewProgress", () => {
  it("começa sem pontos preenchidos", () => {
    expect(calculateWeeklyReviewProgress(EMPTY_WEEKLY_REVIEW)).toEqual({
      completed: 0,
      total: 5,
      percentage: 0,
    });
  });

  it("conta avaliação e seções com conteúdo", () => {
    expect(
      calculateWeeklyReviewProgress({
        ...EMPTY_WEEKLY_REVIEW,
        overallRating: "4",
        wins: "Avancei nas entrevistas",
        lessons: "Preparação direcionada funciona",
      }),
    ).toEqual({ completed: 3, total: 5, percentage: 60 });
  });

  it("chega a cem por cento com todos os pontos", () => {
    expect(
      calculateWeeklyReviewProgress({
        overallRating: "5",
        wins: "Vitórias",
        challenges: "Desafios",
        lessons: "Aprendizados",
        nextWeekFocus: "Foco",
        completed: true,
      }).percentage,
    ).toBe(100);
  });
});
