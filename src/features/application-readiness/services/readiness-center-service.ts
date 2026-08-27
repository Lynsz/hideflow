import "server-only";

import {
  READINESS_CENTER_APPLICATION_LIMIT,
  READINESS_CENTER_PAGE_SIZE,
} from "@/features/application-readiness/constants";
import { buildReadinessCenterItems } from "@/features/application-readiness/services/readiness-center-rules";
import type { ReadinessCenterResult } from "@/features/application-readiness/types/readiness-center";
import { ACTIVE_APPLICATION_STATUSES } from "@/features/applications/constants";
import { createClient } from "@/lib/supabase/server";

const APPLICATION_SELECT =
  "id, job_title, job_url, description, notes, status, archived_at, updated_at, company:companies!applications_company_owner_fkey(id, name)" as const;

type PageResult<Row> = {
  data: Row[] | null;
  error: { message: string } | null;
};

async function fetchAllReadinessRows<Row>(
  loadPage: (from: number, to: number) => PromiseLike<PageResult<Row>>,
) {
  const rows: Row[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await loadPage(
      from,
      from + READINESS_CENTER_PAGE_SIZE - 1,
    );
    if (error || !data) {
      throw new Error("Não foi possível carregar a central de prontidão.");
    }
    rows.push(...data);
    if (data.length < READINESS_CENTER_PAGE_SIZE) return rows;
    from += READINESS_CENTER_PAGE_SIZE;
  }
}

export async function getReadinessCenter(
  userId: string,
  now = new Date().toISOString(),
): Promise<ReadinessCenterResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATION_SELECT)
    .eq("user_id", userId)
    .is("archived_at", null)
    .in("status", [...ACTIVE_APPLICATION_STATUSES])
    .order("updated_at", { ascending: true })
    .order("id", { ascending: true })
    .range(0, READINESS_CENTER_APPLICATION_LIMIT);

  if (error) {
    throw new Error("Não foi possível carregar a central de prontidão.");
  }

  const isLimited = data.length > READINESS_CENTER_APPLICATION_LIMIT;
  const applications = data.slice(0, READINESS_CENTER_APPLICATION_LIMIT);
  if (!applications.length) return { items: [], isLimited };

  const applicationIds = applications.map((application) => application.id);
  const [contacts, technologies, resumes, reminders, interviews, offers] =
    await Promise.all([
      fetchAllReadinessRows((from, to) =>
        supabase
          .from("application_contacts")
          .select("application_id")
          .eq("user_id", userId)
          .in("application_id", applicationIds)
          .order("application_id")
          .order("contact_id")
          .range(from, to),
      ),
      fetchAllReadinessRows((from, to) =>
        supabase
          .from("application_technologies")
          .select("application_id")
          .eq("user_id", userId)
          .in("application_id", applicationIds)
          .order("application_id")
          .order("technology_id")
          .range(from, to),
      ),
      fetchAllReadinessRows((from, to) =>
        supabase
          .from("documents")
          .select("application_id")
          .eq("user_id", userId)
          .in("application_id", applicationIds)
          .eq("document_type", "resume")
          .order("id")
          .range(from, to),
      ),
      fetchAllReadinessRows((from, to) =>
        supabase
          .from("reminders")
          .select("application_id")
          .eq("user_id", userId)
          .in("application_id", applicationIds)
          .is("completed_at", null)
          .order("id")
          .range(from, to),
      ),
      fetchAllReadinessRows((from, to) =>
        supabase
          .from("interviews")
          .select("application_id, result, scheduled_at")
          .eq("user_id", userId)
          .in("application_id", applicationIds)
          .order("id")
          .range(from, to),
      ),
      fetchAllReadinessRows((from, to) =>
        supabase
          .from("application_offers")
          .select("application_id")
          .eq("user_id", userId)
          .in("application_id", applicationIds)
          .order("id")
          .range(from, to),
      ),
    ]);

  return {
    items: buildReadinessCenterItems(
      {
        applications,
        contacts,
        technologies,
        resumes,
        reminders,
        interviews,
        offers,
      },
      now,
    ),
    isLimited,
  };
}
