import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "@/features/applications/constants";
import type {
  ApplicationFilters,
  ApplicationSort,
} from "@/features/applications/types/application";
import type { ApplicationStatus, EmploymentType, WorkMode } from "@/types/database";

type RawFilters = Record<string, string | string[] | undefined>;

const SORTS: readonly ApplicationSort[] = ["recent", "oldest", "company", "job"];

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .replace(/[,*%_().\\]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

export function parseApplicationFilters(raw: RawFilters): ApplicationFilters {
  const status = first(raw.status);
  const workMode = first(raw.workMode);
  const employmentType = first(raw.employmentType);
  const sort = first(raw.sort);
  const parsedPage = Number.parseInt(first(raw.page), 10);

  return {
    query: sanitizeSearchTerm(first(raw.q)),
    status: APPLICATION_STATUSES.includes(status as ApplicationStatus)
      ? (status as ApplicationStatus)
      : "",
    workMode: WORK_MODES.includes(workMode as WorkMode)
      ? (workMode as WorkMode)
      : "",
    employmentType: EMPLOYMENT_TYPES.includes(employmentType as EmploymentType)
      ? (employmentType as EmploymentType)
      : "",
    companyId: first(raw.company),
    sort: SORTS.includes(sort as ApplicationSort)
      ? (sort as ApplicationSort)
      : "recent",
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

export function buildApplicationListUrl(
  filters: ApplicationFilters,
  overrides: Partial<ApplicationFilters> = {},
) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (next.query) params.set("q", next.query);
  if (next.status) params.set("status", next.status);
  if (next.workMode) params.set("workMode", next.workMode);
  if (next.employmentType) params.set("employmentType", next.employmentType);
  if (next.companyId) params.set("company", next.companyId);
  if (next.sort !== "recent") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return `/dashboard/candidaturas${query ? `?${query}` : ""}`;
}
