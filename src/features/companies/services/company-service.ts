import "server-only";

import type { CompanyFormValues } from "@/features/companies/schemas/company-schema";
import type { Company, CompanyOption } from "@/features/companies/types/company";
import { createClient } from "@/lib/supabase/server";

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

export async function getCompanies(userId: string, search = "") {
  const supabase = await createClient();
  let query = supabase
    .from("companies")
    .select("id, user_id, name, website, linkedin_url, location, notes, created_at, updated_at")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);

  const { data, error } = await query;
  if (error) throw new Error("Não foi possível carregar as empresas.");

  return data satisfies Company[];
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
    .select("id, user_id, name, website, linkedin_url, location, notes, created_at, updated_at")
    .eq("id", companyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar a empresa.");
  return data satisfies Company | null;
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

  return { blocked: false, data, error };
}
