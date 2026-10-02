import type { CompanyOption } from "@/features/companies/types/company";
import type { ContactOption } from "@/features/contacts/types/contact";
import type { Database } from "@/types/database";

export type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type InterviewEvent =
  Database["public"]["Tables"]["interview_events"]["Row"];
export type InterviewApplicationOption = {
  id: string;
  job_title: string;
  company_id: string;
  company: CompanyOption;
};
export type InterviewListItem = Pick<
  Interview,
  | "id"
  | "application_id"
  | "type"
  | "scheduled_at"
  | "interviewer_name"
  | "meeting_url"
  | "result"
> & {
  application: InterviewApplicationOption;
  contact: ContactOption | null;
};

type InterviewPreparation =
  Database["public"]["Tables"]["interview_preparations"]["Row"];
type InterviewDebrief =
  Database["public"]["Tables"]["interview_debriefs"]["Row"];

export type InterviewPortfolioState =
  "all" | "upcoming" | "awaiting" | "finished";
export type InterviewPortfolioFocus =
  "all" | "preparation" | "debrief" | "thank_you";
export type InterviewPortfolioSort = "next" | "recent" | "company";
export type InterviewPortfolioFilters = {
  query: string;
  companyId: string;
  type: Interview["type"] | "";
  state: InterviewPortfolioState;
  focus: InterviewPortfolioFocus;
  sort: InterviewPortfolioSort;
};
export type InterviewPortfolioPreparation = Pick<
  InterviewPreparation,
  | "interview_id"
  | "company_research"
  | "role_alignment"
  | "star_stories"
  | "questions_to_ask"
  | "logistics_notes"
>;
export type InterviewPortfolioDebrief = Pick<
  InterviewDebrief,
  | "interview_id"
  | "overall_rating"
  | "went_well"
  | "improve_next_time"
  | "questions_received"
  | "follow_up_notes"
  | "thank_you_sent_at"
>;
export type InterviewPortfolioItem = InterviewListItem & {
  state: Exclude<InterviewPortfolioState, "all">;
  preparationCompleted: number;
  preparationTotal: number;
  preparationPercentage: number;
  debriefCompleted: number;
  debriefTotal: number;
  debriefPercentage: number;
  thankYouSent: boolean;
  preparationPending: boolean;
  debriefPending: boolean;
  thankYouPending: boolean;
};
export type InterviewPortfolioSummary = {
  totalInterviews: number;
  upcomingInterviews: number;
  preparationPending: number;
  debriefPending: number;
};
export type InterviewPortfolioResult = {
  items: InterviewPortfolioItem[];
  summary: InterviewPortfolioSummary;
  isLimited: boolean;
};
