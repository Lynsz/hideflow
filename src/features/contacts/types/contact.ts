import type { CompanyOption } from "@/features/companies/types/company";
import type { Database } from "@/types/database";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type ContactWithCompany = Contact & { company: CompanyOption };
export type ContactOption = Pick<Contact, "id" | "name" | "company_id">;
export type ContactFilters = {
  query: string;
  companyId: string;
  contactType: string;
};
export type ContactApplication = Pick<
  Application,
  "id" | "job_title" | "status" | "archived_at" | "updated_at"
>;
export type ContactInterview = Pick<
  Interview,
  "id" | "application_id" | "type" | "scheduled_at" | "meeting_url" | "result"
> & {
  application: Pick<Application, "id" | "job_title" | "status">;
};
export type ContactRelationshipSummary = {
  analyzedApplications: number;
  activeApplications: number;
  analyzedInterviews: number;
  upcomingInterviews: number;
};
export type ContactDetail = ContactWithCompany & {
  applications: ContactApplication[];
  interviews: ContactInterview[];
  summary: ContactRelationshipSummary;
  totalApplications: number;
  totalInterviews: number;
  isApplicationListLimited: boolean;
  isInterviewListLimited: boolean;
};
