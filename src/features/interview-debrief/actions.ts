"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { interviewDebriefSchema } from "@/features/interview-debrief/schemas/interview-debrief-schema";
import { saveInterviewDebriefRecord } from "@/features/interview-debrief/services/interview-debrief-service";
import type { InterviewDebriefActionResult } from "@/features/interview-debrief/types/interview-debrief";

const interviewIdSchema = z.uuid();

export async function saveInterviewDebrief(
  interviewId: string,
  input: unknown,
): Promise<InterviewDebriefActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  }

  const parsedId = interviewIdSchema.safeParse(interviewId);
  const parsedInput = interviewDebriefSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    return {
      success: false,
      message: "Revise os campos da retrospectiva e tente novamente.",
    };
  }

  const result = await saveInterviewDebriefRecord(
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
    return {
      success: false,
      message: "Não foi possível salvar a retrospectiva.",
    };
  }

  revalidatePath(`/dashboard/entrevistas/${parsedId.data}/retrospectiva`);
  revalidatePath(`/dashboard/candidaturas/${result.applicationId}`);
  return { success: true, message: "Retrospectiva salva com sucesso." };
}
