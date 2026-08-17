import {
  ANALYTICS_PERIOD_LABELS,
  INTERVIEW_MILESTONE_STATUSES,
  OFFER_MILESTONE_STATUSES,
  RESPONSE_STATUSES,
} from "@/features/analytics/constants";
import type {
  AnalyticsApplication,
  AnalyticsBarDatum,
  AnalyticsCoverageDatum,
  AnalyticsData,
  AnalyticsFilters,
  AnalyticsHistory,
  AnalyticsInterview,
  MonthlyApplicationDatum,
  SalaryAverage,
} from "@/features/analytics/types/analytics";
import {
  APPLICATION_SOURCES,
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
} from "@/features/applications/constants";
import type { ApplicationStatus } from "@/types/database";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RESPONSE_STATUS_SET = new Set<ApplicationStatus>(RESPONSE_STATUSES);

function percentage(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 100) : 0;
}

function rateLabel(numerator: number, denominator: number) {
  return denominator ? `${percentage(numerator, denominator)}%` : "—";
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  const shortMonth = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace(".", "");
  return `${shortMonth}/${String(year).slice(-2)}`;
}

function startOfPeriod(filters: AnalyticsFilters, now: Date) {
  if (filters.period === "all") return null;
  const months = Number.parseInt(filters.period, 10);
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1),
  );
}

function buildMonthlyApplications(
  applications: AnalyticsApplication[],
  filters: AnalyticsFilters,
  now: Date,
): MonthlyApplicationDatum[] {
  const periodStart = startOfPeriod(filters, now);
  const earliest = applications.reduce<Date | null>((result, application) => {
    const createdAt = new Date(application.created_at);
    return !result || createdAt < result ? createdAt : result;
  }, null);
  const start =
    periodStart ??
    (earliest
      ? new Date(Date.UTC(earliest.getUTCFullYear(), earliest.getUTCMonth(), 1))
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)));
  const counts = new Map<string, number>();
  for (const application of applications) {
    const key = monthKey(new Date(application.created_at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const points: MonthlyApplicationDatum[] = [];
  const cursor = new Date(start);
  const endKey = monthKey(now);
  while (monthKey(cursor) <= endKey) {
    const key = monthKey(cursor);
    points.push({ key, label: monthLabel(key), value: counts.get(key) ?? 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return points;
}

function reachedStatus(
  application: AnalyticsApplication,
  history: AnalyticsHistory[],
  statuses: readonly ApplicationStatus[],
) {
  return (
    statuses.includes(application.status) ||
    history.some((event) => statuses.includes(event.to_status))
  );
}

function normalizedSource(source: string) {
  const value = source.trim();
  return (
    APPLICATION_SOURCES.find(
      (knownSource) => knownSource.toLowerCase() === value.toLowerCase(),
    ) ?? value
  );
}

function sourceBreakdown(
  applications: AnalyticsApplication[],
): AnalyticsBarDatum[] {
  const counts = new Map<string, number>();
  for (const application of applications) {
    if (!application.source?.trim()) continue;
    const source = normalizedSource(application.source);
    counts.set(source, (counts.get(source) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  const sorted = [...counts.entries()].sort(
    ([leftLabel, left], [rightLabel, right]) =>
      right - left || leftLabel.localeCompare(rightLabel, "pt-BR"),
  );
  const visible = sorted.slice(0, 5);
  const remaining = sorted.slice(5).reduce((sum, [, value]) => sum + value, 0);
  if (remaining) visible.push(["Outras", remaining]);
  return visible.map(([label, value]) => ({
    key: label.toLowerCase(),
    label,
    value,
    percentage: percentage(value, total),
  }));
}

function salaryAverages(applications: AnalyticsApplication[]): SalaryAverage[] {
  const groups = new Map<string, number[]>();
  for (const application of applications) {
    const { salary_min: minimum, salary_max: maximum } = application;
    if (minimum === null && maximum === null) continue;
    const midpoint =
      minimum !== null && maximum !== null
        ? (minimum + maximum) / 2
        : (minimum ?? maximum)!;
    const values = groups.get(application.currency) ?? [];
    values.push(midpoint);
    groups.set(application.currency, values);
  }
  return [...groups.entries()]
    .map(([currency, values]) => ({
      currency,
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
      sampleSize: values.length,
    }))
    .sort((left, right) =>
      left.currency.localeCompare(right.currency, "pt-BR"),
    );
}

export function calculateAnalytics(
  allApplications: AnalyticsApplication[],
  allHistory: AnalyticsHistory[],
  allInterviews: AnalyticsInterview[],
  filters: AnalyticsFilters,
  now = new Date(),
): AnalyticsData {
  const companies = [
    ...new Map(
      allApplications.map((application) => [
        application.company.id,
        application.company,
      ]),
    ).values(),
  ].sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
  const companyId = companies.some(
    (company) => company.id === filters.companyId,
  )
    ? filters.companyId
    : "";
  const periodStart = startOfPeriod(filters, now);
  const applications = allApplications.filter((application) => {
    const createdAt = new Date(application.created_at);
    return (
      createdAt <= now &&
      (!periodStart || createdAt >= periodStart) &&
      (!companyId || application.company_id === companyId)
    );
  });
  const applicationIds = new Set(
    applications.map((application) => application.id),
  );
  const historyByApplication = new Map<string, AnalyticsHistory[]>();
  for (const event of allHistory) {
    if (!applicationIds.has(event.application_id)) continue;
    const events = historyByApplication.get(event.application_id) ?? [];
    events.push(event);
    historyByApplication.set(event.application_id, events);
  }
  const interviewsByApplication = new Map<string, AnalyticsInterview[]>();
  for (const interview of allInterviews) {
    if (!applicationIds.has(interview.application_id)) continue;
    const interviews =
      interviewsByApplication.get(interview.application_id) ?? [];
    interviews.push(interview);
    interviewsByApplication.set(interview.application_id, interviews);
  }

  const milestones = applications.map((application) => {
    const history = historyByApplication.get(application.id) ?? [];
    const interviews = interviewsByApplication.get(application.id) ?? [];
    const submitted =
      application.status !== "saved" ||
      history.some((event) => event.to_status !== "saved");
    const hired = reachedStatus(application, history, ["hired"]);
    const offer =
      hired || reachedStatus(application, history, OFFER_MILESTONE_STATUSES);
    const interview =
      offer ||
      interviews.length > 0 ||
      reachedStatus(application, history, INTERVIEW_MILESTONE_STATUSES);
    const response =
      interview || reachedStatus(application, history, RESPONSE_STATUSES);
    return {
      application,
      history,
      interviews,
      submitted,
      response,
      interview,
      offer,
      hired,
    };
  });
  const submitted = milestones.filter((item) => item.submitted);
  const responded = submitted.filter((item) => item.response);
  const interviewed = submitted.filter((item) => item.interview);
  const offered = submitted.filter((item) => item.offer);
  const hired = submitted.filter((item) => item.hired);

  const responseTimes = responded.flatMap((item) => {
    const responseEvents = item.history
      .filter((event) => RESPONSE_STATUS_SET.has(event.to_status))
      .map((event) => new Date(event.created_at).getTime());
    responseEvents.push(
      ...item.interviews.map((interview) =>
        new Date(interview.created_at).getTime(),
      ),
    );
    if (!responseEvents.length) return [];
    const baseline = item.application.applied_at
      ? new Date(`${item.application.applied_at}T00:00:00.000Z`).getTime()
      : new Date(item.application.created_at).getTime();
    const elapsed = Math.min(...responseEvents) - baseline;
    return elapsed >= 0 ? [elapsed / DAY_IN_MS] : [];
  });
  const averageResponseDays = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) /
      responseTimes.length
    : null;

  const funnelValues = [
    ["submitted", "Enviadas", submitted.length],
    ["response", "Com resposta", responded.length],
    ["interview", "Com entrevista", interviewed.length],
    ["offer", "Com proposta", offered.length],
    ["hired", "Contratadas", hired.length],
  ] as const;
  const funnel = funnelValues.map(([key, label, value]) => ({
    key,
    label,
    value,
    percentage: percentage(value, submitted.length),
  }));
  const statusBreakdown = APPLICATION_STATUSES.flatMap((status) => {
    const value = applications.filter(
      (application) => application.status === status,
    ).length;
    return value
      ? [
          {
            key: status,
            label: APPLICATION_STATUS_LABELS[status],
            value,
            percentage: percentage(value, applications.length),
          },
        ]
      : [];
  });
  const sourceCount = applications.filter((application) =>
    Boolean(application.source?.trim()),
  ).length;
  const salaryCount = applications.filter(
    (application) =>
      application.salary_min !== null || application.salary_max !== null,
  ).length;
  const appliedAtCount = applications.filter(
    (application) => application.applied_at !== null,
  ).length;
  const coverage: AnalyticsCoverageDatum[] = [
    {
      key: "source",
      label: "Fonte informada",
      value: percentage(sourceCount, applications.length),
      covered: sourceCount,
      total: applications.length,
    },
    {
      key: "salary",
      label: "Salário informado",
      value: percentage(salaryCount, applications.length),
      covered: salaryCount,
      total: applications.length,
    },
    {
      key: "applied_at",
      label: "Data de candidatura informada",
      value: percentage(appliedAtCount, applications.length),
      covered: appliedAtCount,
      total: applications.length,
    },
    {
      key: "response_time",
      label: "Tempo de resposta mensurável",
      value: percentage(responseTimes.length, responded.length),
      covered: responseTimes.length,
      total: responded.length,
    },
  ];

  return {
    metrics: [
      {
        key: "applications",
        label: "Candidaturas no período",
        value: String(applications.length),
        supportingText: "Registros criados no recorte selecionado",
      },
      {
        key: "response",
        label: "Taxa de resposta",
        value: rateLabel(responded.length, submitted.length),
        supportingText: `${responded.length} de ${submitted.length} candidaturas enviadas`,
      },
      {
        key: "interview",
        label: "Taxa de entrevista",
        value: rateLabel(interviewed.length, submitted.length),
        supportingText: `${interviewed.length} de ${submitted.length} candidaturas enviadas`,
      },
      {
        key: "offer",
        label: "Taxa de proposta",
        value: rateLabel(offered.length, submitted.length),
        supportingText: `${offered.length} de ${submitted.length} candidaturas enviadas`,
      },
      {
        key: "hired",
        label: "Taxa de contratação",
        value: rateLabel(hired.length, submitted.length),
        supportingText: `${hired.length} de ${submitted.length} candidaturas enviadas`,
      },
      {
        key: "response_time",
        label: "Tempo até a primeira resposta",
        value:
          averageResponseDays === null
            ? "—"
            : `${averageResponseDays.toFixed(1)} dias`,
        supportingText: `${responseTimes.length} ${responseTimes.length === 1 ? "processo mensurável" : "processos mensuráveis"}`,
      },
    ],
    monthlyApplications: buildMonthlyApplications(applications, filters, now),
    funnel,
    statusBreakdown,
    sourceBreakdown: sourceBreakdown(applications),
    salaryAverages: salaryAverages(applications),
    coverage,
    companies,
    totalApplications: applications.length,
    submittedApplications: submitted.length,
    periodLabel: ANALYTICS_PERIOD_LABELS[filters.period],
    generatedAt: now.toISOString(),
  };
}
