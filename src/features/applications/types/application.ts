import type { CompanyOption } from "@/features/companies/types/company";
import type { Contact } from "@/features/contacts/types/contact";
import type { DocumentListItem } from "@/features/documents/types/document";
import type {
  Interview,
  InterviewEvent,
} from "@/features/interviews/types/interview";
import type { ApplicationStatus, Database } from "@/types/database";

export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationHistory =
  Database["public"]["Tables"]["application_history"]["Row"];

export type ApplicationWithCompany = Application & {
  company: CompanyOption;
};

export type ApplicationDetail = ApplicationWithCompany & {
  history: ApplicationHistory[];
  contacts: Array<
    Pick<Contact, "id" | "name" | "role" | "contact_type" | "email">
  >;
  interviews: Array<
    Interview & {
      contact: { id: string; name: string; company_id: string } | null;
    }
  >;
  interviewEvents: InterviewEvent[];
  documents: DocumentListItem[];
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

export type KanbanApplication = Pick<
  Application,
  | "id"
  | "job_title"
  | "location"
  | "work_mode"
  | "employment_type"
  | "salary_min"
  | "salary_max"
  | "currency"
  | "applied_at"
  | "status"
  | "updated_at"
> & {
  company: CompanyOption;
};

export type KanbanFilters = Pick<
  ApplicationFilters,
  "query" | "workMode" | "employmentType" | "companyId"
>;

export type KanbanApplicationsResult = {
  items: KanbanApplication[];
  total: number;
  isLimited: boolean;
};
