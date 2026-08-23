import { describe, expect, it } from "vitest";

import {
  interviewPreparationSchema,
  type InterviewPreparationValues,
} from "@/features/interview-preparation/schemas/interview-preparation-schema";
import { EMPTY_INTERVIEW_PREPARATION } from "@/features/interview-preparation/services/interview-preparation-calculator";

function values(
  overrides: Partial<InterviewPreparationValues> = {},
): InterviewPreparationValues {
  return { ...EMPTY_INTERVIEW_PREPARATION, ...overrides };
}

describe("interviewPreparationSchema", () => {
  it("aceita uma preparação parcial e remove espaços externos", () => {
    expect(
      interviewPreparationSchema.parse(
        values({ companyResearch: "  Produto B2B  " }),
      ).companyResearch,
    ).toBe("Produto B2B");
  });

  it("permite salvar todas as seções vazias", () => {
    expect(
      interviewPreparationSchema.safeParse(EMPTY_INTERVIEW_PREPARATION).success,
    ).toBe(true);
  });

  it("rejeita seções gerais acima de 4000 caracteres", () => {
    expect(
      interviewPreparationSchema.safeParse(
        values({ starStories: "x".repeat(4001) }),
      ).success,
    ).toBe(false);
  });

  it("rejeita logística acima de 2000 caracteres", () => {
    expect(
      interviewPreparationSchema.safeParse(
        values({ logisticsNotes: "x".repeat(2001) }),
      ).success,
    ).toBe(false);
  });
});
