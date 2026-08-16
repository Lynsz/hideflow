import { describe, expect, it } from "vitest";

import { DOCX_MIME_TYPE, PDF_MIME_TYPE } from "@/features/documents/constants";
import { hasValidDocumentSignature } from "@/features/documents/services/document-signature";

describe("document signatures", () => {
  it("reconhece o cabeçalho de PDF", async () => {
    const file = new File(["%PDF-1.7"], "curriculo.pdf", {
      type: PDF_MIME_TYPE,
    });
    await expect(hasValidDocumentSignature(file)).resolves.toBe(true);
  });

  it("reconhece o cabeçalho ZIP de DOCX", async () => {
    const file = new File(
      [new Uint8Array([0x50, 0x4b, 0x03, 0x04])],
      "cv.docx",
      {
        type: DOCX_MIME_TYPE,
      },
    );
    await expect(hasValidDocumentSignature(file)).resolves.toBe(true);
  });

  it("rejeita conteúdo disfarçado", async () => {
    const file = new File(["not a pdf"], "curriculo.pdf", {
      type: PDF_MIME_TYPE,
    });
    await expect(hasValidDocumentSignature(file)).resolves.toBe(false);
  });
});
