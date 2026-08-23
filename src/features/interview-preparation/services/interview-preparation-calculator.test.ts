import { describe, expect, it } from "vitest";

import {
  calculateInterviewPreparationProgress,
  EMPTY_INTERVIEW_PREPARATION,
  getCompletedPreparationSections,
} from "@/features/interview-preparation/services/interview-preparation-calculator";

describe("calculateInterviewPreparationProgress", () => {
  it("começa em zero quando nenhuma seção possui conteúdo", () => {
    expect(
      calculateInterviewPreparationProgress(EMPTY_INTERVIEW_PREPARATION),
    ).toEqual({ completed: 0, total: 5, percentage: 0 });
  });

  it("conta somente seções com conteúdo útil", () => {
    const values = {
      ...EMPTY_INTERVIEW_PREPARATION,
      companyResearch: "Produto B2B",
      roleAlignment: "   ",
      questionsToAsk: "Como o time mede impacto?",
    };

    expect(calculateInterviewPreparationProgress(values)).toEqual({
      completed: 2,
      total: 5,
      percentage: 40,
    });
    expect(getCompletedPreparationSections(values)).toEqual([
      "companyResearch",
      "questionsToAsk",
    ]);
  });

  it("marca 100% quando todas as seções foram preenchidas", () => {
    expect(
      calculateInterviewPreparationProgress({
        companyResearch: "Empresa",
        roleAlignment: "Vaga",
        starStories: "História",
        questionsToAsk: "Perguntas",
        logisticsNotes: "Logística",
      }),
    ).toEqual({ completed: 5, total: 5, percentage: 100 });
  });
});
