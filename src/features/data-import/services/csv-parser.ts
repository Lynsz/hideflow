import { z } from "zod";

import {
  APPLICATION_IMPORT_HEADERS,
  APPLICATION_IMPORT_MAX_ROWS,
  APPLICATION_IMPORT_MAX_TECHNOLOGIES,
} from "@/features/data-import/constants";
import type {
  ApplicationImportError,
  ApplicationImportParseResult,
  ApplicationImportRow,
} from "@/features/data-import/types/data-import";
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "@/features/applications/constants";
import { SUPPORTED_CURRENCIES } from "@/features/settings/constants";
import { normalizeTechnologyName } from "@/features/technologies/services/technology-normalizer";
import { isHttpUrl } from "@/lib/validation/url";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SPREADSHEET_PREFIX_PATTERN = /^\s*[=+\-@]/;

const rawRowSchema = z
  .object({
    companyName: z.string().trim().min(1).max(160),
    jobTitle: z.string().trim().min(1).max(180),
    status: z.enum(APPLICATION_STATUSES),
    workMode: z.enum(WORK_MODES).or(z.literal("")),
    employmentType: z.enum(EMPLOYMENT_TYPES).or(z.literal("")),
    location: z.string().trim().max(160),
    salaryMin: z.string().trim(),
    salaryMax: z.string().trim(),
    currency: z.enum(SUPPORTED_CURRENCIES),
    appliedAt: z.string().trim(),
    source: z.string().trim().max(120),
    jobUrl: z.string().trim().max(2048),
    technologies: z.string(),
  })
  .superRefine((value, context) => {
    for (const field of ["salaryMin", "salaryMax"] as const) {
      const salary = value[field];
      if (
        salary !== "" &&
        (!/^\d+(?:[.,]\d{1,2})?$/.test(salary) ||
          Number(salary.replace(",", ".")) > 999_999_999_999.99)
      ) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: "salário inválido",
        });
      }
    }

    if (value.appliedAt && !isValidIsoDate(value.appliedAt)) {
      context.addIssue({
        code: "custom",
        path: ["appliedAt"],
        message: "data da candidatura inválida",
      });
    }
    if (value.jobUrl && !isHttpUrl(value.jobUrl)) {
      context.addIssue({
        code: "custom",
        path: ["jobUrl"],
        message: "URL da vaga inválida",
      });
    }

    const minimum = parseOptionalSalary(value.salaryMin);
    const maximum = parseOptionalSalary(value.salaryMax);
    if (minimum !== null && maximum !== null && maximum < minimum) {
      context.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "salário máximo menor que o mínimo",
      });
    }
  });

function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function parseOptionalSalary(value: string) {
  return value === "" ? null : Number(value.replace(",", "."));
}

function decodeSpreadsheetCell(value: string) {
  return value.startsWith("'") &&
    SPREADSHEET_PREFIX_PATTERN.test(value.slice(1))
    ? value.slice(1)
    : value;
}

function parseCsvRecords(content: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  let closedQuote = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (quoted) {
      if (character === '"') {
        if (content[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
          closedQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (
      closedQuote &&
      character !== "," &&
      character !== "\n" &&
      character !== "\r"
    ) {
      throw new Error("Conteúdo inválido após o fechamento de uma célula.");
    }

    if (character === '"') {
      if (field.length > 0) throw new Error("Aspas inválidas no arquivo CSV.");
      quoted = true;
    } else if (character === ",") {
      record.push(field);
      field = "";
      closedQuote = false;
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && content[index + 1] === "\n") index += 1;
      record.push(field);
      if (record.some((value) => value.trim() !== "")) records.push(record);
      record = [];
      field = "";
      closedQuote = false;
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("O arquivo CSV termina com aspas abertas.");
  record.push(field);
  if (record.some((value) => value.trim() !== "")) records.push(record);
  return records;
}

function formatRowError(rowNumber: number, error: z.ZodError) {
  const issue = error.issues[0];
  const field = String(issue?.path[0] ?? "campo");
  return {
    rowNumber,
    message: `${field}: ${issue?.message ?? "valor inválido"}.`,
  };
}

function parseTechnologies(value: string) {
  const parts: string[] = [];
  let part = "";
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const next = value[index + 1];
    if (character === "\\" && (next === "\\" || next === "|")) {
      part += next;
      index += 1;
    } else if (character === "|") {
      parts.push(part);
      part = "";
    } else {
      part += character;
    }
  }
  parts.push(part);

  const technologies = parts
    .map((item) => normalizeTechnologyName(decodeSpreadsheetCell(item)))
    .filter((item) => item.name !== "");
  const unique = new Map<string, string>();
  for (const technology of technologies) {
    if (!unique.has(technology.normalizedName)) {
      unique.set(technology.normalizedName, technology.name);
    }
  }
  return [...unique.values()];
}

function toImportRow(
  values: z.infer<typeof rawRowSchema>,
  rowNumber: number,
): ApplicationImportRow {
  return {
    rowNumber,
    companyName: values.companyName,
    jobTitle: values.jobTitle,
    status: values.status,
    workMode: values.workMode || null,
    employmentType: values.employmentType || null,
    location: values.location || null,
    salaryMin: parseOptionalSalary(values.salaryMin),
    salaryMax: parseOptionalSalary(values.salaryMax),
    currency: values.currency,
    appliedAt: values.appliedAt || null,
    source: values.source || null,
    jobUrl: values.jobUrl || null,
    technologies: parseTechnologies(values.technologies),
  };
}

export function parseApplicationsCsv(
  content: string,
): ApplicationImportParseResult {
  let records: string[][];
  try {
    records = parseCsvRecords(content.replace(/^\uFEFF/, ""));
  } catch (error) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: null,
          message:
            error instanceof Error
              ? error.message
              : "O arquivo CSV é inválido.",
        },
      ],
    };
  }

  if (!records.length) {
    return {
      rows: [],
      errors: [{ rowNumber: null, message: "O arquivo CSV está vazio." }],
    };
  }

  const header = records[0].map((value) => value.trim());
  if (
    header.length !== APPLICATION_IMPORT_HEADERS.length ||
    header.some((value, index) => value !== APPLICATION_IMPORT_HEADERS[index])
  ) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 1,
          message:
            "O cabeçalho não corresponde ao CSV exportado pelo HireFlow.",
        },
      ],
    };
  }

  const sourceRows = records.slice(1);
  if (!sourceRows.length) {
    return {
      rows: [],
      errors: [{ rowNumber: null, message: "O CSV não possui candidaturas." }],
    };
  }
  if (sourceRows.length > APPLICATION_IMPORT_MAX_ROWS) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: null,
          message: `O CSV excede o limite de ${APPLICATION_IMPORT_MAX_ROWS} candidaturas.`,
        },
      ],
    };
  }

  const rows: ApplicationImportRow[] = [];
  const errors: ApplicationImportError[] = [];

  sourceRows.forEach((record, index) => {
    const rowNumber = index + 2;
    if (record.length !== APPLICATION_IMPORT_HEADERS.length) {
      errors.push({
        rowNumber,
        message: `Esperadas ${APPLICATION_IMPORT_HEADERS.length} colunas; recebidas ${record.length}.`,
      });
      return;
    }

    const decoded = record.map((value) => decodeSpreadsheetCell(value.trim()));
    const parsed = rawRowSchema.safeParse({
      companyName: decoded[1],
      jobTitle: decoded[2],
      status: decoded[3],
      workMode: decoded[4],
      employmentType: decoded[5],
      location: decoded[6],
      salaryMin: decoded[7],
      salaryMax: decoded[8],
      currency: decoded[9],
      appliedAt: decoded[10],
      source: decoded[11],
      jobUrl: decoded[12],
      technologies: decoded[13],
    });

    if (!parsed.success) {
      errors.push(formatRowError(rowNumber, parsed.error));
      return;
    }

    const technologies = parseTechnologies(parsed.data.technologies);
    if (
      technologies.length > APPLICATION_IMPORT_MAX_TECHNOLOGIES ||
      technologies.some((technology) => technology.length > 60)
    ) {
      errors.push({
        rowNumber,
        message: `Tecnologias: use até ${APPLICATION_IMPORT_MAX_TECHNOLOGIES} nomes com 60 caracteres cada.`,
      });
      return;
    }

    rows.push(toImportRow(parsed.data, rowNumber));
  });

  return { rows, errors };
}
