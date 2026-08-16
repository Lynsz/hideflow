import type { CompanyOption } from "@/features/companies/types/company";
import type { ContactOption } from "@/features/contacts/types/contact";
import type { Database } from "@/types/database";

export type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type InterviewEvent =
  Database["public"]["Tables"]["interview_events"]["Row"];
export type InterviewApplicationOption = {
  id: string;
  job_title: string;
  company_id: string;
  company: CompanyOption;
};
export type InterviewListItem = Pick<
  Interview,
  | "id"
  | "application_id"
  | "type"
  | "scheduled_at"
  | "interviewer_name"
  | "meeting_url"
  | "result"
> & {
  application: InterviewApplicationOption;
  contact: ContactOption | null;
};
