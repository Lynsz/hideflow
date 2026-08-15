import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "@/features/applications/constants";
import { sanitizeSearchTerm } from "@/features/applications/services/application-filters";
import type {
  KanbanApplication,
  KanbanFilters,
} from "@/features/applications/types/application";
import type {
  ApplicationStatus,
  EmploymentType,
  WorkMode,
} from "@/types/database";

type RawFilters = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function parseKanbanFilters(raw: RawFilters): KanbanFilters {
  const workMode = first(raw.workMode);
  const employmentType = first(raw.employmentType);

  return {
    query: sanitizeSearchTerm(first(raw.q)),
    workMode: WORK_MODES.includes(workMode as WorkMode)
      ? (workMode as WorkMode)
      : "",
    employmentType: EMPLOYMENT_TYPES.includes(employmentType as EmploymentType)
      ? (employmentType as EmploymentType)
      : "",
    companyId: first(raw.company),
  };
}

export function buildKanbanUrl(filters: KanbanFilters) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.workMode) params.set("workMode", filters.workMode);
  if (filters.employmentType) {
    params.set("employmentType", filters.employmentType);
  }
  if (filters.companyId) params.set("company", filters.companyId);

  const query = params.toString();
  return `/dashboard/kanban${query ? `?${query}` : ""}`;
}

export function filterKanbanApplications(
  applications: readonly KanbanApplication[],
  filters: KanbanFilters,
) {
  const query = filters.query.toLocaleLowerCase("pt-BR");

  return applications.filter((application) => {
    const matchesQuery =
      !query ||
      application.job_title.toLocaleLowerCase("pt-BR").includes(query) ||
      application.company.name.toLocaleLowerCase("pt-BR").includes(query);

    return (
      matchesQuery &&
      (!filters.workMode || application.work_mode === filters.workMode) &&
      (!filters.employmentType ||
        application.employment_type === filters.employmentType) &&
      (!filters.companyId || application.company.id === filters.companyId)
    );
  });
}

export function groupKanbanApplications(
  applications: readonly KanbanApplication[],
) {
  const groups = {} as Record<ApplicationStatus, KanbanApplication[]>;
  for (const status of APPLICATION_STATUSES) groups[status] = [];

  for (const application of applications) {
    groups[application.status].push(application);
  }

  for (const status of APPLICATION_STATUSES) {
    groups[status].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  return groups;
}

export function moveKanbanApplication(
  applications: readonly KanbanApplication[],
  applicationId: string,
  status: ApplicationStatus,
  updatedAt = new Date().toISOString(),
) {
  const previous = applications.find(
    (application) => application.id === applicationId,
  );

  if (!previous || previous.status === status) {
    return { items: [...applications], previous, changed: false };
  }

  return {
    items: applications.map((application) =>
      application.id === applicationId
        ? { ...application, status, updated_at: updatedAt }
        : application,
    ),
    previous,
    changed: true,
  };
}

export function restoreKanbanApplication(
  applications: readonly KanbanApplication[],
  previous: KanbanApplication,
) {
  return applications.map((application) =>
    application.id === previous.id ? previous : application,
  );
}
