"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { interviewMutationSchema } from "@/features/interviews/schemas/interview-schema";
import {
  deleteInterviewRecord,
  insertInterview,
  updateInterviewRecord,
} from "@/features/interviews/services/interview-service";

export type InterviewActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};
function refresh(
  interviewId?: string,
  applicationId?: string,
  contactId?: string,
) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/entrevistas");
  if (interviewId) revalidatePath(`/dashboard/entrevistas/${interviewId}`);
  if (applicationId) revalidatePath(`/dashboard/candidaturas/${applicationId}`);
  if (contactId) revalidatePath(`/dashboard/contatos/${contactId}`);
}

export async function createInterview(
  input: unknown,
): Promise<InterviewActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  const parsed = interviewMutationSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os dados da entrevista." };
  const { data, error } = await insertInterview(user.id, parsed.data);
  if (error || !data)
    return {
      success: false,
      message:
        "Não foi possível criar a entrevista. Verifique a candidatura e o contato.",
    };
  refresh(data.id, parsed.data.applicationId, parsed.data.contactId);
  return {
    success: true,
    message: "Entrevista criada com sucesso.",
    redirectTo: `/dashboard/entrevistas/${data.id}?feedback=created`,
  };
}
export async function updateInterview(
  interviewId: string,
  input: unknown,
): Promise<InterviewActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  const parsed = interviewMutationSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os dados da entrevista." };
  const { data, error } = await updateInterviewRecord(
    user.id,
    interviewId,
    parsed.data,
  );
  if (error || !data)
    return {
      success: false,
      message:
        "Entrevista não encontrada, não autorizada ou contato incompatível.",
    };
  refresh(interviewId, parsed.data.applicationId, parsed.data.contactId);
  return {
    success: true,
    message:
      parsed.data.result === "scheduled"
        ? "Entrevista atualizada com sucesso."
        : "Resultado da entrevista atualizado.",
    redirectTo: `/dashboard/entrevistas/${interviewId}?feedback=${parsed.data.result === "scheduled" ? "updated" : "result"}`,
  };
}
export async function deleteInterview(
  interviewId: string,
  applicationId: string,
): Promise<InterviewActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  const { data, error } = await deleteInterviewRecord(user.id, interviewId);
  if (error || !data)
    return {
      success: false,
      message: "Entrevista não encontrada ou não autorizada.",
    };
  refresh(undefined, applicationId);
  return {
    success: true,
    message: "Entrevista excluída com sucesso.",
    redirectTo: "/dashboard/entrevistas?feedback=deleted",
  };
}
