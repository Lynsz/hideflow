import "server-only";

import {
  DOCUMENT_LIBRARY_PAGE_SIZE,
  DOCUMENT_LIBRARY_RELATED_SEARCH_LIMIT,
} from "@/features/documents/constants";
import type {
  DocumentLibraryFilters,
  PaginatedDocuments,
} from "@/features/documents/types/document";
import { buildSearchPattern } from "@/features/search/services/search-query";
import { createClient } from "@/lib/supabase/server";

const DOCUMENT_LIBRARY_SELECT =
  "id, application_id, name, original_name, document_type, mime_type, file_size, created_at, updated_at, application:applications!inner(id, job_title, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;

async function getRelatedApplicationIds(userId: string, query: string) {
  const supabase = await createClient();
  const pattern = buildSearchPattern(query);
  const [companies, applications] = await Promise.all([
    supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", pattern)
      .limit(DOCUMENT_LIBRARY_RELATED_SEARCH_LIMIT),
    supabase
      .from("applications")
      .select("id")
      .eq("user_id", userId)
      .ilike("job_title", pattern)
      .limit(DOCUMENT_LIBRARY_RELATED_SEARCH_LIMIT),
  ]);

  if (companies.error || applications.error) {
    throw new Error("Não foi possível pesquisar os documentos.");
  }

  const companyApplications = companies.data.length
    ? await supabase
        .from("applications")
        .select("id")
        .eq("user_id", userId)
        .in(
          "company_id",
          companies.data.map((company) => company.id),
        )
        .limit(DOCUMENT_LIBRARY_RELATED_SEARCH_LIMIT)
    : { data: [], error: null };

  if (companyApplications.error) {
    throw new Error("Não foi possível pesquisar os documentos.");
  }

  return [
    ...new Set([
      ...applications.data.map((application) => application.id),
      ...companyApplications.data.map((application) => application.id),
    ]),
  ];
}

export async function getDocumentLibrary(
  userId: string,
  filters: DocumentLibraryFilters,
): Promise<PaginatedDocuments> {
  const supabase = await createClient();
  const relatedApplicationIds = filters.query
    ? await getRelatedApplicationIds(userId, filters.query)
    : [];
  const pattern = buildSearchPattern(filters.query);
  let request = supabase
    .from("documents")
    .select(DOCUMENT_LIBRARY_SELECT, { count: "exact" })
    .eq("user_id", userId);

  if (filters.query) {
    const ownFields = `name.ilike.${pattern},original_name.ilike.${pattern}`;
    request = relatedApplicationIds.length
      ? request.or(
          `${ownFields},application_id.in.(${relatedApplicationIds.join(",")})`,
        )
      : request.or(ownFields);
  }
  if (filters.documentType) {
    request = request.eq("document_type", filters.documentType);
  }
  if (filters.companyId) {
    request = request.eq("application.company_id", filters.companyId);
  }
  if (filters.archive === "active") {
    request = request.is("application.archived_at", null);
  }
  if (filters.archive === "archived") {
    request = request.not("application.archived_at", "is", null);
  }

  if (filters.sort === "oldest") {
    request = request.order("created_at", { ascending: true });
  } else if (filters.sort === "name") {
    request = request.order("name", { ascending: true });
  } else {
    request = request.order("created_at", { ascending: false });
  }

  const from = (filters.page - 1) * DOCUMENT_LIBRARY_PAGE_SIZE;
  const { data, count, error } = await request
    .order("id", { ascending: true })
    .range(from, from + DOCUMENT_LIBRARY_PAGE_SIZE - 1);

  if (error) throw new Error("Não foi possível carregar os documentos.");

  const total = count ?? 0;
  return {
    items: data,
    total,
    totalPages: Math.max(1, Math.ceil(total / DOCUMENT_LIBRARY_PAGE_SIZE)),
    page: filters.page,
  };
}
