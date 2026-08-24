import { describe, expect, it } from "vitest";

import {
  interviewDebriefSchema,
  type InterviewDebriefValues,
} from "@/features/interview-debrief/schemas/interview-debrief-schema";
import { EMPTY_INTERVIEW_DEBRIEF } from "@/features/interview-debrief/services/interview-debrief-calculator";

function values(
  overrides: Partial<InterviewDebriefValues> = {},
): InterviewDebriefValues {
  return { ...EMPTY_INTERVIEW_DEBRIEF, ...overrides };
}

describe("interviewDebriefSchema", () => {
  it("aceita retrospectiva parcial e remove espaços externos", () => {
    expect(
      interviewDebriefSchema.parse(values({ wentWell: "  Boa conversa  " }))
        .wentWell,
    ).toBe("Boa conversa");
  });

  it.each(["", "1", "3", "5"])("aceita a avaliação pública %s", (rating) => {
    expect(
      interviewDebriefSchema.safeParse({
        ...EMPTY_INTERVIEW_DEBRIEF,
        overallRating: rating,
      }).success,
    ).toBe(true);
  });

  it("rejeita avaliações fora da escala", () => {
    expect(
      interviewDebriefSchema.safeParse({
        ...EMPTY_INTERVIEW_DEBRIEF,
        overallRating: "6",
      }).success,
    ).toBe(false);
  });

  it("rejeita seções gerais acima de 4000 caracteres", () => {
    expect(
      interviewDebriefSchema.safeParse(
        values({ questionsReceived: "x".repeat(4001) }),
      ).success,
    ).toBe(false);
  });

  it("rejeita follow-up acima de 2000 caracteres", () => {
    expect(
      interviewDebriefSchema.safeParse(
        values({ followUpNotes: "x".repeat(2001) }),
      ).success,
    ).toBe(false);
  });
});
