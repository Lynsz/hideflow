import {
  PRIORITY_FILTERS,
  type PriorityFilter,
} from "@/features/priorities/constants";
import type {
  PriorityApplication,
  PriorityItem,
  PriorityKind,
  PrioritySeverity,
  PrioritySources,
} from "@/features/priorities/types/priority";
import { ACTIVE_APPLICATION_STATUSES } from "@/features/applications/constants";
import { formatInterviewType } from "@/features/interviews/constants";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const FILTERS = new Set<PriorityFilter>(PRIORITY_FILTERS);
const ACTIVE_STATUSES = new Set(ACTIVE_APPLICATION_STATUSES);

const severityOrder: Record<PrioritySeverity, number> = {
  critical: 0,
  attention: 1,
  planned: 2,
};

const kindOrder: Record<PriorityKind, number> = {
  overdue_reminder: 0,
  offer_deadline: 1,
  upcoming_interview: 2,
  stale_application: 3,
};

function description(jobTitle: string, companyName: string) {
  return `${jobTitle} · ${companyName}`;
}

function applicationHref(applicationId: string) {
  return `/dashboard/candidaturas/${applicationId}`;
}

function isActiveApplication(application: PriorityApplication) {
  return !application.archived_at && ACTIVE_STATUSES.has(application.status);
}

function offerSeverity(deadline: string, today: string): PrioritySeverity {
  if (deadline < today) return "critical";
  const days =
    (Date.parse(`${deadline}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
    DAY_IN_MS;
  return days <= 2 ? "attention" : "planned";
}

function interviewSeverity(scheduledAt: string, now: string): PrioritySeverity {
  return Date.parse(scheduledAt) - Date.parse(now) <= DAY_IN_MS
    ? "attention"
    : "planned";
}

export function normalizePriorityFilter(value?: string): PriorityFilter {
  return FILTERS.has(value as PriorityFilter)
    ? (value as PriorityFilter)
    : "all";
}

export function filterPriorityItems(
  items: PriorityItem[],
  filter: PriorityFilter,
) {
  if (filter === "all") return items;
  const kindByFilter: Record<Exclude<PriorityFilter, "all">, PriorityKind> = {
    overdue: "overdue_reminder",
    offers: "offer_deadline",
    interviews: "upcoming_interview",
    stale: "stale_application",
  };
  return items.filter((item) => item.kind === kindByFilter[filter]);
}

export function buildPriorityItems(
  sources: PrioritySources,
  now: string,
): PriorityItem[] {
  const today = now.slice(0, 10);
  const activeReminders = sources.reminders.filter((reminder) =>
    isActiveApplication(reminder.application),
  );
  const activeOffers = sources.offers.filter((offer) =>
    isActiveApplication(offer.application),
  );
  const activeInterviews = sources.interviews.filter((interview) =>
    isActiveApplication(interview.application),
  );
  const coveredApplicationIds = new Set([
    ...activeReminders.map((item) => item.application.id),
    ...activeOffers.map((item) => item.application.id),
    ...activeInterviews.map((item) => item.application.id),
  ]);

  const items: PriorityItem[] = [
    ...activeReminders.map((reminder): PriorityItem => ({
      id: `reminder:${reminder.id}`,
      kind: "overdue_reminder",
      severity: "critical",
      title: reminder.title,
      description: description(
        reminder.application.job_title,
        reminder.application.company.name,
      ),
      scheduledAt: reminder.due_at,
      dateKind: "instant",
      href: `/dashboard/lembretes/${reminder.id}/editar`,
      applicationHref: applicationHref(reminder.application.id),
      applicationId: reminder.application.id,
    })),
    ...activeOffers.map((offer): PriorityItem => ({
      id: `offer:${offer.id}`,
      kind: "offer_deadline",
      severity: offerSeverity(offer.decision_deadline, today),
      title:
        offer.decision_deadline < today
          ? "Proposta com decisão atrasada"
          : "Decidir proposta",
      description: description(
        offer.application.job_title,
        offer.application.company.name,
      ),
      scheduledAt: offer.decision_deadline,
      dateKind: "civil",
      href: applicationHref(offer.application.id),
      applicationHref: applicationHref(offer.application.id),
      applicationId: offer.application.id,
    })),
    ...activeInterviews.map((interview): PriorityItem => ({
      id: `interview:${interview.id}`,
      kind: "upcoming_interview",
      severity: interviewSeverity(interview.scheduled_at, now),
      title: `Entrevista ${formatInterviewType(interview.type).toLowerCase()}`,
      description: description(
        interview.application.job_title,
        interview.application.company.name,
      ),
      scheduledAt: interview.scheduled_at,
      dateKind: "instant",
      href: `/dashboard/entrevistas/${interview.id}/editar`,
      applicationHref: applicationHref(interview.application.id),
      applicationId: interview.application.id,
    })),
    ...sources.staleApplications
      .filter(
        (application) =>
          isActiveApplication(application) &&
          !coveredApplicationIds.has(application.id),
      )
      .map((application): PriorityItem => ({
        id: `application:${application.id}`,
        kind: "stale_application",
        severity: "attention",
        title: "Revisar candidatura sem atualização",
        description: description(
          application.job_title,
          application.company.name,
        ),
        scheduledAt: application.updated_at,
        dateKind: "instant",
        href: applicationHref(application.id),
        applicationHref: applicationHref(application.id),
        applicationId: application.id,
      })),
  ];

  return items.toSorted(
    (left, right) =>
      severityOrder[left.severity] - severityOrder[right.severity] ||
      kindOrder[left.kind] - kindOrder[right.kind] ||
      left.scheduledAt.localeCompare(right.scheduledAt) ||
      left.id.localeCompare(right.id),
  );
}
