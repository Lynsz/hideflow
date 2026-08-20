import "server-only";

import { z } from "zod";

import type { ApplicationImportRow } from "@/features/data-import/types/data-import";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const importSummarySchema = z.object({
  imported: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  companiesCreated: z.number().int().nonnegative(),
  technologiesLinked: z.number().int().nonnegative(),
});

export async function importApplicationRows(rows: ApplicationImportRow[]) {
  const supabase = await createClient();
  const payload = rows.map((row) => ({
    companyName: row.companyName,
    jobTitle: row.jobTitle,
    status: row.status,
    workMode: row.workMode,
    employmentType: row.employmentType,
    location: row.location,
    salaryMin: row.salaryMin,
    salaryMax: row.salaryMax,
    currency: row.currency,
    appliedAt: row.appliedAt,
    source: row.source,
    jobUrl: row.jobUrl,
    technologies: row.technologies,
  }));
  const { data, error } = await supabase.rpc("import_applications_csv", {
    p_rows: payload as unknown as Json,
  });

  if (error) return { data: null, error };
  const parsed = importSummarySchema.safeParse(data);
  if (!parsed.success) {
    return {
      data: null,
      error: new Error("A importação retornou um resultado inválido."),
    };
  }
  return { data: parsed.data, error: null };
}
