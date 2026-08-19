import "server-only";

import { SEARCH_RESULT_LIMIT } from "@/features/search/constants";
import { buildSearchPattern } from "@/features/search/services/search-query";
import type {
  GlobalSearchGroup,
  GlobalSearchResponse,
  GlobalSearchResult,
} from "@/features/search/types/search";
import { createClient } from "@/lib/supabase/server";

const COMPANY_SELECT = "id, name, location" as const;
const APPLICATION_SELECT =
  "id, company_id, job_title, location, source, archived_at, company:companies!applications_company_owner_fkey(id, name)" as const;
const CONTACT_SELECT =
  "id, name, role, email, phone, company:companies!contacts_company_owner_fkey(id, name)" as const;
const REMINDER_SELECT =
  "id, title, notes, application:applications!reminders_application_owner_fkey(id, job_title, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;
const DOCUMENT_SELECT =
  "id, name, original_name, application:applications!documents_application_owner_fkey(id, job_title, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;
const TECHNOLOGY_SELECT = "id, name" as const;
const TECHNOLOGY_LINK_SELECT =
  "technology_id, application:applications!application_technologies_application_owner_fkey(id, job_title, archived_at, company:companies!applications_company_owner_fkey(id, name)), technology:technologies!application_technologies_technology_owner_fkey(id, name)" as const;
const ACTIVITY_SELECT =
  "id, title, notes, application:applications!application_activities_application_owner_fkey(id, job_title, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;

function joinDescription(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" · ");
}

function archiveLabel(archivedAt: string | null) {
  return archivedAt ? "Arquivada" : undefined;
}

function uniqueById(items: GlobalSearchResult[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function createResponse(groups: GlobalSearchGroup[]): GlobalSearchResponse {
  const visibleGroups = groups.filter((group) => group.items.length > 0);
  return {
    groups: visibleGroups,
    total: visibleGroups.reduce(
      (total, group) => total + group.items.length,
      0,
    ),
    isLimited: visibleGroups.some(
      (group) => group.items.length === SEARCH_RESULT_LIMIT,
    ),
  };
}

export async function searchWorkspace(
  userId: string,
  query: string,
): Promise<GlobalSearchResponse> {
  const supabase = await createClient();
  const pattern = buildSearchPattern(query);

  const [
    companies,
    applications,
    contacts,
    reminders,
    documents,
    technologies,
    activities,
  ] = await Promise.all([
    supabase
      .from("companies")
      .select(COMPANY_SELECT)
      .eq("user_id", userId)
      .or(`name.ilike.${pattern},location.ilike.${pattern}`)
      .order("name")
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("applications")
      .select(APPLICATION_SELECT)
      .eq("user_id", userId)
      .or(
        `job_title.ilike.${pattern},location.ilike.${pattern},source.ilike.${pattern}`,
      )
      .order("updated_at", { ascending: false })
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("contacts")
      .select(CONTACT_SELECT)
      .eq("user_id", userId)
      .or(
        `name.ilike.${pattern},role.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`,
      )
      .order("name")
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("reminders")
      .select(REMINDER_SELECT)
      .eq("user_id", userId)
      .or(`title.ilike.${pattern},notes.ilike.${pattern}`)
      .order("due_at", { ascending: true })
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("documents")
      .select(DOCUMENT_SELECT)
      .eq("user_id", userId)
      .or(`name.ilike.${pattern},original_name.ilike.${pattern}`)
      .order("updated_at", { ascending: false })
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("technologies")
      .select(TECHNOLOGY_SELECT)
      .eq("user_id", userId)
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("application_activities")
      .select(ACTIVITY_SELECT)
      .eq("user_id", userId)
      .or(`title.ilike.${pattern},notes.ilike.${pattern}`)
      .order("occurred_at", { ascending: false })
      .limit(SEARCH_RESULT_LIMIT),
  ]);

  if (
    companies.error ||
    applications.error ||
    contacts.error ||
    reminders.error ||
    documents.error ||
    technologies.error ||
    activities.error
  ) {
    throw new Error("Não foi possível concluir a busca global.");
  }

  const matchingCompanyIds = companies.data.map((company) => company.id);
  const matchingTechnologyIds = technologies.data.map(
    (technology) => technology.id,
  );

  const [companyApplications, technologyLinks] = await Promise.all([
    matchingCompanyIds.length
      ? supabase
          .from("applications")
          .select(APPLICATION_SELECT)
          .eq("user_id", userId)
          .in("company_id", matchingCompanyIds)
          .order("updated_at", { ascending: false })
          .limit(SEARCH_RESULT_LIMIT)
      : Promise.resolve({ data: [], error: null }),
    matchingTechnologyIds.length
      ? supabase
          .from("application_technologies")
          .select(TECHNOLOGY_LINK_SELECT)
          .eq("user_id", userId)
          .in("technology_id", matchingTechnologyIds)
          .order("created_at", { ascending: false })
          .limit(SEARCH_RESULT_LIMIT)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (companyApplications.error || technologyLinks.error) {
    throw new Error("Não foi possível concluir a busca global.");
  }

  const applicationItems = uniqueById(
    [...applications.data, ...companyApplications.data].map((application) => ({
      id: application.id,
      kind: "application" as const,
      title: application.job_title,
      description: joinDescription(
        application.company.name,
        application.location,
        archiveLabel(application.archived_at),
      ),
      href: `/dashboard/candidaturas/${application.id}`,
    })),
  ).slice(0, SEARCH_RESULT_LIMIT);
  const companyItems = companies.data.map((company) => ({
    id: company.id,
    kind: "company" as const,
    title: company.name,
    description: joinDescription("Empresa", company.location),
    href: `/dashboard/empresas/${company.id}/editar`,
  }));
  const contactItems = contacts.data.map((contact) => ({
    id: contact.id,
    kind: "contact" as const,
    title: contact.name,
    description: joinDescription(contact.role, contact.company.name),
    href: `/dashboard/contatos/${contact.id}`,
  }));
  const reminderItems = reminders.data.map((reminder) => ({
    id: reminder.id,
    kind: "reminder" as const,
    title: reminder.title,
    description: joinDescription(
      reminder.application.job_title,
      reminder.application.company.name,
      archiveLabel(reminder.application.archived_at),
    ),
    href: `/dashboard/lembretes/${reminder.id}/editar`,
  }));
  const documentItems = documents.data.map((document) => ({
    id: document.id,
    kind: "document" as const,
    title: document.name,
    description: joinDescription(
      document.application.job_title,
      document.application.company.name,
      archiveLabel(document.application.archived_at),
    ),
    href: `/dashboard/candidaturas/${document.application.id}`,
  }));
  const technologyItems = technologyLinks.data.map((link) => ({
    id: `${link.technology_id}:${link.application.id}`,
    kind: "technology" as const,
    title: link.technology.name,
    description: joinDescription(
      link.application.job_title,
      link.application.company.name,
      archiveLabel(link.application.archived_at),
    ),
    href: `/dashboard/candidaturas/${link.application.id}`,
  }));
  const activityItems = activities.data.map((activity) => ({
    id: activity.id,
    kind: "activity" as const,
    title: activity.title,
    description: joinDescription(
      activity.application.job_title,
      activity.application.company.name,
      archiveLabel(activity.application.archived_at),
    ),
    href: `/dashboard/candidaturas/${activity.application.id}`,
  }));

  return createResponse([
    { kind: "application", label: "Candidaturas", items: applicationItems },
    { kind: "company", label: "Empresas", items: companyItems },
    { kind: "contact", label: "Contatos", items: contactItems },
    { kind: "reminder", label: "Lembretes", items: reminderItems },
    { kind: "document", label: "Documentos", items: documentItems },
    { kind: "technology", label: "Tecnologias", items: technologyItems },
    { kind: "activity", label: "Interações", items: activityItems },
  ]);
}
