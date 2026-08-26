"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { weeklyReviewSchema } from "@/features/weekly-review/schemas/weekly-review-schema";
import { isValidReviewWeekStart } from "@/features/weekly-review/services/weekly-review-period";
import { saveWeeklyReviewRecord } from "@/features/weekly-review/services/weekly-review-service";
import type { WeeklyReviewActionResult } from "@/features/weekly-review/types/weekly-review";

export async function saveWeeklyReview(
  weekStart: string,
  input: unknown,
): Promise<WeeklyReviewActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  }

  const parsedInput = weeklyReviewSchema.safeParse(input);
  if (!isValidReviewWeekStart(weekStart) || !parsedInput.success) {
    return {
      success: false,
      message: "Revise os campos e a semana selecionada.",
    };
  }

  const result = await saveWeeklyReviewRecord(
    user.id,
    weekStart,
    parsedInput.data,
  );
  if (result === "error") {
    return {
      success: false,
      message: "Não foi possível salvar a revisão semanal.",
    };
  }

  revalidatePath("/dashboard/revisao-semanal");
  return { success: true, message: "Revisão semanal salva com sucesso." };
}
