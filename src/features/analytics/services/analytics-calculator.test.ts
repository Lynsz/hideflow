import { describe, expect, it } from "vitest";

import { calculateAnalytics } from "@/features/analytics/services/analytics-calculator";
import type {
  AnalyticsApplication,
  AnalyticsHistory,
  AnalyticsInterview,
  AnalyticsTechnologyLink,
} from "@/features/analytics/types/analytics";

const company = { id: "company-1", name: "Acme" };
const applications: AnalyticsApplication[] = [
  {
    id: "application-1",
    company_id: company.id,
    company,
    status: "technical_interview",
    source: "LinkedIn",
    salary_min: 8000,
    salary_max: 10000,
    currency: "BRL",
    applied_at: "2026-06-01",
    created_at: "2026-06-01T12:00:00.000Z",
  },
  {
    id: "application-2",
    company_id: company.id,
    company,
    status: "offer",
    source: "linkedin",
    salary_min: 10000,
    salary_max: null,
    currency: "BRL",
    applied_at: "2026-07-01",
    created_at: "2026-07-01T12:00:00.000Z",
  },
  {
    id: "application-3",
    company_id: company.id,
    company,
    status: "saved",
    source: null,
    salary_min: null,
    salary_max: null,
    currency: "BRL",
    applied_at: null,
    created_at: "2026-08-01T12:00:00.000Z",
  },
];
const history: AnalyticsHistory[] = [
  {
    application_id: "application-1",
    to_status: "screening",
    created_at: "2026-06-03T00:00:00.000Z",
  },
  {
    application_id: "application-2",
    to_status: "offer",
    created_at: "2026-07-11T00:00:00.000Z",
  },
];
const interviews: AnalyticsInterview[] = [
  {
    application_id: "application-1",
    created_at: "2026-06-05T00:00:00.000Z",
  },
];
const technologies: AnalyticsTechnologyLink[] = [
  {
    application_id: "application-1",
    technology: { id: "technology-react", name: "React" },
  },
  {
    application_id: "application-1",
    technology: { id: "technology-typescript", name: "TypeScript" },
  },
  {
    application_id: "application-2",
    technology: { id: "technology-react", name: "React" },
  },
  {
    application_id: "application-3",
    technology: { id: "technology-postgresql", name: "PostgreSQL" },
  },
];

describe("calculateAnalytics", () => {
  const data = calculateAnalytics(
    applications,
    history,
    interviews,
    technologies,
    { period: "3m", companyId: "" },
    new Date("2026-08-16T12:00:00.000Z"),
  );

  it("calcula taxas com candidaturas enviadas como denominador", () => {
    expect(data.submittedApplications).toBe(2);
    expect(data.metrics.map((metric) => [metric.key, metric.value])).toEqual([
      ["applications", "3"],
      ["response", "100%"],
      ["interview", "100%"],
      ["offer", "50%"],
      ["hired", "0%"],
      ["response_time", "6.0 dias"],
    ]);
  });

  it("mantém o funil monotônico mesmo quando uma etapa anterior não foi registrada", () => {
    expect(data.funnel.map((stage) => stage.value)).toEqual([2, 2, 2, 1, 0]);
  });

  it("preenche meses sem candidaturas e agrupa fontes sem diferenciar maiúsculas", () => {
    expect(data.monthlyApplications.map((month) => month.value)).toEqual([
      1, 1, 1,
    ]);
    expect(data.sourceBreakdown).toEqual([
      { key: "linkedin", label: "LinkedIn", value: 2, percentage: 100 },
    ]);
  });

  it("não mistura moedas no cálculo salarial", () => {
    expect(data.salaryAverages).toEqual([
      { currency: "BRL", average: 9500, sampleSize: 2 },
    ]);
  });

  it("ranqueia tecnologias estruturadas por candidatura", () => {
    expect(data.technologyBreakdown).toEqual([
      {
        key: "technology-react",
        label: "React",
        value: 2,
        percentage: 67,
      },
      {
        key: "technology-postgresql",
        label: "PostgreSQL",
        value: 1,
        percentage: 33,
      },
      {
        key: "technology-typescript",
        label: "TypeScript",
        value: 1,
        percentage: 33,
      },
    ]);
  });

  it("aplica o filtro de empresa também ao ranking de tecnologias", () => {
    const otherCompany = { id: "company-2", name: "Beta" };
    const filtered = calculateAnalytics(
      [
        applications[0],
        {
          ...applications[1],
          company_id: otherCompany.id,
          company: otherCompany,
        },
      ],
      [],
      [],
      [
        technologies[0],
        {
          application_id: "application-2",
          technology: { id: "technology-go", name: "Go" },
        },
      ],
      { period: "all", companyId: company.id },
      new Date("2026-08-16T12:00:00.000Z"),
    );

    expect(filtered.technologyBreakdown.map((item) => item.label)).toEqual([
      "React",
    ]);
  });

  it("expõe cobertura para interpretar métricas incompletas", () => {
    expect(data.coverage.map((item) => [item.key, item.value])).toEqual([
      ["source", 67],
      ["salary", 67],
      ["applied_at", 67],
      ["technologies", 100],
      ["response_time", 100],
    ]);
  });

  it("retorna taxas indisponíveis quando não existem candidaturas enviadas", () => {
    const emptyDenominator = calculateAnalytics(
      [applications[2]],
      [],
      [],
      [],
      { period: "all", companyId: "" },
      new Date("2026-08-16T12:00:00.000Z"),
    );
    expect(
      emptyDenominator.metrics.find((metric) => metric.key === "response")
        ?.value,
    ).toBe("—");
  });

  it("considera rejeição como resposta, mas não como entrevista", () => {
    const rejected = calculateAnalytics(
      [{ ...applications[2], id: "rejected", status: "rejected" }],
      [],
      [],
      [],
      { period: "all", companyId: "" },
      new Date("2026-08-16T12:00:00.000Z"),
    );
    expect(rejected.funnel.map((stage) => stage.value)).toEqual([
      1, 1, 0, 0, 0,
    ]);
  });

  it("faz uma contratação alcançar todos os marcos anteriores", () => {
    const hired = calculateAnalytics(
      [{ ...applications[2], id: "hired", status: "hired" }],
      [],
      [],
      [],
      { period: "all", companyId: "" },
      new Date("2026-08-16T12:00:00.000Z"),
    );
    expect(hired.funnel.map((stage) => stage.value)).toEqual([1, 1, 1, 1, 1]);
  });
});
