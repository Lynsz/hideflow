"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  applicationSchema,
  statusUpdateSchema,
} from "@/features/applications/schemas/application-schema";
import {
  deleteApplicationRecord,
  insertApplication,
  updateApplicationRecord,
  updateApplicationStatusRecord,
} from "@/features/applications/services/application-service";

export type ApplicationActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
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
  return {
    success: true,
    message: "Candidatura criada com sucesso.",
    redirectTo: `/dashboard/candidaturas/${data.id}?feedback=created`,
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

  const { error } = await updateApplicationStatusRecord(
    user.id,
    parsed.data.applicationId,
    parsed.data.status,
  );
  if (error)
    return { success: false, message: "Não foi possível alterar o status." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidaturas");
  revalidatePath(`/dashboard/candidaturas/${parsed.data.applicationId}`);
  return { success: true, message: "Status atualizado com sucesso." };
}

export async function deleteApplication(
  applicationId: string,
): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const { data, error } = await deleteApplicationRecord(user.id, applicationId);
  if (error || !data) {
    return {
      success: false,
      message: "Candidatura não encontrada ou não autorizada.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidaturas");
  return {
    success: true,
    message: "Candidatura excluída com sucesso.",
    redirectTo: "/dashboard/candidaturas?feedback=deleted",
  };
}
