import {
  isDataExportFormat,
  type DataExportFormat,
} from "@/features/data-export/constants";
import {
  buildExportFilename,
  buildUserDataExport,
  serializeApplicationsCsv,
  serializeJsonExport,
} from "@/features/data-export/services/data-export-formatters";
import { getAuthenticatedUserDataExport } from "@/features/data-export/services/data-export-service";

export const dynamic = "force-dynamic";

const PRIVATE_DOWNLOAD_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
} as const;

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: PRIVATE_DOWNLOAD_HEADERS },
  );
}

function getContentType(format: DataExportFormat) {
  return format === "json"
    ? "application/json; charset=utf-8"
    : "text/csv; charset=utf-8";
}

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format");
  if (!isDataExportFormat(format)) {
    return errorResponse("Formato de exportação inválido.", 400);
  }

  try {
    const source = await getAuthenticatedUserDataExport();
    if (!source) return errorResponse("Autenticação necessária.", 401);

    const exportedAt = new Date().toISOString();
    const body =
      format === "json"
        ? serializeJsonExport(
            buildUserDataExport(source.email, source.snapshot, exportedAt),
          )
        : serializeApplicationsCsv(source.snapshot);

    return new Response(body, {
      headers: {
        ...PRIVATE_DOWNLOAD_HEADERS,
        "Content-Type": getContentType(format),
        "Content-Disposition": `attachment; filename="${buildExportFilename(format, exportedAt)}"`,
      },
    });
  } catch {
    return errorResponse("Não foi possível exportar os dados.", 500);
  }
}
