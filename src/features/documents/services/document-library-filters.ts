import { DOCUMENT_TYPES } from "@/features/documents/constants";
import type {
  DocumentArchiveFilter,
  DocumentLibraryFilters,
  DocumentLibrarySort,
} from "@/features/documents/types/document";
import { sanitizeSearchTerm } from "@/features/applications/services/application-filters";
import type { DocumentType } from "@/types/database";

type RawFilters = Record<string, string | string[] | undefined>;

const ARCHIVE_FILTERS: readonly DocumentArchiveFilter[] = [
  "active",
  "archived",
  "all",
];
const SORTS: readonly DocumentLibrarySort[] = ["recent", "oldest", "name"];
const DOCUMENT_TYPE_VALUES = DOCUMENT_TYPES.map((type) => type.value);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function parseDocumentLibraryFilters(
  raw: RawFilters,
): DocumentLibraryFilters {
  const documentType = first(raw.type);
  const companyId = first(raw.company);
  const archive = first(raw.archive);
  const sort = first(raw.sort);
  const parsedPage = Number.parseInt(first(raw.page), 10);

  return {
    query: sanitizeSearchTerm(first(raw.q)),
    documentType: DOCUMENT_TYPE_VALUES.includes(documentType as DocumentType)
      ? (documentType as DocumentType)
      : "",
    companyId: UUID_PATTERN.test(companyId) ? companyId : "",
    archive: ARCHIVE_FILTERS.includes(archive as DocumentArchiveFilter)
      ? (archive as DocumentArchiveFilter)
      : "active",
    sort: SORTS.includes(sort as DocumentLibrarySort)
      ? (sort as DocumentLibrarySort)
      : "recent",
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

export function buildDocumentLibraryUrl(
  filters: DocumentLibraryFilters,
  overrides: Partial<DocumentLibraryFilters> = {},
) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (next.query) params.set("q", next.query);
  if (next.documentType) params.set("type", next.documentType);
  if (next.companyId) params.set("company", next.companyId);
  if (next.archive !== "active") params.set("archive", next.archive);
  if (next.sort !== "recent") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return `/dashboard/documentos${query ? `?${query}` : ""}`;
}
