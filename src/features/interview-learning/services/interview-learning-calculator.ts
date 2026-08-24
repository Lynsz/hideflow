import type {
  InterviewLearningMetrics,
  InterviewLearningSummarySource,
} from "@/features/interview-learning/types/interview-learning";

function percentage(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

export function calculateInterviewLearningMetrics(
  source: InterviewLearningSummarySource,
): InterviewLearningMetrics {
  const ratingCounts = [
    source.rating_1_count,
    source.rating_2_count,
    source.rating_3_count,
    source.rating_4_count,
    source.rating_5_count,
  ];

  return {
    totalDebriefs: source.total_debriefs,
    completedInterviews: source.completed_interviews,
    coveragePercentage: percentage(
      source.covered_completed_interviews,
      source.completed_interviews,
    ),
    averageRating:
      source.rated_debriefs > 0
        ? Number((source.rating_total / source.rated_debriefs).toFixed(1))
        : null,
    pendingThankYous: source.pending_thank_yous,
    ratingDistribution: ratingCounts.map((count, index) => ({
      rating: (index + 1) as 1 | 2 | 3 | 4 | 5,
      count,
      percentage: percentage(count, source.rated_debriefs),
    })),
  };
}
