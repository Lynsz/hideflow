import { ACTIVE_APPLICATION_STATUSES } from "@/features/applications/constants";
import { sanitizeSearchTerm } from "@/features/applications/services/application-filters";
import { CONTACT_TYPES } from "@/features/contacts/constants";
import type {
  ContactPortfolioApplicationLink,
  ContactPortfolioContact,
  ContactPortfolioFilters,
  ContactPortfolioInterview,
  ContactPortfolioItem,
  ContactPortfolioSort,
  ContactPortfolioSummary,
  ContactRelationshipFilter,
} from "@/features/contacts/types/contact";
import type { ContactType } from "@/types/database";

type RawFilters = Record<string, string | string[] | undefined>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RELATIONSHIP_FILTERS: readonly ContactRelationshipFilter[] = [
  "all",
  "active",
  "interviewer",
  "unlinked",
];
const SORTS: readonly ContactPortfolioSort[] = [
  "name",
  "activity",
  "opportunities",
];
const CONTACT_TYPE_VALUES = CONTACT_TYPES.map((type) => type.value);
const UPCOMING_RESULTS: readonly ContactPortfolioInterview["result"][] = [
  "scheduled",
  "rescheduled",
];

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function newer(left: string, right: string) {
  return Date.parse(left) > Date.parse(right);
}

export function parseContactPortfolioFilters(
  raw: RawFilters,
): ContactPortfolioFilters {
  const companyId = first(raw.company);
  const contactType = first(raw.type);
  const relationship = first(raw.relationship);
  const sort = first(raw.sort);

  return {
    query: sanitizeSearchTerm(first(raw.q)),
    companyId: UUID_PATTERN.test(companyId) ? companyId : "",
    contactType: CONTACT_TYPE_VALUES.includes(contactType as ContactType)
      ? (contactType as ContactType)
      : "",
    relationship: RELATIONSHIP_FILTERS.includes(
      relationship as ContactRelationshipFilter,
    )
      ? (relationship as ContactRelationshipFilter)
      : "all",
    sort: SORTS.includes(sort as ContactPortfolioSort)
      ? (sort as ContactPortfolioSort)
      : "name",
  };
}

export function buildContactPortfolioItems(
  contacts: ContactPortfolioContact[],
  links: ContactPortfolioApplicationLink[],
  interviews: ContactPortfolioInterview[],
  nowIso: string,
): ContactPortfolioItem[] {
  const applicationsByContact = new Map<
    string,
    {
      count: number;
      activeCount: number;
      latest: ContactPortfolioApplicationLink["application"];
    }
  >();
  const interviewsByContact = new Map<
    string,
    { count: number; latestAt: string; nextAt: string | null }
  >();
  const now = Date.parse(nowIso);

  for (const link of links) {
    const current = applicationsByContact.get(link.contact_id);
    const isActive =
      link.application.archived_at === null &&
      ACTIVE_APPLICATION_STATUSES.includes(link.application.status);

    applicationsByContact.set(link.contact_id, {
      count: (current?.count ?? 0) + 1,
      activeCount: (current?.activeCount ?? 0) + (isActive ? 1 : 0),
      latest:
        !current ||
        newer(link.application.updated_at, current.latest.updated_at)
          ? link.application
          : current.latest,
    });
  }

  for (const interview of interviews) {
    if (!interview.contact_id) continue;
    const current = interviewsByContact.get(interview.contact_id);
    const isUpcoming =
      UPCOMING_RESULTS.includes(interview.result) &&
      Date.parse(interview.scheduled_at) >= now;
    const nextAt = isUpcoming
      ? !current?.nextAt ||
        Date.parse(interview.scheduled_at) < Date.parse(current.nextAt)
        ? interview.scheduled_at
        : current.nextAt
      : (current?.nextAt ?? null);

    interviewsByContact.set(interview.contact_id, {
      count: (current?.count ?? 0) + 1,
      latestAt:
        !current || newer(interview.updated_at, current.latestAt)
          ? interview.updated_at
          : current.latestAt,
      nextAt,
    });
  }

  return contacts.map((contact) => {
    const applicationStats = applicationsByContact.get(contact.id);
    const interviewStats = interviewsByContact.get(contact.id);
    const activityDates = [
      contact.updated_at,
      applicationStats?.latest.updated_at,
      interviewStats?.latestAt,
    ].filter((value): value is string => Boolean(value));

    return {
      ...contact,
      applicationCount: applicationStats?.count ?? 0,
      activeApplicationCount: applicationStats?.activeCount ?? 0,
      interviewCount: interviewStats?.count ?? 0,
      latestApplication: applicationStats?.latest ?? null,
      nextInterviewAt: interviewStats?.nextAt ?? null,
      lastActivityAt: activityDates.reduce((latest, value) =>
        newer(value, latest) ? value : latest,
      ),
    };
  });
}

export function filterAndSortContactPortfolio(
  items: ContactPortfolioItem[],
  filters: ContactPortfolioFilters,
) {
  const filtered = items.filter((item) => {
    if (filters.relationship === "active") {
      return item.activeApplicationCount > 0;
    }
    if (filters.relationship === "interviewer") {
      return item.interviewCount > 0;
    }
    if (filters.relationship === "unlinked") {
      return item.applicationCount === 0 && item.interviewCount === 0;
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
      const byInterviews = right.interviewCount - left.interviewCount;
      if (byInterviews !== 0) return byInterviews;
    }
    return left.name.localeCompare(right.name, "pt-BR");
  });
}

export function summarizeContactPortfolio(
  items: ContactPortfolioItem[],
): ContactPortfolioSummary {
  return items.reduce<ContactPortfolioSummary>(
    (summary, item) => {
      summary.totalContacts += 1;
      if (item.activeApplicationCount > 0) {
        summary.contactsWithActiveApplications += 1;
      }
      if (item.interviewCount > 0) summary.interviewers += 1;
      if (item.applicationCount === 0 && item.interviewCount === 0) {
        summary.unlinkedContacts += 1;
      }
      return summary;
    },
    {
      totalContacts: 0,
      contactsWithActiveApplications: 0,
      interviewers: 0,
      unlinkedContacts: 0,
    },
  );
}
