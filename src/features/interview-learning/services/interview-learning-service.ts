import "server-only";

import { INTERVIEW_LEARNING_PAGE_SIZE } from "@/features/interview-learning/constants";
import { calculateInterviewLearningMetrics } from "@/features/interview-learning/services/interview-learning-calculator";
import type {
  InterviewLearningFilters,
  InterviewLearningItem,
  InterviewLearningMetrics,
  PaginatedInterviewLearnings,
} from "@/features/interview-learning/types/interview-learning";
import { createClient } from "@/lib/supabase/server";

const INTERVIEW_LEARNING_SELECT =
  "id, interview_id, overall_rating, went_well, improve_next_time, questions_received, follow_up_notes, thank_you_sent_at, updated_at, interview:interviews!inner(id, type, scheduled_at, result, application_id, application:applications!interviews_application_owner_fkey(id, job_title, archived_at, company:companies!applications_company_owner_fkey(id, name)))" as const;

export async function getInterviewLearningCenter(
  userId: string,
  filters: InterviewLearningFilters,
): Promise<{
  metrics: InterviewLearningMetrics;
  learnings: PaginatedInterviewLearnings;
}> {
  const supabase = await createClient();
  let request = supabase
    .from("interview_debriefs")
    .select(INTERVIEW_LEARNING_SELECT, { count: "exact" })
    .eq("user_id", userId);

  if (filters.interviewType) {
    request = request.eq("interview.type", filters.interviewType);
  }
  if (filters.rating) {
    request = request.eq("overall_rating", Number(filters.rating));
  }
  if (filters.thankYou === "pending") {
    request = request.is("thank_you_sent_at", null);
  }
  if (filters.thankYou === "sent") {
    request = request.not("thank_you_sent_at", "is", null);
  }

  if (filters.sort === "oldest") {
    request = request.order("updated_at", { ascending: true });
  } else if (filters.sort === "rating_high") {
    request = request.order("overall_rating", {
      ascending: false,
      nullsFirst: false,
    });
  } else if (filters.sort === "rating_low") {
    request = request.order("overall_rating", {
      ascending: true,
      nullsFirst: false,
    });
  } else {
    request = request.order("updated_at", { ascending: false });
  }

  const from = (filters.page - 1) * INTERVIEW_LEARNING_PAGE_SIZE;
  const [listResult, summaryResult] = await Promise.all([
    request
      .order("id", { ascending: true })
      .range(from, from + INTERVIEW_LEARNING_PAGE_SIZE - 1),
    supabase.rpc("get_interview_learning_summary", {}).single(),
  ]);

  if (listResult.error || summaryResult.error || !summaryResult.data) {
    throw new Error("Não foi possível carregar a central de aprendizados.");
  }

  const total = listResult.count ?? 0;
  return {
    metrics: calculateInterviewLearningMetrics(summaryResult.data),
    learnings: {
      items: listResult.data as InterviewLearningItem[],
      total,
      totalPages: Math.max(1, Math.ceil(total / INTERVIEW_LEARNING_PAGE_SIZE)),
      page: filters.page,
    },
  };
}
