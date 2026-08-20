"use server";

import { revalidatePath } from "next/cache";

import {
  APPLICATION_IMPORT_ACCEPTED_MIME_TYPES,
  APPLICATION_IMPORT_MAX_FILE_SIZE_BYTES,
  APPLICATION_IMPORT_PREVIEW_ROWS,
} from "@/features/data-import/constants";
import { parseApplicationsCsv } from "@/features/data-import/services/csv-parser";
import { importApplicationRows } from "@/features/data-import/services/data-import-service";
import type {
  ApplicationImportActionResult,
  ApplicationImportParseResult,
  ApplicationImportPreview,
} from "@/features/data-import/types/data-import";
import { getCurrentUser } from "@/features/auth/services/get-current-user";

function buildPreview(
  result: ApplicationImportParseResult,
): ApplicationImportPreview {
  return {
    totalRows:
      result.rows.length +
      result.errors.filter(
        (error) => error.rowNumber !== null && error.rowNumber > 1,
      ).length,
    errorCount: result.errors.length,
    rows: result.rows.slice(0, APPLICATION_IMPORT_PREVIEW_ROWS).map((row) => ({
      rowNumber: row.rowNumber,
      companyName: row.companyName,
      jobTitle: row.jobTitle,
      status: row.status,
      technologyCount: row.technologies.length,
    })),
    errors: result.errors.slice(0, 10),
  };
}

async function parseFile(formData: FormData) {
  const entry = formData.get("file");
  if (!(entry instanceof File) || entry.size === 0) {
    return { error: "Selecione um arquivo CSV não vazio.", result: null };
  }
  if (!entry.name.toLowerCase().endsWith(".csv")) {
    return { error: "O arquivo deve usar a extensão .csv.", result: null };
  }
  if (
    entry.type &&
    !APPLICATION_IMPORT_ACCEPTED_MIME_TYPES.includes(
      entry.type as (typeof APPLICATION_IMPORT_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return { error: "O tipo do arquivo CSV não é aceito.", result: null };
  }
  if (entry.size > APPLICATION_IMPORT_MAX_FILE_SIZE_BYTES) {
    return { error: "O CSV deve ter no máximo 1 MiB.", result: null };
  }

  try {
    const content = new TextDecoder("utf-8", { fatal: true }).decode(
      await entry.arrayBuffer(),
    );
    return { error: null, result: parseApplicationsCsv(content) };
  } catch {
    return {
      error: "O arquivo deve usar codificação UTF-8 válida.",
      result: null,
    };
  }
}

export async function previewApplicationsCsv(
  formData: FormData,
): Promise<ApplicationImportActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  }

  const parsed = await parseFile(formData);
  if (parsed.error || !parsed.result) {
    return { success: false, message: parsed.error! };
  }

  const preview = buildPreview(parsed.result);
  if (parsed.result.errors.length) {
    return {
      success: false,
      message: `Corrija ${parsed.result.errors.length} problema(s) antes de importar.`,
      preview,
    };
  }

  return {
    success: true,
    message: `${parsed.result.rows.length} candidatura(s) pronta(s) para confirmação.`,
    preview,
  };
}

export async function importApplicationsCsv(
  formData: FormData,
): Promise<ApplicationImportActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  }

  const parsed = await parseFile(formData);
  if (parsed.error || !parsed.result) {
    return { success: false, message: parsed.error! };
  }
  if (parsed.result.errors.length || !parsed.result.rows.length) {
    return {
      success: false,
      message: "O arquivo mudou ou possui erros. Gere uma nova prévia.",
      preview: buildPreview(parsed.result),
    };
  }

  const { data, error } = await importApplicationRows(parsed.result.rows);
  if (error || !data) {
    return {
      success: false,
      message:
        "Não foi possível confirmar o resultado. Verifique a lista antes de tentar novamente; duplicatas serão ignoradas.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/busca");
  revalidatePath("/dashboard/candidaturas");
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard/kanban");
  revalidatePath("/dashboard/prioridades");

  return {
    success: true,
    message: `${data.imported} candidatura(s) importada(s); ${data.skipped} duplicada(s) ignorada(s).`,
    summary: data,
  };
}
