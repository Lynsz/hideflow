import {
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
} from "@/features/search/constants";

export type SearchQueryState = {
  query: string;
  canSearch: boolean;
  wasTruncated: boolean;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeSearchQuery(
  value: string | string[] | undefined,
): SearchQueryState {
  const original = firstValue(value)?.normalize("NFKC") ?? "";
  const safe = original
    .replace(/[^\p{L}\p{N}\s@.+#&/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const query = safe.slice(0, SEARCH_QUERY_MAX_LENGTH).trim();

  return {
    query,
    canSearch: query.length >= SEARCH_QUERY_MIN_LENGTH,
    wasTruncated: safe.length > SEARCH_QUERY_MAX_LENGTH,
  };
}

export function buildSearchPattern(query: string) {
  return `*${query}*`;
}
