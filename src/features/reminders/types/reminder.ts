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
