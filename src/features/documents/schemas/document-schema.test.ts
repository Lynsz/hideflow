import { describe, expect, it } from "vitest";

import {
  DOCX_MIME_TYPE,
  MAX_DOCUMENT_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "@/features/documents/constants";
import {
  documentFileSchema,
  documentMetadataSchema,
} from "@/features/documents/schemas/document-schema";

describe("documentMetadataSchema", () => {
  it("aceita tipo e nome opcional válidos", () => {
    expect(
      documentMetadataSchema.safeParse({
        documentType: "resume",
        name: "Currículo para frontend",
      }).success,
    ).toBe(true);
  });

  it("rejeita tipo não permitido", () => {
    expect(
      documentMetadataSchema.safeParse({
        documentType: "contract",
        name: "Contrato",
      }).success,
    ).toBe(false);
  });
});

describe("documentFileSchema", () => {
  it.each([
    ["curriculo.pdf", PDF_MIME_TYPE],
    ["desafio.docx", DOCX_MIME_TYPE],
  ])("aceita %s com MIME correspondente", (name, type) => {
    expect(
      documentFileSchema.safeParse({ name, type, size: 1024 }).success,
    ).toBe(true);
  });

  it("aceita exatamente o limite de 10 MiB", () => {
    expect(
      documentFileSchema.safeParse({
        name: "arquivo.pdf",
        type: PDF_MIME_TYPE,
        size: MAX_DOCUMENT_SIZE_BYTES,
      }).success,
    ).toBe(true);
  });

  it.each([
    ["arquivo vazio", 0, "arquivo.pdf", PDF_MIME_TYPE],
    [
      "arquivo acima do limite",
      MAX_DOCUMENT_SIZE_BYTES + 1,
      "arquivo.pdf",
      PDF_MIME_TYPE,
    ],
    ["MIME inválido", 1024, "arquivo.exe", "application/octet-stream"],
    ["extensão divergente", 1024, "arquivo.docx", PDF_MIME_TYPE],
  ])("rejeita %s", (_case, size, name, type) => {
    expect(documentFileSchema.safeParse({ name, type, size }).success).toBe(
      false,
    );
  });
});
