import type { CompanyOption } from "@/features/companies/types/company";
import type { ApplicationStatus, Database } from "@/types/database";

export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationHistory =
  Database["public"]["Tables"]["application_history"]["Row"];

export type ApplicationWithCompany = Application & {
  company: CompanyOption;
};

export type ApplicationDetail = ApplicationWithCompany & {
  history: ApplicationHistory[];
};

export type ApplicationSort = "recent" | "oldest" | "company" | "job";

export type ApplicationFilters = {
  query: string;
  status: ApplicationStatus | "";
  workMode: NonNullable<Application["work_mode"]> | "";
  employmentType: NonNullable<Application["employment_type"]> | "";
  companyId: string;
  sort: ApplicationSort;
  page: number;
};

export type PaginatedApplications = {
  items: ApplicationWithCompany[];
  total: number;
  totalPages: number;
  page: number;
};
