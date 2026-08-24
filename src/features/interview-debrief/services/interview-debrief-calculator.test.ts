import { describe, expect, it } from "vitest";

import {
  calculateInterviewDebriefProgress,
  EMPTY_INTERVIEW_DEBRIEF,
} from "@/features/interview-debrief/services/interview-debrief-calculator";

describe("calculateInterviewDebriefProgress", () => {
  it("começa vazio sem contar o agradecimento como reflexão", () => {
    expect(calculateInterviewDebriefProgress(EMPTY_INTERVIEW_DEBRIEF)).toEqual({
      completed: 0,
      total: 5,
      percentage: 0,
    });
  });

  it("conta avaliação e blocos com conteúdo útil", () => {
    expect(
      calculateInterviewDebriefProgress({
        ...EMPTY_INTERVIEW_DEBRIEF,
        overallRating: "4",
        wentWell: "Expliquei decisões com clareza",
        improveNextTime: "   ",
        thankYouSent: true,
      }),
    ).toEqual({ completed: 2, total: 5, percentage: 40 });
  });

  it("chega a 100% com avaliação e quatro blocos preenchidos", () => {
    expect(
      calculateInterviewDebriefProgress({
        overallRating: "5",
        wentWell: "Pontos fortes",
        improveNextTime: "Melhorias",
        questionsReceived: "Perguntas",
        followUpNotes: "Próximos passos",
        thankYouSent: false,
      }),
    ).toEqual({ completed: 5, total: 5, percentage: 100 });
  });
});
