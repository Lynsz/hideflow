import "server-only";

import type { ContactFormValues } from "@/features/contacts/schemas/contact-schema";
import { summarizeContactRelationship } from "@/features/contacts/services/contact-detail-rules";
import {
  buildContactPortfolioItems,
  filterAndSortContactPortfolio,
  summarizeContactPortfolio,
} from "@/features/contacts/services/contact-portfolio-rules";
import type {
  ContactApplication,
  ContactDetail,
  ContactInterview,
  ContactOption,
  ContactPortfolioApplicationLink,
  ContactPortfolioContact,
  ContactPortfolioFilters,
  ContactPortfolioInterview,
  ContactPortfolioResult,
} from "@/features/contacts/types/contact";
import { createClient } from "@/lib/supabase/server";
import type { ContactType } from "@/types/database";

const CONTACT_SELECT =
  `id, user_id, company_id, name, role, email, phone, linkedin_url, contact_type, notes, created_at, updated_at, company:companies!contacts_company_owner_fkey(id, name)` as const;
const CONTACT_LIST_SELECT =
  `id, company_id, name, role, email, linkedin_url, contact_type, updated_at, company:companies!contacts_company_owner_fkey(id, name)` as const;
const CONTACT_APPLICATION_LIMIT = 200;
const CONTACT_INTERVIEW_LIMIT = 200;
const CONTACT_PORTFOLIO_LIMIT = 300;
const CONTACT_PORTFOLIO_RELATION_LIMIT = 1_000;
const CONTACT_COMPANY_SEARCH_LIMIT = 100;

const emptyToNull = (value: string) => (value === "" ? null : value);

function toPayload(values: ContactFormValues) {
  return {
    company_id: values.companyId,
    name: values.name,
    role: emptyToNull(values.role),
    email: emptyToNull(values.email),
    phone: emptyToNull(values.phone),
    linkedin_url: emptyToNull(values.linkedinUrl),
    contact_type: emptyToNull(values.contactType) as ContactType | null,
    notes: emptyToNull(values.notes),
  };
}

export async function getContactPortfolio(
  userId: string,
  filters: ContactPortfolioFilters,
): Promise<ContactPortfolioResult> {
  const supabase = await createClient();
  let companyIds: string[] = [];
  let isCompanySearchLimited = false;
  if (filters.query) {
    const companies = await supabase
      .from("companies")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .ilike("name", `%${filters.query}%`)
      .range(0, CONTACT_COMPANY_SEARCH_LIMIT - 1);
    if (companies.error)
      throw new Error("Não foi possível pesquisar contatos.");
    companyIds = companies.data.map((company) => company.id);
    isCompanySearchLimited =
      (companies.count ?? companyIds.length) > companyIds.length;
  }

  let contactsQuery = supabase
    .from("contacts")
    .select(CONTACT_LIST_SELECT, { count: "exact" })
    .eq("user_id", userId);
  if (filters.query) {
    const terms = [
      `name.ilike.*${filters.query}*`,
      `role.ilike.*${filters.query}*`,
      `email.ilike.*${filters.query}*`,
    ];
    if (companyIds.length)
      terms.push(`company_id.in.(${companyIds.join(",")})`);
    contactsQuery = contactsQuery.or(terms.join(","));
  }
  if (filters.companyId) {
    contactsQuery = contactsQuery.eq("company_id", filters.companyId);
  }
  if (filters.contactType)
    contactsQuery = contactsQuery.eq("contact_type", filters.contactType);

  const [contactsResult, linksResult, interviewsResult] = await Promise.all([
    contactsQuery.order("name").range(0, CONTACT_PORTFOLIO_LIMIT - 1),
    supabase
      .from("application_contacts")
      .select(
        "contact_id, application:applications!application_contacts_application_owner_fkey(id, job_title, status, archived_at, updated_at)",
        { count: "exact" },
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(0, CONTACT_PORTFOLIO_RELATION_LIMIT - 1),
    supabase
      .from("interviews")
      .select("contact_id, scheduled_at, updated_at, result", {
        count: "exact",
      })
      .eq("user_id", userId)
      .not("contact_id", "is", null)
      .order("updated_at", { ascending: false })
      .range(0, CONTACT_PORTFOLIO_RELATION_LIMIT - 1),
  ]);

  if (contactsResult.error || linksResult.error || interviewsResult.error) {
    throw new Error("Não foi possível carregar o portfólio de contatos.");
  }

  const contacts = contactsResult.data satisfies ContactPortfolioContact[];
  const links = linksResult.data satisfies ContactPortfolioApplicationLink[];
  const interviews =
    interviewsResult.data satisfies ContactPortfolioInterview[];
  const portfolio = buildContactPortfolioItems(
    contacts,
    links,
    interviews,
    new Date().toISOString(),
  );
  const items = filterAndSortContactPortfolio(portfolio, filters);

  return {
    items,
    summary: summarizeContactPortfolio(items),
    isLimited:
      isCompanySearchLimited ||
      (contactsResult.count ?? contacts.length) > contacts.length ||
      (linksResult.count ?? links.length) > links.length ||
      (interviewsResult.count ?? interviews.length) > interviews.length,
  };
}

export async function getContactsByCompany(userId: string, companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, role, email, contact_type, company_id")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .order("name");
  if (error)
    throw new Error("Não foi possível carregar os contatos da empresa.");
  return data;
}

export async function getContactOptions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, company_id")
    .eq("user_id", userId)
    .order("name");
  if (error) throw new Error("Não foi possível carregar os contatos.");
  return data satisfies ContactOption[];
}

export async function getContactById(userId: string, contactId: string) {
  const supabase = await createClient();
  const [contact, links] = await Promise.all([
    supabase
      .from("contacts")
      .select(CONTACT_SELECT)
      .eq("user_id", userId)
      .eq("id", contactId)
      .maybeSingle(),
    supabase
      .from("application_contacts")
      .select(
        "application:applications!application_contacts_application_owner_fkey(id, job_title, status)",
      )
      .eq("user_id", userId)
      .eq("contact_id", contactId),
  ]);
  if (contact.error || links.error)
    throw new Error("Não foi possível carregar o contato.");
  if (!contact.data) return null;
  return {
    ...contact.data,
    applications: links.data.map((link) => link.application),
  };
}

export async function getContactDetail(
  userId: string,
  contactId: string,
): Promise<ContactDetail | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [contactResult, linksResult, interviewsResult] = await Promise.all([
    supabase
      .from("contacts")
      .select(CONTACT_SELECT)
      .eq("user_id", userId)
      .eq("id", contactId)
      .maybeSingle(),
    supabase
      .from("application_contacts")
      .select(
        "created_at, application:applications!application_contacts_application_owner_fkey(id, job_title, status, archived_at, updated_at)",
        { count: "exact" },
      )
      .eq("user_id", userId)
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .range(0, CONTACT_APPLICATION_LIMIT - 1),
    supabase
      .from("interviews")
      .select(
        "id, application_id, type, scheduled_at, meeting_url, result, application:applications!interviews_application_owner_fkey(id, job_title, status)",
        { count: "exact" },
      )
      .eq("user_id", userId)
      .eq("contact_id", contactId)
      .order("scheduled_at", { ascending: false })
      .range(0, CONTACT_INTERVIEW_LIMIT - 1),
  ]);

  if (contactResult.error || linksResult.error || interviewsResult.error) {
    throw new Error("Não foi possível carregar o relacionamento do contato.");
  }
  if (!contactResult.data) return null;

  const applications = linksResult.data.map(
    (link) => link.application,
  ) satisfies ContactApplication[];
  const interviews = interviewsResult.data satisfies ContactInterview[];
  const totalApplications = linksResult.count ?? applications.length;
  const totalInterviews = interviewsResult.count ?? interviews.length;

  return {
    ...contactResult.data,
    applications,
    interviews,
    summary: summarizeContactRelationship(applications, interviews, now),
    totalApplications,
    totalInterviews,
    isApplicationListLimited: totalApplications > applications.length,
    isInterviewListLimited: totalInterviews > interviews.length,
  };
}

export async function insertContact(userId: string, values: ContactFormValues) {
  const supabase = await createClient();
  return supabase
    .from("contacts")
    .insert({ user_id: userId, ...toPayload(values) })
    .select("id")
    .single();
}

export async function updateContactRecord(
  userId: string,
  contactId: string,
  values: ContactFormValues,
) {
  const supabase = await createClient();
  return supabase
    .from("contacts")
    .update(toPayload(values))
    .eq("user_id", userId)
    .eq("id", contactId)
    .select("id")
    .maybeSingle();
}

export async function deleteContactRecord(userId: string, contactId: string) {
  const supabase = await createClient();
  return supabase
    .from("contacts")
    .delete()
    .eq("user_id", userId)
    .eq("id", contactId)
    .select("id")
    .maybeSingle();
}

export async function linkContactRecord(
  userId: string,
  applicationId: string,
  contactId: string,
) {
  const supabase = await createClient();
  return supabase.from("application_contacts").insert({
    user_id: userId,
    application_id: applicationId,
    contact_id: contactId,
  });
}

export async function unlinkContactRecord(
  userId: string,
  applicationId: string,
  contactId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("application_contacts")
    .delete()
    .eq("user_id", userId)
    .eq("application_id", applicationId)
    .eq("contact_id", contactId);
}
