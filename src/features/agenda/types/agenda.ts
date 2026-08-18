import type { InterviewType } from "@/types/database";

export type AgendaEventKind = "interview" | "reminder";

export type AgendaEvent = {
  id: string;
  kind: AgendaEventKind;
  title: string;
  description: string;
  scheduledAt: string;
  href: string;
  applicationHref: string;
  meetingUrl: string | null;
  interviewType: InterviewType | null;
  isOverdue: boolean;
};

export type AgendaFilters = {
  period: import("@/features/agenda/constants").AgendaPeriod;
  kind: import("@/features/agenda/constants").AgendaKindFilter;
};

export type AgendaResult = {
  items: AgendaEvent[];
  total: number;
  isLimited: boolean;
  now: string;
};
