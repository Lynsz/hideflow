import "server-only";

import type { InterviewMutationValues } from "@/features/interviews/schemas/interview-schema";
import { createClient } from "@/lib/supabase/server";

const INTERVIEW_SELECT =
  `id, user_id, application_id, contact_id, type, scheduled_at, interviewer_name, meeting_url, notes, result, created_at, updated_at, application:applications!interviews_application_owner_fkey(id, job_title, company_id, company:companies!applications_company_owner_fkey(id, name)), contact:contacts!interviews_contact_owner_fkey(id, name, company_id)` as const;
const INTERVIEW_LIST_SELECT =
  `id, application_id, type, scheduled_at, interviewer_name, meeting_url, result, application:applications!interviews_application_owner_fkey(id, job_title, company_id, company:companies!applications_company_owner_fkey(id, name)), contact:contacts!interviews_contact_owner_fkey(id, name, company_id)` as const;
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
