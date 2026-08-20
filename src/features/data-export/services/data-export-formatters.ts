import { DATA_EXPORT_SCHEMA_VERSION } from "@/features/data-export/constants";
import type {
  UserDataExport,
  UserDataSnapshot,
} from "@/features/data-export/types/data-export";

const CSV_HEADERS = [
  "id",
  "empresa",
  "vaga",
  "status",
  "modalidade",
  "contrato",
  "localizacao",
  "salario_minimo",
  "salario_maximo",
  "moeda",
  "data_candidatura",
  "fonte",
  "url",
  "tecnologias",
  "criada_em",
  "atualizada_em",
] as const;

function protectSpreadsheetCell(value: string) {
  return /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
}

export function encodeCsvCell(value: unknown) {
  const text = protectSpreadsheetCell(value == null ? "" : String(value));
  return `"${text.replaceAll('"', '""')}"`;
}

export function encodeTechnologyList(names: string[]) {
  return names
    .map((name) => name.replaceAll("\\", "\\\\").replaceAll("|", "\\|"))
    .join(" | ");
}

export function buildUserDataExport(
  email: string,
  snapshot: UserDataSnapshot,
  exportedAt: string,
): UserDataExport {
  return {
    schemaVersion: DATA_EXPORT_SCHEMA_VERSION,
    exportedAt,
    account: { email },
    data: snapshot,
  };
}

export function serializeJsonExport(data: UserDataExport) {
  return JSON.stringify(data, null, 2);
}

export function serializeApplicationsCsv(snapshot: UserDataSnapshot) {
  const companies = new Map(
    snapshot.companies.map((company) => [company.id, company.name]),
  );
  const technologies = new Map(
    snapshot.technologies.map((technology) => [technology.id, technology.name]),
  );
  const applicationTechnologies = new Map<string, string[]>();

  for (const link of snapshot.applicationTechnologies) {
    const name = technologies.get(link.technology_id);
    if (!name) continue;
    const names = applicationTechnologies.get(link.application_id) ?? [];
    names.push(name);
    applicationTechnologies.set(link.application_id, names);
  }

  const rows = snapshot.applications.map((application) => [
    application.id,
    companies.get(application.company_id) ?? "",
    application.job_title,
    application.status,
    application.work_mode,
    application.employment_type,
    application.location,
    application.salary_min,
    application.salary_max,
    application.currency,
    application.applied_at,
    application.source,
    application.job_url,
    encodeTechnologyList(
      (applicationTechnologies.get(application.id) ?? []).toSorted(
        (left, right) => left.localeCompare(right, "pt-BR"),
      ),
    ),
    application.created_at,
    application.updated_at,
  ]);

  return `\uFEFF${[CSV_HEADERS, ...rows]
    .map((row) => row.map(encodeCsvCell).join(","))
    .join("\r\n")}`;
}

export function buildExportFilename(
  format: "json" | "csv",
  exportedAt: string,
) {
  const date = exportedAt.slice(0, 10);
  const label = format === "json" ? "backup" : "candidaturas";
  return `hireflow-${label}-${date}.${format}`;
}
