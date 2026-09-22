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
