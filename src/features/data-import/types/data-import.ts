import type {
  ApplicationStatus,
  EmploymentType,
  SupportedCurrency,
  WorkMode,
} from "@/types/database";

export type ApplicationImportRow = {
  rowNumber: number;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  workMode: WorkMode | null;
  employmentType: EmploymentType | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: SupportedCurrency;
  appliedAt: string | null;
  source: string | null;
  jobUrl: string | null;
  technologies: string[];
};

export type ApplicationImportError = {
  rowNumber: number | null;
  message: string;
};

export type ApplicationImportParseResult = {
  rows: ApplicationImportRow[];
  errors: ApplicationImportError[];
};

export type ApplicationImportPreviewRow = Pick<
  ApplicationImportRow,
  "rowNumber" | "companyName" | "jobTitle" | "status"
> & { technologyCount: number };

export type ApplicationImportPreview = {
  totalRows: number;
  errorCount: number;
  rows: ApplicationImportPreviewRow[];
  errors: ApplicationImportError[];
};

export type ApplicationImportSummary = {
  imported: number;
  skipped: number;
  companiesCreated: number;
  technologiesLinked: number;
};

export type ApplicationImportActionResult = {
  success: boolean;
  message: string;
  preview?: ApplicationImportPreview;
  summary?: ApplicationImportSummary;
};
