import "server-only";

import type { ContactFormValues } from "@/features/contacts/schemas/contact-schema";
import type {
  ContactFilters,
  ContactOption,
} from "@/features/contacts/types/contact";
import { createClient } from "@/lib/supabase/server";
import type { ContactType } from "@/types/database";

const CONTACT_SELECT =
  `id, user_id, company_id, name, role, email, phone, linkedin_url, contact_type, notes, created_at, updated_at, company:companies!contacts_company_owner_fkey(id, name)` as const;
const CONTACT_LIST_SELECT =
  `id, company_id, name, role, email, linkedin_url, contact_type, company:companies!contacts_company_owner_fkey(id, name)` as const;

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

export async function getContacts(userId: string, filters: ContactFilters) {
  const supabase = await createClient();
  let companyIds: string[] = [];
  if (filters.query) {
    const companies = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", `%${filters.query}%`);
    if (companies.error)
      throw new Error("Não foi possível pesquisar contatos.");
    companyIds = companies.data.map((company) => company.id);
  }
  let query = supabase
    .from("contacts")
    .select(CONTACT_LIST_SELECT)
    .eq("user_id", userId);
  if (filters.query) {
    const terms = [
      `name.ilike.*${filters.query}*`,
      `role.ilike.*${filters.query}*`,
      `email.ilike.*${filters.query}*`,
    ];
    if (companyIds.length)
      terms.push(`company_id.in.(${companyIds.join(",")})`);
    query = query.or(terms.join(","));
  }
  if (filters.companyId) query = query.eq("company_id", filters.companyId);
  if (filters.contactType)
    query = query.eq("contact_type", filters.contactType as ContactType);
  const { data, error } = await query.order("name");
  if (error) throw new Error("Não foi possível carregar os contatos.");
  return data;
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
