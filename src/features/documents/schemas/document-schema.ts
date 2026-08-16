import { z } from "zod";

import {
  DOCX_MIME_TYPE,
  DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "@/features/documents/constants";

const extensionByMime = {
  [PDF_MIME_TYPE]: "pdf",
  [DOCX_MIME_TYPE]: "docx",
} as const;

export const documentIdSchema = z.uuid();
export const applicationIdSchema = z.uuid();

export const documentMetadataSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES.map((item) => item.value)),
  name: z
    .string()
    .trim()
    .max(255, "Use no máximo 255 caracteres.")
    .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), "Nome inválido."),
});

export const documentRenameSchema = z
  .string()
  .trim()
  .min(1, "Informe um nome para o documento.")
  .max(255, "Use no máximo 255 caracteres.")
  .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), "Nome inválido.");

export const documentFileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .refine((value) => !/[\u0000-\u001f\u007f]/.test(value)),
    size: z
      .number()
      .int()
      .min(1, "O arquivo está vazio.")
      .max(MAX_DOCUMENT_SIZE_BYTES, "O arquivo deve ter no máximo 10 MiB."),
    type: z.enum([PDF_MIME_TYPE, DOCX_MIME_TYPE], {
      error: "Envie um arquivo PDF ou DOCX.",
    }),
  })
  .superRefine((file, context) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== extensionByMime[file.type]) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "A extensão do arquivo não corresponde ao seu formato.",
      });
    }
  });

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;
export type DocumentFileMetadata = z.infer<typeof documentFileSchema>;
