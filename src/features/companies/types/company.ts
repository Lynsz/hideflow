import type { Database } from "@/types/database";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];
type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export type CompanyOption = Pick<Company, "id" | "name">;

export type CompanyDetailApplication = Pick<
  Application,
  | "id"
  | "job_title"
  | "status"
  | "location"
  | "work_mode"
  | "applied_at"
  | "archived_at"
  | "updated_at"
>;

export type CompanyDetailContact = Pick<
  Contact,
  "id" | "name" | "role" | "email" | "contact_type"
>;

export type CompanyApplicationSummary = {
  analyzed: number;
  active: number;
  interviewStage: number;
  hired: number;
};

export type CompanyDetail = {
  company: Company;
  applications: CompanyDetailApplication[];
  contacts: CompanyDetailContact[];
  applicationSummary: CompanyApplicationSummary;
  totalApplications: number;
  isApplicationListLimited: boolean;
};

export type CompanyRelationshipFilter =
  "all" | "active" | "history" | "untracked";
export type CompanyPortfolioSort = "name" | "activity" | "opportunities";

export type CompanyPortfolioFilters = {
  query: string;
  relationship: CompanyRelationshipFilter;
  sort: CompanyPortfolioSort;
};

export type CompanyPortfolioApplication = Pick<
  Application,
  "id" | "company_id" | "job_title" | "status" | "archived_at" | "updated_at"
>;

export type CompanyPortfolioContact = Pick<
  Contact,
  "id" | "company_id" | "updated_at"
>;

export type CompanyPortfolioItem = Company & {
  applicationCount: number;
  activeApplicationCount: number;
  contactCount: number;
  latestApplication: CompanyPortfolioApplication | null;
  lastActivityAt: string;
};

export type CompanyPortfolioSummary = {
  totalCompanies: number;
  companiesWithActiveApplications: number;
  activeApplications: number;
  companiesWithContacts: number;
};

export type CompanyPortfolioResult = {
  items: CompanyPortfolioItem[];
  summary: CompanyPortfolioSummary;
  isLimited: boolean;
};
