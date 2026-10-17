import type {
  TechnologyPortfolioFilter,
  TechnologyPortfolioItem,
  TechnologyPortfolioLink,
  TechnologyPortfolioSummary,
} from "@/features/technologies/types/technology-portfolio";

const FILTERS: readonly TechnologyPortfolioFilter[] = [
  "all",
  "active",
  "archived",
];

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function parseTechnologyPortfolioFilter(
  value: string | string[] | undefined,
): TechnologyPortfolioFilter {
  const filter = first(value);
  return FILTERS.includes(filter as TechnologyPortfolioFilter)
    ? (filter as TechnologyPortfolioFilter)
    : "all";
}

function matchesFilter(
  item: TechnologyPortfolioLink,
  filter: TechnologyPortfolioFilter,
) {
  if (filter === "all") return true;
  return filter === "active"
    ? item.application.archived_at === null
    : item.application.archived_at !== null;
}

export function filterAndSummarizeTechnologyPortfolio(
  links: TechnologyPortfolioLink[],
  filter: TechnologyPortfolioFilter,
): { items: TechnologyPortfolioItem[]; summary: TechnologyPortfolioSummary } {
  const filtered = links.filter((item) => matchesFilter(item, filter));
  const grouped = new Map<string, TechnologyPortfolioItem>();
  const activeApplicationIds = new Set<string>();

  for (const link of filtered) {
    if (link.application.archived_at === null) {
      activeApplicationIds.add(link.application_id);
    }

    const item = grouped.get(link.technology.id) ?? {
      id: link.technology.id,
      name: link.technology.name,
      applications: [],
    };
    item.applications.push({
      id: link.application.id,
      jobTitle: link.application.job_title,
      companyName: link.application.company.name,
    });
    grouped.set(link.technology.id, item);
  }

  const items = [...grouped.values()].toSorted((left, right) => {
    const byApplications = right.applications.length - left.applications.length;
    return byApplications || left.name.localeCompare(right.name, "pt-BR");
  });

  return {
    items,
    summary: {
      technologies: items.length,
      links: filtered.length,
      activeApplications: activeApplicationIds.size,
      topTechnology: items[0]?.name ?? null,
    },
  };
}
