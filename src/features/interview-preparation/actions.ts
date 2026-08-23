"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { interviewPreparationSchema } from "@/features/interview-preparation/schemas/interview-preparation-schema";
import { saveInterviewPreparationRecord } from "@/features/interview-preparation/services/interview-preparation-service";
import type { InterviewPreparationActionResult } from "@/features/interview-preparation/types/interview-preparation";

const interviewIdSchema = z.uuid();

export async function saveInterviewPreparation(
  interviewId: string,
  input: unknown,
): Promise<InterviewPreparationActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  }

  const parsedId = interviewIdSchema.safeParse(interviewId);
  const parsedInput = interviewPreparationSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    return {
      success: false,
      message: "Revise os campos da preparação e tente novamente.",
    };
  }

  const result = await saveInterviewPreparationRecord(
    user.id,
    parsedId.data,
    parsedInput.data,
  );
  if (result.status === "not_found") {
    return {
      success: false,
      message: "Entrevista não encontrada ou não autorizada.",
    };
  }
  if (result.status === "error") {
    return { success: false, message: "Não foi possível salvar a preparação." };
  }

  revalidatePath(`/dashboard/entrevistas/${parsedId.data}/preparacao`);
  revalidatePath(`/dashboard/candidaturas/${result.applicationId}`);
  return { success: true, message: "Preparação salva com sucesso." };
}
