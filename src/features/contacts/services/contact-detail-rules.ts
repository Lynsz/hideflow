import { ACTIVE_APPLICATION_STATUSES } from "@/features/applications/constants";
import type {
  ContactApplication,
  ContactInterview,
  ContactRelationshipSummary,
} from "@/features/contacts/types/contact";

const UPCOMING_INTERVIEW_RESULTS: readonly ContactInterview["result"][] = [
  "scheduled",
  "rescheduled",
];

export function summarizeContactRelationship(
  applications: ContactApplication[],
  interviews: ContactInterview[],
  nowIso: string,
): ContactRelationshipSummary {
  const now = Date.parse(nowIso);

  return {
    analyzedApplications: applications.length,
    activeApplications: applications.filter(
      (application) =>
        application.archived_at === null &&
        ACTIVE_APPLICATION_STATUSES.includes(application.status),
    ).length,
    analyzedInterviews: interviews.length,
    upcomingInterviews: interviews.filter(
      (interview) =>
        UPCOMING_INTERVIEW_RESULTS.includes(interview.result) &&
        Date.parse(interview.scheduled_at) >= now,
    ).length,
  };
}
