export type PriorityKind =
  | "overdue_reminder"
  | "offer_deadline"
  | "upcoming_interview"
  | "stale_application";

export type PrioritySeverity = "critical" | "attention" | "planned";

export type PriorityApplication = {
  id: string;
  job_title: string;
  status: import("@/types/database").ApplicationStatus;
  archived_at: string | null;
  company: { id: string; name: string };
};

export type PriorityReminderSource = {
  id: string;
  title: string;
  due_at: string;
  application: PriorityApplication;
};

export type PriorityOfferSource = {
  id: string;
  decision_deadline: string;
  application: PriorityApplication;
};

export type PriorityInterviewSource = {
  id: string;
  scheduled_at: string;
  type: import("@/types/database").InterviewType;
  application: PriorityApplication;
};

export type PriorityStaleApplicationSource = PriorityApplication & {
  updated_at: string;
};

export type PrioritySources = {
  reminders: PriorityReminderSource[];
  offers: PriorityOfferSource[];
  interviews: PriorityInterviewSource[];
  staleApplications: PriorityStaleApplicationSource[];
};

export type PriorityItem = {
  id: string;
  kind: PriorityKind;
  severity: PrioritySeverity;
  title: string;
  description: string;
  scheduledAt: string;
  dateKind: "instant" | "civil";
  href: string;
  applicationHref: string;
  applicationId: string;
};

export type PriorityResult = {
  items: PriorityItem[];
  now: string;
  isLimited: boolean;
};
