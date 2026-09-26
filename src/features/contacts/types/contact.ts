import type { CompanyOption } from "@/features/companies/types/company";
import type { Database } from "@/types/database";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type ContactWithCompany = Contact & { company: CompanyOption };
export type ContactOption = Pick<Contact, "id" | "name" | "company_id">;
export type ContactRelationshipFilter =
  "all" | "active" | "interviewer" | "unlinked";
export type ContactPortfolioSort = "name" | "activity" | "opportunities";
export type ContactPortfolioFilters = {
  query: string;
  companyId: string;
  contactType: Exclude<Contact["contact_type"], null> | "";
  relationship: ContactRelationshipFilter;
  sort: ContactPortfolioSort;
};
export type ContactPortfolioContact = Pick<
  Contact,
  | "id"
  | "company_id"
  | "name"
  | "role"
  | "email"
  | "linkedin_url"
  | "contact_type"
  | "updated_at"
> & { company: CompanyOption };
export type ContactPortfolioApplicationLink = {
  contact_id: string;
  application: Pick<
    Application,
    "id" | "job_title" | "status" | "archived_at" | "updated_at"
  >;
};
export type ContactPortfolioInterview = Pick<
  Interview,
  "contact_id" | "scheduled_at" | "updated_at" | "result"
>;
export type ContactPortfolioItem = ContactPortfolioContact & {
  applicationCount: number;
  activeApplicationCount: number;
  interviewCount: number;
  latestApplication: ContactPortfolioApplicationLink["application"] | null;
  nextInterviewAt: string | null;
  lastActivityAt: string;
};
export type ContactPortfolioSummary = {
  totalContacts: number;
  contactsWithActiveApplications: number;
  interviewers: number;
  unlinkedContacts: number;
};
export type ContactPortfolioResult = {
  items: ContactPortfolioItem[];
  summary: ContactPortfolioSummary;
  isLimited: boolean;
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
