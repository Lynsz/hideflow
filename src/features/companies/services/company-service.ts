import "server-only";

import type { CompanyFormValues } from "@/features/companies/schemas/company-schema";
import {
  buildCompanyPortfolioItems,
  filterAndSortCompanyPortfolio,
  summarizeCompanyPortfolio,
} from "@/features/companies/services/company-portfolio-rules";
import type {
  Company,
  CompanyDetail,
  CompanyDetailApplication,
  CompanyDetailContact,
  CompanyOption,
  CompanyPortfolioApplication,
  CompanyPortfolioContact,
  CompanyPortfolioFilters,
  CompanyPortfolioResult,
} from "@/features/companies/types/company";
import { summarizeCompanyApplications } from "@/features/companies/services/company-detail-rules";
import { createClient } from "@/lib/supabase/server";

const COMPANY_APPLICATION_LIMIT = 200;
const COMPANY_PORTFOLIO_LIMIT = 300;
const COMPANY_PORTFOLIO_RELATION_LIMIT = 1_000;

function emptyToNull(value: string) {
  return value === "" ? null : value;
}

function toCompanyPayload(values: CompanyFormValues) {
  return {
    name: values.name,
    website: emptyToNull(values.website),
    linkedin_url: emptyToNull(values.linkedinUrl),
    location: emptyToNull(values.location),
    notes: emptyToNull(values.notes),
  };
}

export async function getCompanyPortfolio(
  userId: string,
  filters: CompanyPortfolioFilters,
): Promise<CompanyPortfolioResult> {
  const supabase = await createClient();
  let companiesQuery = supabase
    .from("companies")
    .select(
      "id, user_id, name, website, linkedin_url, location, notes, created_at, updated_at",
      { count: "exact" },
    )
    .eq("user_id", userId);

  if (filters.query) {
    companiesQuery = companiesQuery.ilike("name", `%${filters.query}%`);
  }

  const companiesRequest = companiesQuery
    .order("name", { ascending: true })
    .range(0, COMPANY_PORTFOLIO_LIMIT - 1);

  const [companiesResult, applicationsResult, contactsResult] =
    await Promise.all([
      companiesRequest,
      supabase
        .from("applications")
        .select("id, company_id, job_title, status, archived_at, updated_at", {
          count: "exact",
        })
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .range(0, COMPANY_PORTFOLIO_RELATION_LIMIT - 1),
      supabase
        .from("contacts")
        .select("id, company_id, updated_at", { count: "exact" })
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .range(0, COMPANY_PORTFOLIO_RELATION_LIMIT - 1),
    ]);

  if (
    companiesResult.error ||
    applicationsResult.error ||
    contactsResult.error
  ) {
    throw new Error("Não foi possível carregar o portfólio de empresas.");
  }

  const companies = companiesResult.data satisfies Company[];
  const applications =
    applicationsResult.data satisfies CompanyPortfolioApplication[];
  const contacts = contactsResult.data satisfies CompanyPortfolioContact[];
  const portfolio = buildCompanyPortfolioItems(
    companies,
    applications,
    contacts,
  );
  const items = filterAndSortCompanyPortfolio(portfolio, filters);

  return {
    items,
    summary: summarizeCompanyPortfolio(items),
    isLimited:
      (companiesResult.count ?? companies.length) > companies.length ||
      (applicationsResult.count ?? applications.length) > applications.length ||
      (contactsResult.count ?? contacts.length) > contacts.length,
  };
}

export async function getCompanyOptions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw new Error("Não foi possível carregar as empresas.");
  return data satisfies CompanyOption[];
}

export async function getCompanyById(userId: string, companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, user_id, name, website, linkedin_url, location, notes, created_at, updated_at",
    )
    .eq("id", companyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar a empresa.");
  return data satisfies Company | null;
}

export async function getCompanyDetail(
  userId: string,
  companyId: string,
): Promise<CompanyDetail | null> {
  const supabase = await createClient();
  const [companyResult, applicationsResult, contactsResult] = await Promise.all(
    [
      supabase
        .from("companies")
        .select(
          "id, user_id, name, website, linkedin_url, location, notes, created_at, updated_at",
        )
        .eq("id", companyId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("applications")
        .select(
          "id, job_title, status, location, work_mode, applied_at, archived_at, updated_at",
          { count: "exact" },
        )
        .eq("company_id", companyId)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .order("id", { ascending: true })
        .range(0, COMPANY_APPLICATION_LIMIT - 1),
      supabase
        .from("contacts")
        .select("id, name, role, email, contact_type")
        .eq("company_id", companyId)
        .eq("user_id", userId)
        .order("name", { ascending: true }),
    ],
  );

  if (companyResult.error || applicationsResult.error || contactsResult.error) {
    throw new Error("Não foi possível carregar os detalhes da empresa.");
  }
  if (!companyResult.data) return null;

  const company = companyResult.data satisfies Company;
  const applications =
    applicationsResult.data satisfies CompanyDetailApplication[];
  const contacts = contactsResult.data satisfies CompanyDetailContact[];
  const totalApplications = applicationsResult.count ?? applications.length;

  return {
    company,
    applications,
    contacts,
    applicationSummary: summarizeCompanyApplications(applications),
    totalApplications,
    isApplicationListLimited: totalApplications > applications.length,
  };
}

export async function insertCompany(userId: string, values: CompanyFormValues) {
  const supabase = await createClient();
  return supabase
    .from("companies")
    .insert({ user_id: userId, ...toCompanyPayload(values) })
    .select("id")
    .single();
}

export async function updateCompanyRecord(
  userId: string,
  companyId: string,
  values: CompanyFormValues,
) {
  const supabase = await createClient();
  return supabase
    .from("companies")
    .update(toCompanyPayload(values))
    .eq("id", companyId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
}

export async function deleteCompanyRecord(userId: string, companyId: string) {
  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("company_id", companyId);

  if (countError) return { blocked: false, error: countError };
  if ((count ?? 0) > 0) return { blocked: true, error: null };

  const { data, error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    return { blocked: true, data: null, error: null };
  }

  return { blocked: false, data, error };
}
