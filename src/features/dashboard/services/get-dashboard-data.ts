import "server-only";

import { cache } from "react";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  ACTIVE_APPLICATION_STATUSES,
  INTERVIEW_APPLICATION_STATUSES,
} from "@/features/applications/constants";
import type { DashboardData } from "@/features/dashboard/types/dashboard";
import { createClient } from "@/lib/supabase/server";

const RECENT_SELECT = `
  id,
  user_id,
  company_id,
  job_title,
  job_url,
  location,
  work_mode,
  employment_type,
  salary_min,
  salary_max,
  currency,
  applied_at,
  source,
  description,
  notes,
  status,
  created_at,
  updated_at,
  company:companies!applications_company_owner_fkey(id, name)
` as const;

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  const user = await getCurrentUser();
  if (!user)
    return { metrics: [], recentApplications: [], nextInterview: null };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const count = () =>
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

  const [
    total,
    active,
    interviewStages,
    upcomingInterviews,
    offers,
    hired,
    rejected,
    recent,
    nextInterview,
  ] = await Promise.all([
    count(),
    count().in("status", [...ACTIVE_APPLICATION_STATUSES]),
    count().in("status", [...INTERVIEW_APPLICATION_STATUSES]),
    supabase
      .from("interviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("scheduled_at", now)
      .in("result", ["scheduled", "rescheduled"]),
    count().eq("status", "offer"),
    count().eq("status", "hired"),
    count().eq("status", "rejected"),
    supabase
      .from("applications")
      .select(RECENT_SELECT)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("interviews")
      .select(
        "id, scheduled_at, type, application_id, application:applications!interviews_application_owner_fkey(job_title, company:companies!applications_company_owner_fkey(id, name))",
      )
      .eq("user_id", user.id)
      .gte("scheduled_at", now)
      .in("result", ["scheduled", "rescheduled"])
      .order("scheduled_at")
      .limit(1)
      .maybeSingle(),
  ]);

  const results = [
    total,
    active,
    interviewStages,
    upcomingInterviews,
    offers,
    hired,
    rejected,
    recent,
    nextInterview,
  ];
  if (results.some((result) => result.error)) {
    throw new Error("Não foi possível carregar o dashboard.");
  }

  return {
    metrics: [
      {
        key: "applications",
        label: "Total de candidaturas",
        value: total.count ?? 0,
        supportingText: "Todos os registros",
      },
      {
        key: "active",
        label: "Em processo",
        value: active.count ?? 0,
        supportingText: "Oportunidades ativas",
      },
      {
        key: "interviews",
        label: "Candidaturas em entrevista",
        value: interviewStages.count ?? 0,
        supportingText: "Etapas do pipeline",
      },
      {
        key: "upcoming_interviews",
        label: "Entrevistas próximas",
        value: upcomingInterviews.count ?? 0,
        supportingText: "Eventos agendados",
      },
      {
        key: "offers",
        label: "Propostas",
        value: offers.count ?? 0,
        supportingText: "Aguardando decisão",
      },
      {
        key: "hired",
        label: "Contratações",
        value: hired.count ?? 0,
        supportingText: "Processos concluídos",
      },
      {
        key: "rejected",
        label: "Rejeições",
        value: rejected.count ?? 0,
        supportingText: "Processos encerrados",
      },
    ],
    recentApplications: recent.data ?? [],
    nextInterview: nextInterview.data,
  };
});
