import {
  READINESS_CENTER_FILTERS,
  READINESS_GAP_KEYS,
  READINESS_GAP_LABELS,
  type ReadinessCenterFilter,
} from "@/features/application-readiness/constants";
import { calculateApplicationReadiness } from "@/features/application-readiness/services/application-readiness-calculator";
import type {
  ApplicationReadinessItem,
  ApplicationReadinessItemKey,
  ApplicationReadinessResult,
} from "@/features/application-readiness/types/application-readiness";
import type {
  ReadinessCenterItem,
  ReadinessGapFilter,
  ReadinessGapSummary,
  ReadinessCenterSources,
  ReadinessCenterSummary,
} from "@/features/application-readiness/types/readiness-center";

const FILTERS = new Set<ReadinessCenterFilter>(READINESS_CENTER_FILTERS);
const GAP_FILTERS = new Set<ReadinessGapFilter>(READINESS_GAP_KEYS);

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

export function normalizeReadinessGapFilter(
  value?: string,
): ReadinessGapFilter {
  return GAP_FILTERS.has(value as ReadinessGapFilter)
    ? (value as ReadinessGapFilter)
    : "all";
}

export function filterReadinessCenterByGap(
  items: ReadinessCenterItem[],
  gap: ReadinessGapFilter,
) {
  if (gap === "all") return items;
  return items.filter((item) =>
    item.readiness.items.some(
      (readinessItem) => readinessItem.key === gap && !readinessItem.complete,
    ),
  );
}

export function getReadinessActionGap(
  item: ReadinessCenterItem,
  selectedGap: ReadinessGapFilter,
): ApplicationReadinessItem | undefined {
  if (selectedGap !== "all") {
    return item.readiness.items.find(
      (readinessItem) =>
        readinessItem.key === selectedGap && !readinessItem.complete,
    );
  }
  return item.readiness.items.find((readinessItem) => !readinessItem.complete);
}

export function summarizeReadinessGaps(
  items: ReadinessCenterItem[],
): ReadinessGapSummary[] {
  const summaries = new Map<
    ApplicationReadinessItemKey,
    Omit<ReadinessGapSummary, "percentage">
  >();
  for (const key of READINESS_GAP_KEYS) {
    summaries.set(key, {
      key,
      label: READINESS_GAP_LABELS[key],
      missing: 0,
      applicable: 0,
    });
  }

  for (const item of items) {
    for (const readinessItem of item.readiness.items) {
      const summary = summaries.get(readinessItem.key);
      if (!summary) continue;
      summary.applicable += 1;
      if (!readinessItem.complete) summary.missing += 1;
    }
  }

  return READINESS_GAP_KEYS.flatMap((key) => {
    const summary = summaries.get(key)!;
    return summary.applicable
      ? [
          {
            ...summary,
            percentage: Math.round(
              (summary.missing / summary.applicable) * 100,
            ),
          },
        ]
      : [];
  }).toSorted(
    (left, right) =>
      right.missing - left.missing ||
      READINESS_GAP_KEYS.indexOf(left.key) -
        READINESS_GAP_KEYS.indexOf(right.key),
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
