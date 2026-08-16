import type { CompanyOption } from "@/features/companies/types/company";
import type { Database } from "@/types/database";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactWithCompany = Contact & { company: CompanyOption };
export type ContactOption = Pick<Contact, "id" | "name" | "company_id">;
export type ContactFilters = {
  query: string;
  companyId: string;
  contactType: string;
};
export type ContactApplication = {
  id: string;
  job_title: string;
  status: Database["public"]["Tables"]["applications"]["Row"]["status"];
};
export type ContactDetail = ContactWithCompany & {
  applications: ContactApplication[];
};
