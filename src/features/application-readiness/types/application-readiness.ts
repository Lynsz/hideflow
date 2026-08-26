import type {
  ApplicationStatus,
  DocumentType,
  InterviewResult,
} from "@/types/database";

export type ApplicationReadinessInput = {
  id: string;
  status: ApplicationStatus;
  archivedAt: string | null;
  jobUrl: string | null;
  description: string | null;
  notes: string | null;
  contactsCount: number;
  technologiesCount: number;
  documents: Array<{ documentType: DocumentType }>;
  reminders: Array<{ completedAt: string | null }>;
  interviews: Array<{
    result: InterviewResult;
    scheduledAt: string;
  }>;
  hasOffer: boolean;
  now: string;
};

export type ApplicationReadinessItemKey =
  | "context"
  | "technologies"
  | "contact"
  | "resume"
  | "next_step"
  | "interview"
  | "offer";

export type ApplicationReadinessItem = {
  key: ApplicationReadinessItemKey;
  label: string;
  description: string;
  complete: boolean;
  href: string;
  action: string;
};

export type ApplicationReadinessResult = {
  items: ApplicationReadinessItem[];
  completed: number;
  total: number;
  percentage: number;
  state: "ready" | "in_progress" | "needs_attention";
};
