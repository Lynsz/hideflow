import "server-only";

import type { InterviewDebriefValues } from "@/features/interview-debrief/schemas/interview-debrief-schema";
import { EMPTY_INTERVIEW_DEBRIEF } from "@/features/interview-debrief/services/interview-debrief-calculator";
import type {
  InterviewDebrief,
  InterviewDebriefSaveResult,
} from "@/features/interview-debrief/types/interview-debrief";
import { createClient } from "@/lib/supabase/server";

const DEBRIEF_SELECT =
  "id, user_id, interview_id, overall_rating, went_well, improve_next_time, questions_received, follow_up_notes, thank_you_sent_at, created_at, updated_at" as const;

function textToNull(value: string) {
  return value === "" ? null : value;
}

function toOverallRating(
  rating: number | null,
): InterviewDebriefValues["overallRating"] {
  switch (rating) {
    case 1:
      return "1";
    case 2:
      return "2";
    case 3:
      return "3";
    case 4:
      return "4";
    case 5:
      return "5";
    default:
      return "";
  }
}

function debriefPayload(
  values: InterviewDebriefValues,
  existingThankYouSentAt: string | null,
) {
  return {
    overall_rating:
      values.overallRating === "" ? null : Number(values.overallRating),
    went_well: textToNull(values.wentWell),
    improve_next_time: textToNull(values.improveNextTime),
    questions_received: textToNull(values.questionsReceived),
    follow_up_notes: textToNull(values.followUpNotes),
    thank_you_sent_at: values.thankYouSent
      ? (existingThankYouSentAt ?? new Date().toISOString())
      : null,
  };
}

export function toInterviewDebriefValues(
  debrief: InterviewDebrief | null,
): InterviewDebriefValues {
  if (!debrief) return { ...EMPTY_INTERVIEW_DEBRIEF };

  return {
    overallRating: toOverallRating(debrief.overall_rating),
    wentWell: debrief.went_well ?? "",
    improveNextTime: debrief.improve_next_time ?? "",
    questionsReceived: debrief.questions_received ?? "",
    followUpNotes: debrief.follow_up_notes ?? "",
    thankYouSent: debrief.thank_you_sent_at !== null,
  };
}

export async function getInterviewDebrief(userId: string, interviewId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_debriefs")
    .select(DEBRIEF_SELECT)
    .eq("user_id", userId)
    .eq("interview_id", interviewId)
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar a retrospectiva.");
  return data;
}

export async function saveInterviewDebriefRecord(
  userId: string,
  interviewId: string,
  values: InterviewDebriefValues,
): Promise<InterviewDebriefSaveResult> {
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
    .from("interview_debriefs")
    .select("id, thank_you_sent_at")
    .eq("user_id", userId)
    .eq("interview_id", interviewId)
    .maybeSingle();
  if (existing.error) return { status: "error" };

  const payload = debriefPayload(
    values,
    existing.data?.thank_you_sent_at ?? null,
  );
  const mutation = existing.data
    ? supabase
        .from("interview_debriefs")
        .update(payload)
        .eq("user_id", userId)
        .eq("id", existing.data.id)
        .select("id")
        .maybeSingle()
    : supabase
        .from("interview_debriefs")
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
