import type { DocumentType } from "@/types/database";

export const DOCUMENT_BUCKET = "application-documents";
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const SIGNED_URL_TTL_SECONDS = 60;

export const PDF_MIME_TYPE = "application/pdf";
export const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const DOCUMENT_TYPES = [
  { value: "resume", label: "Currículo" },
  { value: "cover_letter", label: "Carta de apresentação" },
  { value: "technical_challenge", label: "Desafio técnico" },
  { value: "portfolio", label: "Portfólio" },
  { value: "certificate", label: "Certificado" },
  { value: "other", label: "Outro" },
] as const satisfies ReadonlyArray<{ value: DocumentType; label: string }>;

export const DOCUMENT_ACCEPT = ".pdf,.docx";

export function formatDocumentType(value: DocumentType) {
  return DOCUMENT_TYPES.find((item) => item.value === value)?.label ?? value;
}
