import type { CompanyOption } from "@/features/companies/types/company";
import type { Database } from "@/types/database";

export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

export type ReminderApplicationOption = {
  id: string;
  job_title: string;
  company: CompanyOption;
};

export type ReminderListItem = Pick<
  Reminder,
  "id" | "application_id" | "title" | "notes" | "due_at" | "completed_at"
> & {
  application: ReminderApplicationOption;
};

export type ReminderPortfolioSummary = {
  open: number;
  overdue: number;
  dueSoon: number;
  completed: number;
};

export type ReminderPortfolioResult = {
  items: ReminderListItem[];
  now: string;
  summary: ReminderPortfolioSummary;
  isLimited: boolean;
};
