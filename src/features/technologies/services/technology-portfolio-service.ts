import "server-only";

import { filterAndSummarizeTechnologyPortfolio } from "@/features/technologies/services/technology-portfolio-rules";
import type {
  TechnologyPortfolioFilter,
  TechnologyPortfolioLink,
} from "@/features/technologies/types/technology-portfolio";
import { createClient } from "@/lib/supabase/server";

const TECHNOLOGY_PORTFOLIO_LIMIT = 300;
const TECHNOLOGY_PORTFOLIO_SELECT =
  "application_id, technology:technologies!application_technologies_technology_owner_fkey(id, name), application:applications!application_technologies_application_owner_fkey(id, job_title, archived_at, company:companies!applications_company_owner_fkey(name))" as const;

export async function getTechnologyPortfolio(
  userId: string,
  filter: TechnologyPortfolioFilter,
) {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("application_technologies")
    .select(TECHNOLOGY_PORTFOLIO_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(0, TECHNOLOGY_PORTFOLIO_LIMIT - 1);

  if (error) throw new Error("Não foi possível carregar as tecnologias.");

  const links = data satisfies TechnologyPortfolioLink[];
  return {
    ...filterAndSummarizeTechnologyPortfolio(links, filter),
    isLimited: (count ?? links.length) > links.length,
  };
}
