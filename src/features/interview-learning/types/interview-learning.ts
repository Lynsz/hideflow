import type { InterviewResult, InterviewType } from "@/types/database";

export type InterviewLearningRating = "" | "1" | "2" | "3" | "4" | "5";
export type InterviewLearningThankYouFilter = "all" | "pending" | "sent";
export type InterviewLearningSort =
  "recent" | "oldest" | "rating_high" | "rating_low";

export type InterviewLearningFilters = {
  interviewType: InterviewType | "";
  rating: InterviewLearningRating;
  thankYou: InterviewLearningThankYouFilter;
  sort: InterviewLearningSort;
  page: number;
};

export type InterviewLearningItem = {
  id: string;
  interview_id: string;
  overall_rating: number | null;
  went_well: string | null;
  improve_next_time: string | null;
  questions_received: string | null;
  follow_up_notes: string | null;
  thank_you_sent_at: string | null;
  updated_at: string;
  interview: {
    id: string;
    type: InterviewType;
    scheduled_at: string;
    result: InterviewResult;
    application_id: string;
    application: {
      id: string;
      job_title: string;
      archived_at: string | null;
      company: { id: string; name: string };
    };
  };
};

export type PaginatedInterviewLearnings = {
  items: InterviewLearningItem[];
  total: number;
  totalPages: number;
  page: number;
};

export type InterviewLearningSummarySource = {
  total_debriefs: number;
  completed_interviews: number;
  covered_completed_interviews: number;
  rated_debriefs: number;
  rating_total: number;
  pending_thank_yous: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
};

export type InterviewLearningMetrics = {
  totalDebriefs: number;
  completedInterviews: number;
  coveragePercentage: number;
  averageRating: number | null;
  pendingThankYous: number;
  ratingDistribution: Array<{
    rating: 1 | 2 | 3 | 4 | 5;
    count: number;
    percentage: number;
  }>;
};
