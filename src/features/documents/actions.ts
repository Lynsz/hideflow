"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  applicationIdSchema,
  documentFileSchema,
  documentIdSchema,
  documentMetadataSchema,
  documentRenameSchema,
} from "@/features/documents/schemas/document-schema";
import { buildDocumentStoragePath } from "@/features/documents/services/document-path";
import {
  deleteDocumentRecord,
  getOwnedApplication,
  getOwnedDocument,
  insertDocument,
  renameDocumentRecord,
} from "@/features/documents/services/document-service";
import { hasValidDocumentSignature } from "@/features/documents/services/document-signature";
import {
  createDocumentSignedUrl,
  removeDocumentObjects,
  uploadDocumentObject,
} from "@/features/documents/services/document-storage-service";

export type DocumentActionResult = {
  success: boolean;
  message: string;
  url?: string;
};

function refreshApplication(applicationId: string) {
  revalidatePath(`/dashboard/candidaturas/${applicationId}`);
  revalidatePath("/dashboard/documentos");
}

export async function uploadDocument(
  applicationId: string,
  formData: FormData,
): Promise<DocumentActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsedApplicationId = applicationIdSchema.safeParse(applicationId);
  const file = formData.get("file");
  const metadata = documentMetadataSchema.safeParse({
    documentType: formData.get("documentType"),
    name: formData.get("name"),
  });
  if (!parsedApplicationId.success || !(file instanceof File)) {
    return { success: false, message: "Selecione um arquivo válido." };
  }
  if (!metadata.success) {
    return { success: false, message: "Revise os dados do documento." };
  }

  const validatedFile = documentFileSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });
  if (!validatedFile.success) {
    return {
      success: false,
      message: validatedFile.error.issues[0]?.message ?? "Arquivo inválido.",
    };
  }
  if (!(await hasValidDocumentSignature(file))) {
    return {
      success: false,
      message: "O conteúdo do arquivo não corresponde a um PDF ou DOCX válido.",
    };
  }

  const application = await getOwnedApplication(user.id, applicationId);
  if (application.error || !application.data) {
    return {
      success: false,
      message: "Candidatura não encontrada ou não autorizada.",
    };
  }

  const storagePath = buildDocumentStoragePath(
    user.id,
    applicationId,
    validatedFile.data.name,
  );
  const upload = await uploadDocumentObject(
    storagePath,
    file,
    validatedFile.data.type,
  );
  if (upload.error) {
    return { success: false, message: "Não foi possível enviar o arquivo." };
  }

  const inserted = await insertDocument(
    user.id,
    applicationId,
    metadata.data,
    validatedFile.data,
    storagePath,
  );
  if (inserted.error || !inserted.data) {
    const cleanup = await removeDocumentObjects([storagePath]);
    return {
      success: false,
      message: cleanup.error
        ? "Os metadados não foram salvos e a limpeza do arquivo falhou. Tente novamente ou contate o suporte."
        : "Não foi possível salvar os metadados do documento.",
    };
  }

  refreshApplication(applicationId);
  return { success: true, message: "Documento enviado com sucesso." };
}

export async function getDocumentAccessUrl(
  documentId: string,
  intent: "preview" | "download",
): Promise<DocumentActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  if (
    !documentIdSchema.safeParse(documentId).success ||
    !z.enum(["preview", "download"]).safeParse(intent).success
  ) {
    return { success: false, message: "Documento inválido." };
  }

  const document = await getOwnedDocument(user.id, documentId);
  if (document.error || !document.data) {
    return {
      success: false,
      message: "Documento não encontrado ou não autorizado.",
    };
  }

  const signed = await createDocumentSignedUrl(
    document.data.storage_path,
    intent === "download" ? document.data.original_name : undefined,
  );
  if (signed.error || !signed.data.signedUrl) {
    return {
      success: false,
      message: "Não foi possível gerar o acesso temporário ao documento.",
    };
  }

  return {
    success: true,
    message: "Acesso temporário gerado.",
    url: signed.data.signedUrl,
  };
}

export async function renameDocument(
  documentId: string,
  name: string,
): Promise<DocumentActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  const parsedId = documentIdSchema.safeParse(documentId);
  const parsedName = documentRenameSchema.safeParse(name);
  if (!parsedId.success || !parsedName.success) {
    return { success: false, message: "Informe um nome válido." };
  }

  const renamed = await renameDocumentRecord(
    user.id,
    documentId,
    parsedName.data,
  );
  if (renamed.error || !renamed.data) {
    return {
      success: false,
      message: "Documento não encontrado ou não autorizado.",
    };
  }
  refreshApplication(renamed.data.application_id);
  return { success: true, message: "Documento renomeado com sucesso." };
}

export async function deleteDocument(
  documentId: string,
): Promise<DocumentActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  if (!documentIdSchema.safeParse(documentId).success) {
    return { success: false, message: "Documento inválido." };
  }

  const document = await getOwnedDocument(user.id, documentId);
  if (document.error || !document.data) {
    return {
      success: false,
      message: "Documento não encontrado ou não autorizado.",
    };
  }
  const removed = await removeDocumentObjects([document.data.storage_path]);
  if (removed.error) {
    return {
      success: false,
      message:
        "Não foi possível remover o arquivo; os metadados foram preservados.",
    };
  }
  const deleted = await deleteDocumentRecord(user.id, documentId);
  if (deleted.error || !deleted.data) {
    return {
      success: false,
      message:
        "O arquivo foi removido, mas não foi possível excluir seus metadados.",
    };
  }

  refreshApplication(document.data.application_id);
  return { success: true, message: "Documento excluído com sucesso." };
}
