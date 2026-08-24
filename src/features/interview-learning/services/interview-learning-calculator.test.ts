import { describe, expect, it } from "vitest";

import { calculateInterviewLearningMetrics } from "@/features/interview-learning/services/interview-learning-calculator";
import type { InterviewLearningSummarySource } from "@/features/interview-learning/types/interview-learning";

function source(
  overrides: Partial<InterviewLearningSummarySource> = {},
): InterviewLearningSummarySource {
  return {
    total_debriefs: 0,
    completed_interviews: 0,
    covered_completed_interviews: 0,
    rated_debriefs: 0,
    rating_total: 0,
    pending_thank_yous: 0,
    rating_1_count: 0,
    rating_2_count: 0,
    rating_3_count: 0,
    rating_4_count: 0,
    rating_5_count: 0,
    ...overrides,
  };
}

describe("calculateInterviewLearningMetrics", () => {
  it("produz estado vazio sem divisões inválidas", () => {
    expect(calculateInterviewLearningMetrics(source())).toEqual({
      totalDebriefs: 0,
      completedInterviews: 0,
      coveragePercentage: 0,
      averageRating: null,
      pendingThankYous: 0,
      ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: 0,
        percentage: 0,
      })),
    });
  });

  it("calcula cobertura, média e distribuição exatas", () => {
    expect(
      calculateInterviewLearningMetrics(
        source({
          total_debriefs: 4,
          completed_interviews: 5,
          covered_completed_interviews: 3,
          rated_debriefs: 3,
          rating_total: 11,
          pending_thank_yous: 2,
          rating_2_count: 1,
          rating_4_count: 1,
          rating_5_count: 1,
        }),
      ),
    ).toMatchObject({
      totalDebriefs: 4,
      coveragePercentage: 60,
      averageRating: 3.7,
      pendingThankYous: 2,
    });
  });

  it("limita a cobertura a cem por cento", () => {
    expect(
      calculateInterviewLearningMetrics(
        source({
          completed_interviews: 1,
          covered_completed_interviews: 2,
        }),
      ).coveragePercentage,
    ).toBe(100);
  });
});
