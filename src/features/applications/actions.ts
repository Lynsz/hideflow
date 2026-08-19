"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  applicationSchema,
  applicationArchiveSchema,
  statusUpdateSchema,
} from "@/features/applications/schemas/application-schema";
import {
  deleteApplicationRecord,
  insertApplication,
  updateApplicationRecord,
  updateApplicationStatusRecord,
  setApplicationArchived,
} from "@/features/applications/services/application-service";
import { getApplicationDocumentPaths } from "@/features/documents/services/document-service";
import { removeDocumentObjects } from "@/features/documents/services/document-storage-service";
import type { ApplicationStatus } from "@/types/database";

export type ApplicationActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
  changed?: boolean;
  currentStatus?: ApplicationStatus;
  archived?: boolean;
};

const INVALID_APPLICATION = "Revise os dados da candidatura e tente novamente.";

export async function createApplication(
  input: unknown,
): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: INVALID_APPLICATION };

  const { data, error } = await insertApplication(user.id, parsed.data);
  if (error || !data)
    return { success: false, message: "Não foi possível criar a candidatura." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidaturas");
  revalidatePath("/dashboard/kanban");
  return {
    success: true,
    message: "Candidatura criada com sucesso.",
    redirectTo: `/dashboard/candidaturas/${data.id}?feedback=created`,
  };
}

export async function changeApplicationArchive(
  input: unknown,
): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = applicationArchiveSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Candidatura inválida." };

  const result = await setApplicationArchived(
    user.id,
    parsed.data.applicationId,
    parsed.data.archived,
  );
  if (result.outcome === "error") {
    return { success: false, message: "Não foi possível atualizar o arquivo." };
  }
  if (result.outcome === "not_found") {
    return {
      success: false,
      message: "Candidatura não encontrada ou não autorizada.",
    };
  }
  if (result.outcome === "unchanged") {
    return {
      success: true,
      changed: false,
      archived: result.archived,
      message: result.archived
        ? "A candidatura já estava arquivada."
        : "A candidatura já estava ativa.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidaturas");
  revalidatePath("/dashboard/kanban");
  revalidatePath("/dashboard/busca");
  revalidatePath(`/dashboard/candidaturas/${parsed.data.applicationId}`);
  return {
    success: true,
    changed: true,
    archived: result.archived,
    message: result.archived
      ? "Candidatura arquivada com sucesso."
      : "Candidatura restaurada com sucesso.",
    redirectTo: result.archived
      ? "/dashboard/candidaturas?feedback=archived"
      : "/dashboard/candidaturas?feedback=restored",
  };
}

export async function updateApplication(
  applicationId: string,
  input: unknown,
): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: INVALID_APPLICATION };

  const { data, error } = await updateApplicationRecord(
    user.id,
    applicationId,
    parsed.data,
  );
  if (error || !data) {
    return {
      success: false,
      message: "Candidatura não encontrada ou não autorizada.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidaturas");
  revalidatePath("/dashboard/kanban");
  revalidatePath(`/dashboard/candidaturas/${applicationId}`);
  return {
    success: true,
    message: "Candidatura atualizada com sucesso.",
    redirectTo: `/dashboard/candidaturas/${applicationId}?feedback=updated`,
  };
}

export async function changeApplicationStatus(
  input: unknown,
): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = statusUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Status inválido." };

  if (parsed.data.previousStatus === parsed.data.status) {
    return {
      success: true,
      changed: false,
      currentStatus: parsed.data.status,
      message: "A candidatura já está nesse status.",
    };
  }

  const result = await updateApplicationStatusRecord(
    user.id,
    parsed.data.applicationId,
    parsed.data.previousStatus,
    parsed.data.status,
  );
  if (result.outcome === "error") {
    return { success: false, message: "Não foi possível alterar o status." };
  }
  if (result.outcome === "not_found") {
    return {
      success: false,
      message: "Candidatura não encontrada ou não autorizada.",
    };
  }
  if (result.outcome === "conflict") {
    return {
      success: false,
      currentStatus: result.status,
      message:
        "Esta candidatura foi alterada em outra aba. Atualize a página e tente novamente.",
    };
  }

  if (result.outcome === "unchanged") {
    return {
      success: true,
      changed: false,
      currentStatus: result.status,
      message: "O status já estava atualizado.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidaturas");
  revalidatePath("/dashboard/kanban");
  revalidatePath(`/dashboard/candidaturas/${parsed.data.applicationId}`);
  return {
    success: true,
    changed: true,
    currentStatus: result.status,
    message: "Status atualizado com sucesso.",
  };
}

export async function deleteApplication(
  applicationId: string,
): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const documents = await getApplicationDocumentPaths(user.id, applicationId);
  if (documents.error) {
    return {
      success: false,
      message: "Não foi possível verificar os documentos da candidatura.",
    };
  }
  const storageRemoval = await removeDocumentObjects(
    documents.data.map((document) => document.storage_path),
  );
  if (storageRemoval.error) {
    return {
      success: false,
      message:
        "Não foi possível remover os documentos; a candidatura foi preservada.",
    };
  }

  const { data, error } = await deleteApplicationRecord(user.id, applicationId);
  if (error || !data) {
    return {
      success: false,
      message: documents.data.length
        ? "Os arquivos foram removidos, mas não foi possível excluir a candidatura."
        : "Candidatura não encontrada ou não autorizada.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidaturas");
  revalidatePath("/dashboard/kanban");
  return {
    success: true,
    message: "Candidatura excluída com sucesso.",
    redirectTo: "/dashboard/candidaturas?feedback=deleted",
  };
}
