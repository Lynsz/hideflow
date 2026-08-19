import type { Database } from "@/types/database";

export type ApplicationDocument =
  Database["public"]["Tables"]["documents"]["Row"];

export type DocumentListItem = Pick<
  ApplicationDocument,
  | "id"
  | "name"
  | "original_name"
  | "document_type"
  | "mime_type"
  | "file_size"
  | "created_at"
>;

export type DocumentArchiveFilter = "active" | "archived" | "all";
export type DocumentLibrarySort = "recent" | "oldest" | "name";

export type DocumentLibraryFilters = {
  query: string;
  documentType: import("@/types/database").DocumentType | "";
  companyId: string;
  archive: DocumentArchiveFilter;
  sort: DocumentLibrarySort;
  page: number;
};

export type DocumentLibraryItem = Pick<
  ApplicationDocument,
  | "id"
  | "application_id"
  | "name"
  | "original_name"
  | "document_type"
  | "mime_type"
  | "file_size"
  | "created_at"
  | "updated_at"
> & {
  application: {
    id: string;
    job_title: string;
    archived_at: string | null;
    company: { id: string; name: string };
  };
};

export type PaginatedDocuments = {
  items: DocumentLibraryItem[];
  total: number;
  totalPages: number;
  page: number;
};
