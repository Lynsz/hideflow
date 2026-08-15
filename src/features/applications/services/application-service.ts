import "server-only";

import {
  APPLICATION_PAGE_SIZE,
  KANBAN_APPLICATION_LIMIT,
} from "@/features/applications/constants";
import type { ApplicationFormValues } from "@/features/applications/schemas/application-schema";
import type {
  ApplicationDetail,
  ApplicationFilters,
  KanbanApplicationsResult,
  PaginatedApplications,
} from "@/features/applications/types/application";
import { createClient } from "@/lib/supabase/server";
import type {
  ApplicationStatus,
  EmploymentType,
  WorkMode,
} from "@/types/database";

const APPLICATION_SELECT = `
  id,
  user_id,
  company_id,
  job_title,
  job_url,
  location,
  work_mode,
  employment_type,
  salary_min,
  salary_max,
  currency,
  applied_at,
  source,
  description,
  notes,
  status,
  created_at,
  updated_at,
  company:companies!applications_company_owner_fkey(id, name)
` as const;

const KANBAN_APPLICATION_SELECT = `
  id,
  job_title,
  location,
  work_mode,
  employment_type,
  salary_min,
  salary_max,
  currency,
  applied_at,
  status,
  updated_at,
  company:companies!applications_company_owner_fkey(id, name)
` as const;

function emptyToNull<T extends string>(value: T | "") {
  return value === "" ? null : value;
}

function optionalNumber(value: string) {
  return value === "" ? null : Number(value);
}

function toApplicationPayload(values: ApplicationFormValues) {
  return {
    company_id: values.companyId,
    job_title: values.jobTitle,
    job_url: emptyToNull(values.jobUrl),
    location: emptyToNull(values.location),
    work_mode: emptyToNull(values.workMode) as WorkMode | null,
    employment_type: emptyToNull(
      values.employmentType,
    ) as EmploymentType | null,
    salary_min: optionalNumber(values.salaryMin),
    salary_max: optionalNumber(values.salaryMax),
    currency: values.currency,
    applied_at: emptyToNull(values.appliedAt),
    source: emptyToNull(values.source),
    description: emptyToNull(values.description),
    notes: emptyToNull(values.notes),
    status: values.status,
  };
}

export async function getApplications(
  userId: string,
  filters: ApplicationFilters,
): Promise<PaginatedApplications> {
  const supabase = await createClient();
  let matchingCompanyIds: string[] = [];

  if (filters.query) {
    const { data: matchingCompanies, error: companiesError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", `%${filters.query}%`);

    if (companiesError)
      throw new Error("Não foi possível pesquisar candidaturas.");
    matchingCompanyIds = matchingCompanies.map((company) => company.id);
  }

  let query = supabase
    .from("applications")
    .select(APPLICATION_SELECT, { count: "exact" })
    .eq("user_id", userId);

  if (filters.query) {
    const titleFilter = `job_title.ilike.*${filters.query}*`;
    query = matchingCompanyIds.length
      ? query.or(
          `${titleFilter},company_id.in.(${matchingCompanyIds.join(",")})`,
        )
      : query.ilike("job_title", `%${filters.query}%`);
  }

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.workMode) query = query.eq("work_mode", filters.workMode);
  if (filters.employmentType) {
    query = query.eq("employment_type", filters.employmentType);
  }
  if (filters.companyId) query = query.eq("company_id", filters.companyId);

  if (filters.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (filters.sort === "job") {
    query = query.order("job_title", { ascending: true });
  } else if (filters.sort === "company") {
    query = query.order("company(name)", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (filters.page - 1) * APPLICATION_PAGE_SIZE;
  const { data, count, error } = await query
    .order("id", { ascending: true })
    .range(from, from + APPLICATION_PAGE_SIZE - 1);

  if (error) throw new Error("Não foi possível carregar as candidaturas.");

  const total = count ?? 0;
  return {
    items: data,
    total,
    totalPages: Math.max(1, Math.ceil(total / APPLICATION_PAGE_SIZE)),
    page: filters.page,
  };
}

export async function getApplicationById(
  userId: string,
  applicationId: string,
): Promise<ApplicationDetail | null> {
  const supabase = await createClient();
  const applicationPromise = supabase
    .from("applications")
    .select(APPLICATION_SELECT)
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();
  const historyPromise = supabase
    .from("application_history")
    .select("id, user_id, application_id, from_status, to_status, created_at")
    .eq("application_id", applicationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const [applicationResult, historyResult] = await Promise.all([
    applicationPromise,
    historyPromise,
  ]);

  if (applicationResult.error || historyResult.error) {
    throw new Error("Não foi possível carregar a candidatura.");
  }
  if (!applicationResult.data) return null;

  return {
    ...applicationResult.data,
    history: historyResult.data,
  };
}

export async function getKanbanApplications(
  userId: string,
): Promise<KanbanApplicationsResult> {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("applications")
    .select(KANBAN_APPLICATION_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .range(0, KANBAN_APPLICATION_LIMIT - 1);

  if (error) throw new Error("Não foi possível carregar o Kanban.");

  const total = count ?? 0;
  return {
    items: data,
    total,
    isLimited: total > KANBAN_APPLICATION_LIMIT,
  };
}

export async function insertApplication(
  userId: string,
  values: ApplicationFormValues,
) {
  const supabase = await createClient();
  return supabase
    .from("applications")
    .insert({ user_id: userId, ...toApplicationPayload(values) })
    .select("id")
    .single();
}

export async function updateApplicationRecord(
  userId: string,
  applicationId: string,
  values: ApplicationFormValues,
) {
  const supabase = await createClient();
  return supabase
    .from("applications")
    .update(toApplicationPayload(values))
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
}

export async function updateApplicationStatusRecord(
  userId: string,
  applicationId: string,
  previousStatus: ApplicationStatus,
  status: ApplicationStatus,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .eq("user_id", userId)
    .eq("status", previousStatus)
    .neq("status", status)
    .select("id, status")
    .maybeSingle();

  if (error) return { outcome: "error" as const, error };
  if (data) return { outcome: "updated" as const, status: data.status };

  const current = await supabase
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (current.error) return { outcome: "error" as const, error: current.error };
  if (!current.data) return { outcome: "not_found" as const };
  if (current.data.status === status) {
    return { outcome: "unchanged" as const, status: current.data.status };
  }

  return { outcome: "conflict" as const, status: current.data.status };
}

export async function deleteApplicationRecord(
  userId: string,
  applicationId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
}
