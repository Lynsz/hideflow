import type { Database } from "@/types/database";

type PublicTables = Database["public"]["Tables"];
export type ExportTableRow<Table extends keyof PublicTables> =
  PublicTables[Table]["Row"];

export type UserDataSnapshot = {
  profile: ExportTableRow<"profiles">;
  companies: ExportTableRow<"companies">[];
  applications: ExportTableRow<"applications">[];
  contacts: ExportTableRow<"contacts">[];
  applicationContacts: ExportTableRow<"application_contacts">[];
  interviews: ExportTableRow<"interviews">[];
  interviewPreparations: ExportTableRow<"interview_preparations">[];
  interviewDebriefs: ExportTableRow<"interview_debriefs">[];
  interviewEvents: ExportTableRow<"interview_events">[];
  applicationHistory: ExportTableRow<"application_history">[];
  documents: ExportTableRow<"documents">[];
  reminders: ExportTableRow<"reminders">[];
  technologies: ExportTableRow<"technologies">[];
  applicationTechnologies: ExportTableRow<"application_technologies">[];
  applicationActivities: ExportTableRow<"application_activities">[];
  applicationOffers: ExportTableRow<"application_offers">[];
  weeklyReviews: ExportTableRow<"weekly_reviews">[];
};

export type UserDataExport = {
  schemaVersion: number;
  exportedAt: string;
  account: {
    email: string;
  };
  data: UserDataSnapshot;
};
