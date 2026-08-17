import "server-only";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { calculateAnalytics } from "@/features/analytics/services/analytics-calculator";
import type {
  AnalyticsData,
  AnalyticsFilters,
} from "@/features/analytics/types/analytics";
import { createClient } from "@/lib/supabase/server";

const ANALYTICS_PAGE_SIZE = 1000;

export async function getAnalyticsData(
  filters: AnalyticsFilters,
): Promise<AnalyticsData> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão não encontrada.");
  const userId = user.id;

  const supabase = await createClient();
  async function loadApplications() {
    const rows = [];
    for (let from = 0; ; from += ANALYTICS_PAGE_SIZE) {
      const page = await supabase
        .from("applications")
        .select(
          "id, company_id, status, source, salary_min, salary_max, currency, applied_at, created_at, company:companies!applications_company_owner_fkey(id, name)",
        )
        .eq("user_id", userId)
        .order("id", { ascending: true })
        .range(from, from + ANALYTICS_PAGE_SIZE - 1);
      if (page.error) throw new Error("Não foi possível carregar o Analytics.");
      rows.push(...page.data);
      if (page.data.length < ANALYTICS_PAGE_SIZE) return rows;
    }
  }

  async function loadHistory() {
    const rows = [];
    for (let from = 0; ; from += ANALYTICS_PAGE_SIZE) {
      const page = await supabase
        .from("application_history")
        .select("id, application_id, to_status, created_at")
        .eq("user_id", userId)
        .order("id", { ascending: true })
        .range(from, from + ANALYTICS_PAGE_SIZE - 1);
      if (page.error) throw new Error("Não foi possível carregar o Analytics.");
      rows.push(...page.data);
      if (page.data.length < ANALYTICS_PAGE_SIZE) return rows;
    }
  }

  async function loadInterviews() {
    const rows = [];
    for (let from = 0; ; from += ANALYTICS_PAGE_SIZE) {
      const page = await supabase
        .from("interviews")
        .select("id, application_id, created_at")
        .eq("user_id", userId)
        .order("id", { ascending: true })
        .range(from, from + ANALYTICS_PAGE_SIZE - 1);
      if (page.error) throw new Error("Não foi possível carregar o Analytics.");
      rows.push(...page.data);
      if (page.data.length < ANALYTICS_PAGE_SIZE) return rows;
    }
  }

  const [applications, history, interviews] = await Promise.all([
    loadApplications(),
    loadHistory(),
    loadInterviews(),
  ]);

  return calculateAnalytics(applications, history, interviews, filters);
}
