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
