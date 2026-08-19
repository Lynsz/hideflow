"use server";

import { revalidatePath } from "next/cache";

import {
  activityDeleteSchema,
  activityMutationSchema,
} from "@/features/activities/schemas/activity-schema";
import {
  deleteActivityRecord,
  insertActivity,
} from "@/features/activities/services/activity-service";
import { getCurrentUser } from "@/features/auth/services/get-current-user";

export type ActivityActionResult = {
  success: boolean;
  message: string;
};

function refresh(applicationId: string) {
  revalidatePath(`/dashboard/candidaturas/${applicationId}`);
  revalidatePath("/dashboard/busca");
}

export async function createActivity(
  input: unknown,
): Promise<ActivityActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = activityMutationSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os dados da interação." };

  const { data, error } = await insertActivity(user.id, parsed.data);
  if (error || !data)
    return {
      success: false,
      message: "Não foi possível registrar a interação nesta candidatura.",
    };

  refresh(data.application_id);
  return { success: true, message: "Interação registrada com sucesso." };
}

export async function deleteActivity(
  input: unknown,
): Promise<ActivityActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = activityDeleteSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Interação inválida." };

  const { data, error } = await deleteActivityRecord(
    user.id,
    parsed.data.activityId,
    parsed.data.applicationId,
  );
  if (error || !data)
    return {
      success: false,
      message: "Interação não encontrada ou não autorizada.",
    };

  refresh(data.application_id);
  return { success: true, message: "Interação excluída com sucesso." };
}
