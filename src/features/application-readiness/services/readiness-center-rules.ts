import {
  READINESS_CENTER_FILTERS,
  type ReadinessCenterFilter,
} from "@/features/application-readiness/constants";
import { calculateApplicationReadiness } from "@/features/application-readiness/services/application-readiness-calculator";
import type { ApplicationReadinessResult } from "@/features/application-readiness/types/application-readiness";
import type {
  ReadinessCenterItem,
  ReadinessCenterSources,
  ReadinessCenterSummary,
} from "@/features/application-readiness/types/readiness-center";

const FILTERS = new Set<ReadinessCenterFilter>(READINESS_CENTER_FILTERS);

function groupInterviews(interviews: ReadinessCenterSources["interviews"]) {
  const byApplication = new Map<string, ReadinessCenterSources["interviews"]>();

  for (const interview of interviews) {
    const current = byApplication.get(interview.application_id) ?? [];
    current.push(interview);
    byApplication.set(interview.application_id, current);
  }

  return byApplication;
}

function contextualizeLinks(
  readiness: ApplicationReadinessResult,
  applicationId: string,
): ApplicationReadinessResult {
  const applicationHref = `/dashboard/candidaturas/${applicationId}`;

  return {
    ...readiness,
    items: readiness.items.map((item) => ({
      ...item,
      href: item.href.startsWith("#")
        ? `${applicationHref}${item.href}`
        : item.href,
    })),
  };
}

export function normalizeReadinessCenterFilter(
  value?: string,
): ReadinessCenterFilter {
  return FILTERS.has(value as ReadinessCenterFilter)
    ? (value as ReadinessCenterFilter)
    : "all";
}

export function filterReadinessCenterItems(
  items: ReadinessCenterItem[],
  filter: ReadinessCenterFilter,
) {
  if (filter === "all") return items;
  return items.filter((item) =>
    filter === "ready"
      ? item.readiness.state === "ready"
      : item.readiness.state !== "ready",
  );
}

export function summarizeReadinessCenter(
  items: ReadinessCenterItem[],
): ReadinessCenterSummary {
  const ready = items.filter((item) => item.readiness.state === "ready").length;
  const percentageTotal = items.reduce(
    (total, item) => total + item.readiness.percentage,
    0,
  );

  return {
    total: items.length,
    incomplete: items.length - ready,
    ready,
    averagePercentage: items.length
      ? Math.round(percentageTotal / items.length)
      : 0,
  };
}

export function buildReadinessCenterItems(
  sources: ReadinessCenterSources,
  now: string,
): ReadinessCenterItem[] {
  const contactApplicationIds = new Set(
    sources.contacts.map((contact) => contact.application_id),
  );
  const technologyApplicationIds = new Set(
    sources.technologies.map((technology) => technology.application_id),
  );
  const resumeApplicationIds = new Set(
    sources.resumes.map((resume) => resume.application_id),
  );
  const reminderApplicationIds = new Set(
    sources.reminders.map((reminder) => reminder.application_id),
  );
  const offerApplicationIds = new Set(
    sources.offers.map((offer) => offer.application_id),
  );
  const interviewsByApplication = groupInterviews(sources.interviews);

  return sources.applications
    .flatMap((application): ReadinessCenterItem[] => {
      const interviews = interviewsByApplication.get(application.id) ?? [];
      const readiness = calculateApplicationReadiness({
        id: application.id,
        status: application.status,
        archivedAt: application.archived_at,
        jobUrl: application.job_url,
        description: application.description,
        notes: application.notes,
        contactsCount: contactApplicationIds.has(application.id) ? 1 : 0,
        technologiesCount: technologyApplicationIds.has(application.id) ? 1 : 0,
        documents: resumeApplicationIds.has(application.id)
          ? [{ documentType: "resume" }]
          : [],
        reminders: reminderApplicationIds.has(application.id)
          ? [{ completedAt: null }]
          : [],
        interviews: interviews.map((interview) => ({
          result: interview.result,
          scheduledAt: interview.scheduled_at,
        })),
        hasOffer: offerApplicationIds.has(application.id),
        now,
      });

      if (!readiness) return [];

      return [
        {
          application: {
            id: application.id,
            jobTitle: application.job_title,
            status: application.status,
            updatedAt: application.updated_at,
            company: application.company,
          },
          readiness: contextualizeLinks(readiness, application.id),
        },
      ];
    })
    .toSorted(
      (left, right) =>
        left.readiness.percentage - right.readiness.percentage ||
        left.application.updatedAt.localeCompare(right.application.updatedAt) ||
        left.application.id.localeCompare(right.application.id),
    );
}
