import {
  ACTIVE_APPLICATION_STATUSES,
  INTERVIEW_APPLICATION_STATUSES,
} from "@/features/applications/constants";
import type {
  CompanyApplicationSummary,
  CompanyDetailApplication,
} from "@/features/companies/types/company";

export function summarizeCompanyApplications(
  applications: CompanyDetailApplication[],
): CompanyApplicationSummary {
  return applications.reduce<CompanyApplicationSummary>(
    (summary, application) => {
      summary.analyzed += 1;

      if (
        application.archived_at === null &&
        ACTIVE_APPLICATION_STATUSES.includes(application.status)
      ) {
        summary.active += 1;
      }

      if (
        application.archived_at === null &&
        INTERVIEW_APPLICATION_STATUSES.includes(application.status)
      ) {
        summary.interviewStage += 1;
      }

      if (application.status === "hired") summary.hired += 1;
      return summary;
    },
    { analyzed: 0, active: 0, interviewStage: 0, hired: 0 },
  );
}
