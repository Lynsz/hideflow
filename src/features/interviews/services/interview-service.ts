import "server-only";

import type { InterviewMutationValues } from "@/features/interviews/schemas/interview-schema";
import {
  buildInterviewPortfolioItems,
  filterAndSortInterviewPortfolio,
  summarizeInterviewPortfolio,
} from "@/features/interviews/services/interview-portfolio-rules";
import type {
  InterviewListItem,
  InterviewPortfolioDebrief,
  InterviewPortfolioFilters,
  InterviewPortfolioPreparation,
  InterviewPortfolioResult,
} from "@/features/interviews/types/interview";
import { createClient } from "@/lib/supabase/server";

const INTERVIEW_SELECT =
  `id, user_id, application_id, contact_id, type, scheduled_at, interviewer_name, meeting_url, notes, result, created_at, updated_at, application:applications!interviews_application_owner_fkey(id, job_title, company_id, company:companies!applications_company_owner_fkey(id, name)), contact:contacts!interviews_contact_owner_fkey(id, name, company_id)` as const;
const INTERVIEW_LIST_SELECT =
  `id, application_id, type, scheduled_at, interviewer_name, meeting_url, result, application:applications!interviews_application_owner_fkey(id, job_title, company_id, company:companies!applications_company_owner_fkey(id, name)), contact:contacts!interviews_contact_owner_fkey(id, name, company_id)` as const;
const INTERVIEW_PORTFOLIO_LIMIT = 300;
const INTERVIEW_PORTFOLIO_RELATION_LIMIT = 1_000;
const emptyToNull = (value: string) => (value === "" ? null : value);
function payload(values: InterviewMutationValues) {
  return {
    application_id: values.applicationId,
    type: values.type,
    scheduled_at: values.scheduledAt,
    contact_id: emptyToNull(values.contactId),
    interviewer_name: emptyToNull(values.interviewerName),
    meeting_url: emptyToNull(values.meetingUrl),
    notes: emptyToNull(values.notes),
    result: values.result,
  };
}

export async function getInterviews(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .select(INTERVIEW_LIST_SELECT)
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true });
  if (error) throw new Error("Não foi possível carregar as entrevistas.");
  return { items: data, now: new Date().toISOString() };
}

export async function getInterviewPortfolio(
  userId: string,
  filters: InterviewPortfolioFilters,
): Promise<InterviewPortfolioResult> {
  const supabase = await createClient();
  const [interviewsResult, preparationsResult, debriefsResult] =
    await Promise.all([
      supabase
        .from("interviews")
        .select(INTERVIEW_LIST_SELECT, { count: "exact" })
        .eq("user_id", userId)
        .order("scheduled_at", { ascending: false })
        .range(0, INTERVIEW_PORTFOLIO_LIMIT - 1),
      supabase
        .from("interview_preparations")
        .select(
          "interview_id, company_research, role_alignment, star_stories, questions_to_ask, logistics_notes",
          { count: "exact" },
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .range(0, INTERVIEW_PORTFOLIO_RELATION_LIMIT - 1),
      supabase
        .from("interview_debriefs")
        .select(
          "interview_id, overall_rating, went_well, improve_next_time, questions_received, follow_up_notes, thank_you_sent_at",
          { count: "exact" },
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .range(0, INTERVIEW_PORTFOLIO_RELATION_LIMIT - 1),
    ]);

  if (
    interviewsResult.error ||
    preparationsResult.error ||
    debriefsResult.error
  ) {
    throw new Error("Não foi possível carregar o portfólio de entrevistas.");
  }

  const interviews = interviewsResult.data satisfies InterviewListItem[];
  const preparations =
    preparationsResult.data satisfies InterviewPortfolioPreparation[];
  const debriefs = debriefsResult.data satisfies InterviewPortfolioDebrief[];
  const portfolio = buildInterviewPortfolioItems(
    interviews,
    preparations,
    debriefs,
    new Date().toISOString(),
  );
  const items = filterAndSortInterviewPortfolio(portfolio, filters);

  return {
    items,
    summary: summarizeInterviewPortfolio(items),
    isLimited:
      (interviewsResult.count ?? interviews.length) > interviews.length ||
      (preparationsResult.count ?? preparations.length) > preparations.length ||
      (debriefsResult.count ?? debriefs.length) > debriefs.length,
  };
}

export async function getInterviewById(userId: string, interviewId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .select(INTERVIEW_SELECT)
    .eq("user_id", userId)
    .eq("id", interviewId)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar a entrevista.");
  return data;
}

export async function getInterviewApplicationOptions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, job_title, company_id, company:companies!applications_company_owner_fkey(id, name)",
    )
    .eq("user_id", userId)
    .order("job_title");
  if (error) throw new Error("Não foi possível carregar as candidaturas.");
  return data;
}

export async function insertInterview(
  userId: string,
  values: InterviewMutationValues,
) {
  const supabase = await createClient();
  return supabase
    .from("interviews")
    .insert({ user_id: userId, ...payload(values), result: "scheduled" })
    .select("id")
    .single();
}
export async function updateInterviewRecord(
  userId: string,
  interviewId: string,
  values: InterviewMutationValues,
) {
  const supabase = await createClient();
  return supabase
    .from("interviews")
    .update({
      type: values.type,
      scheduled_at: values.scheduledAt,
      contact_id: emptyToNull(values.contactId),
      interviewer_name: emptyToNull(values.interviewerName),
      meeting_url: emptyToNull(values.meetingUrl),
      notes: emptyToNull(values.notes),
      result: values.result,
    })
    .eq("user_id", userId)
    .eq("id", interviewId)
    .select("id")
    .maybeSingle();
}
export async function deleteInterviewRecord(
  userId: string,
  interviewId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("interviews")
    .delete()
    .eq("user_id", userId)
    .eq("id", interviewId)
    .select("id")
    .maybeSingle();
}
