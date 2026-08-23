import "server-only";

import type { InterviewPreparationValues } from "@/features/interview-preparation/schemas/interview-preparation-schema";
import { EMPTY_INTERVIEW_PREPARATION } from "@/features/interview-preparation/services/interview-preparation-calculator";
import type {
  InterviewPreparation,
  InterviewPreparationSaveResult,
} from "@/features/interview-preparation/types/interview-preparation";
import { createClient } from "@/lib/supabase/server";

const PREPARATION_SELECT =
  "id, user_id, interview_id, company_research, role_alignment, star_stories, questions_to_ask, logistics_notes, created_at, updated_at" as const;

function textToNull(value: string) {
  return value === "" ? null : value;
}

function preparationPayload(values: InterviewPreparationValues) {
  return {
    company_research: textToNull(values.companyResearch),
    role_alignment: textToNull(values.roleAlignment),
    star_stories: textToNull(values.starStories),
    questions_to_ask: textToNull(values.questionsToAsk),
    logistics_notes: textToNull(values.logisticsNotes),
  };
}

export function toInterviewPreparationValues(
  preparation: InterviewPreparation | null,
): InterviewPreparationValues {
  if (!preparation) return { ...EMPTY_INTERVIEW_PREPARATION };

  return {
    companyResearch: preparation.company_research ?? "",
    roleAlignment: preparation.role_alignment ?? "",
    starStories: preparation.star_stories ?? "",
    questionsToAsk: preparation.questions_to_ask ?? "",
    logisticsNotes: preparation.logistics_notes ?? "",
  };
}

export async function getInterviewPreparation(
  userId: string,
  interviewId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_preparations")
    .select(PREPARATION_SELECT)
    .eq("user_id", userId)
    .eq("interview_id", interviewId)
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar a preparação.");
  return data;
}

export async function saveInterviewPreparationRecord(
  userId: string,
  interviewId: string,
  values: InterviewPreparationValues,
): Promise<InterviewPreparationSaveResult> {
  const supabase = await createClient();
  const interview = await supabase
    .from("interviews")
    .select("id, application_id")
    .eq("user_id", userId)
    .eq("id", interviewId)
    .maybeSingle();

  if (interview.error) return { status: "error" };
  if (!interview.data) return { status: "not_found" };

  const existing = await supabase
    .from("interview_preparations")
    .select("id")
    .eq("user_id", userId)
    .eq("interview_id", interviewId)
    .maybeSingle();
  if (existing.error) return { status: "error" };

  const payload = preparationPayload(values);
  const mutation = existing.data
    ? supabase
        .from("interview_preparations")
        .update(payload)
        .eq("user_id", userId)
        .eq("id", existing.data.id)
        .select("id")
        .maybeSingle()
    : supabase
        .from("interview_preparations")
        .insert({ user_id: userId, interview_id: interviewId, ...payload })
        .select("id")
        .maybeSingle();
  const { data, error } = await mutation;

  if (error || !data) return { status: "error" };
  return {
    status: "saved",
    applicationId: interview.data.application_id,
  };
}
