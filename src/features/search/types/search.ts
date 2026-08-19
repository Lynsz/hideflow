export type SearchResultKind =
  | "application"
  | "company"
  | "contact"
  | "reminder"
  | "document"
  | "technology"
  | "activity"
  | "offer";

export type GlobalSearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  description: string;
  href: string;
};

export type GlobalSearchGroup = {
  kind: SearchResultKind;
  label: string;
  items: GlobalSearchResult[];
};

export type GlobalSearchResponse = {
  groups: GlobalSearchGroup[];
  total: number;
  isLimited: boolean;
};
