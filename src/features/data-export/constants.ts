export const DATA_EXPORT_SCHEMA_VERSION = 6;
export const DATA_EXPORT_PAGE_SIZE = 500;

export const DATA_EXPORT_FORMATS = ["json", "csv"] as const;
export type DataExportFormat = (typeof DATA_EXPORT_FORMATS)[number];

export function isDataExportFormat(
  value: string | null,
): value is DataExportFormat {
  return DATA_EXPORT_FORMATS.includes(value as DataExportFormat);
}
