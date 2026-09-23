import { ACTIVE_APPLICATION_STATUSES } from "@/features/applications/constants";
import type {
  Company,
  CompanyPortfolioApplication,
  CompanyPortfolioContact,
  CompanyPortfolioFilters,
  CompanyPortfolioItem,
  CompanyPortfolioSort,
  CompanyPortfolioSummary,
  CompanyRelationshipFilter,
} from "@/features/companies/types/company";

type RawFilters = Record<string, string | string[] | undefined>;

export const COMPANY_RELATIONSHIP_FILTERS = [
  "all",
  "active",
  "history",
  "untracked",
] as const satisfies readonly CompanyRelationshipFilter[];

export const COMPANY_PORTFOLIO_SORTS = [
  "name",
  "activity",
  "opportunities",
] as const satisfies readonly CompanyPortfolioSort[];

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function sanitizeCompanySearch(value: string) {
  return value
    .trim()
    .replace(/[%_\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function parseCompanyPortfolioFilters(
  raw: RawFilters,
): CompanyPortfolioFilters {
  const relationship = first(raw.relationship);
  const sort = first(raw.sort);

  return {
    query: sanitizeCompanySearch(first(raw.q)),
    relationship: COMPANY_RELATIONSHIP_FILTERS.includes(
      relationship as CompanyRelationshipFilter,
    )
      ? (relationship as CompanyRelationshipFilter)
      : "all",
    sort: COMPANY_PORTFOLIO_SORTS.includes(sort as CompanyPortfolioSort)
      ? (sort as CompanyPortfolioSort)
      : "name",
  };
}

function newer(left: string, right: string) {
  return Date.parse(left) > Date.parse(right);
}

export function buildCompanyPortfolioItems(
  companies: Company[],
  applications: CompanyPortfolioApplication[],
  contacts: CompanyPortfolioContact[],
): CompanyPortfolioItem[] {
  const applicationsByCompany = new Map<
    string,
    {
      count: number;
      activeCount: number;
      latest: CompanyPortfolioApplication;
    }
  >();
  const contactsByCompany = new Map<
    string,
    { count: number; latestAt: string }
  >();

  for (const application of applications) {
    const current = applicationsByCompany.get(application.company_id);
    const isActive =
      application.archived_at === null &&
      ACTIVE_APPLICATION_STATUSES.includes(application.status);

    applicationsByCompany.set(application.company_id, {
      count: (current?.count ?? 0) + 1,
      activeCount: (current?.activeCount ?? 0) + (isActive ? 1 : 0),
      latest:
        !current || newer(application.updated_at, current.latest.updated_at)
          ? application
          : current.latest,
    });
  }

  for (const contact of contacts) {
    const current = contactsByCompany.get(contact.company_id);
    contactsByCompany.set(contact.company_id, {
      count: (current?.count ?? 0) + 1,
      latestAt:
        !current || newer(contact.updated_at, current.latestAt)
          ? contact.updated_at
          : current.latestAt,
    });
  }

  return companies.map((company) => {
    const applicationStats = applicationsByCompany.get(company.id);
    const contactStats = contactsByCompany.get(company.id);
    const activityDates = [
      company.updated_at,
      applicationStats?.latest.updated_at,
      contactStats?.latestAt,
    ].filter((value): value is string => Boolean(value));

    return {
      ...company,
      applicationCount: applicationStats?.count ?? 0,
      activeApplicationCount: applicationStats?.activeCount ?? 0,
      contactCount: contactStats?.count ?? 0,
      latestApplication: applicationStats?.latest ?? null,
      lastActivityAt: activityDates.reduce((latest, value) =>
        newer(value, latest) ? value : latest,
      ),
    };
  });
}

export function summarizeCompanyPortfolio(
  items: CompanyPortfolioItem[],
): CompanyPortfolioSummary {
  return items.reduce<CompanyPortfolioSummary>(
    (summary, item) => {
      summary.totalCompanies += 1;
      summary.activeApplications += item.activeApplicationCount;
      if (item.activeApplicationCount > 0) {
        summary.companiesWithActiveApplications += 1;
      }
      if (item.contactCount > 0) summary.companiesWithContacts += 1;
      return summary;
    },
    {
      totalCompanies: 0,
      companiesWithActiveApplications: 0,
      activeApplications: 0,
      companiesWithContacts: 0,
    },
  );
}

export function filterAndSortCompanyPortfolio(
  items: CompanyPortfolioItem[],
  filters: CompanyPortfolioFilters,
) {
  const filtered = items.filter((item) => {
    if (filters.relationship === "active") {
      return item.activeApplicationCount > 0;
    }
    if (filters.relationship === "history") {
      return item.applicationCount > 0 && item.activeApplicationCount === 0;
    }
    if (filters.relationship === "untracked") {
      return item.applicationCount === 0;
    }
    return true;
  });

  return filtered.toSorted((left, right) => {
    if (filters.sort === "activity") {
      const byActivity =
        Date.parse(right.lastActivityAt) - Date.parse(left.lastActivityAt);
      if (byActivity !== 0) return byActivity;
    }
    if (filters.sort === "opportunities") {
      const byApplications = right.applicationCount - left.applicationCount;
      if (byApplications !== 0) return byApplications;
      const byActive =
        right.activeApplicationCount - left.activeApplicationCount;
      if (byActive !== 0) return byActive;
    }
    return left.name.localeCompare(right.name, "pt-BR");
  });
}
