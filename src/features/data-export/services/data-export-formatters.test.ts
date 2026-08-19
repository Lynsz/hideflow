import { describe, expect, it } from "vitest";

import { isDataExportFormat } from "@/features/data-export/constants";
import {
  buildExportFilename,
  buildUserDataExport,
  encodeCsvCell,
  serializeApplicationsCsv,
  serializeJsonExport,
} from "@/features/data-export/services/data-export-formatters";
import type { UserDataSnapshot } from "@/features/data-export/types/data-export";

const snapshot: UserDataSnapshot = {
  profile: {
    id: "user-1",
    full_name: "Ana",
    avatar_url: null,
    default_currency: "BRL",
    analytics_period: "6m",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  companies: [
    {
      id: "company-1",
      user_id: "user-1",
      name: "Acme, Inc.",
      website: null,
      linkedin_url: null,
      location: null,
      notes: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  applications: [
    {
      id: "application-1",
      user_id: "user-1",
      company_id: "company-1",
      job_title: '=HYPERLINK("https://example.com")',
      job_url: "https://example.com/vaga",
      location: "São Paulo",
      work_mode: "hybrid",
      employment_type: "clt",
      salary_min: 8000,
      salary_max: 10000,
      currency: "BRL",
      applied_at: "2026-08-01",
      source: "Indicação",
      description: "Linha 1\nLinha 2",
      notes: null,
      status: "applied",
      archived_at: null,
      created_at: "2026-08-01T12:00:00.000Z",
      updated_at: "2026-08-02T12:00:00.000Z",
    },
  ],
  contacts: [],
  applicationContacts: [],
  interviews: [],
  interviewEvents: [],
  applicationHistory: [],
  documents: [],
  reminders: [],
  technologies: [
    {
      id: "technology-1",
      user_id: "user-1",
      name: "TypeScript",
      normalized_name: "typescript",
      created_at: "2026-08-01T00:00:00.000Z",
    },
    {
      id: "technology-2",
      user_id: "user-1",
      name: "React",
      normalized_name: "react",
      created_at: "2026-08-01T00:00:00.000Z",
    },
  ],
  applicationTechnologies: [
    {
      application_id: "application-1",
      technology_id: "technology-1",
      user_id: "user-1",
      created_at: "2026-08-01T00:00:00.000Z",
    },
    {
      application_id: "application-1",
      technology_id: "technology-2",
      user_id: "user-1",
      created_at: "2026-08-01T00:00:00.000Z",
    },
  ],
  applicationActivities: [],
  applicationOffers: [],
};

describe("isDataExportFormat", () => {
  it("aceita somente os formatos públicos suportados", () => {
    expect(isDataExportFormat("json")).toBe(true);
    expect(isDataExportFormat("csv")).toBe(true);
    expect(isDataExportFormat("xlsx")).toBe(false);
    expect(isDataExportFormat(null)).toBe(false);
  });
});

describe("encodeCsvCell", () => {
  it("escapa aspas, vírgulas e quebras de linha", () => {
    expect(encodeCsvCell('Produto, "Sênior"\nRemoto')).toBe(
      '"Produto, ""Sênior""\nRemoto"',
    );
  });

  it.each(["=SUM(A1:A2)", "+1+1", "-2+3", "@comando", "  =1+1"])(
    "neutraliza fórmulas de planilha em %s",
    (value) => {
      expect(encodeCsvCell(value)).toBe(`"'${value}"`);
    },
  );
});

describe("export formatters", () => {
  it("gera backup JSON versionado e legível", () => {
    const result = buildUserDataExport(
      "ana@example.com",
      snapshot,
      "2026-08-18T12:00:00.000Z",
    );
    const parsed = JSON.parse(serializeJsonExport(result));

    expect(parsed.schemaVersion).toBe(4);
    expect(parsed.account.email).toBe("ana@example.com");
    expect(parsed.data.applications).toHaveLength(1);
  });

  it("gera CSV UTF-8 com empresa, tecnologias ordenadas e fórmula neutralizada", () => {
    const csv = serializeApplicationsCsv(snapshot);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Acme, Inc."');
    expect(csv).toContain('"React | TypeScript"');
    expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")"');
  });

  it("gera nomes previsíveis sem dados pessoais", () => {
    expect(buildExportFilename("json", "2026-08-18T12:00:00.000Z")).toBe(
      "hireflow-backup-2026-08-18.json",
    );
    expect(buildExportFilename("csv", "2026-08-18T12:00:00.000Z")).toBe(
      "hireflow-candidaturas-2026-08-18.csv",
    );
  });
});
