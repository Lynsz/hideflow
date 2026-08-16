import { describe, expect, it } from "vitest";

import {
  buildDocumentStoragePath,
  sanitizeDocumentFilename,
} from "@/features/documents/services/document-path";

describe("document storage path", () => {
  it("remove diretórios e normaliza caracteres perigosos", () => {
    expect(sanitizeDocumentFilename("../Cúrriculo Final (1).PDF")).toBe(
      "curriculo-final-1.pdf",
    );
  });

  it("usa somente segmentos definidos no servidor", () => {
    expect(
      buildDocumentStoragePath(
        "user-id",
        "application-id",
        "Desafio Técnico.docx",
        "object-id",
      ),
    ).toBe("user-id/application-id/object-id-desafio-tecnico.docx");
  });

  it("gera uma chave nova para cada upload", () => {
    const first = buildDocumentStoragePath("user", "application", "cv.pdf");
    const second = buildDocumentStoragePath("user", "application", "cv.pdf");
    expect(first).not.toBe(second);
  });
});
