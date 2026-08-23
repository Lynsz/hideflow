"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { productivityGoalSchema } from "@/features/goals/schemas/goal-schema";
import { updateProductivityGoals } from "@/features/goals/services/goal-service";
import type { GoalActionResult } from "@/features/goals/types/goal";

export async function saveProductivityGoals(
  input: unknown,
): Promise<GoalActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  }

  const parsed = productivityGoalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Revise as metas informadas e tente novamente.",
    };
  }

  const { data, error } = await updateProductivityGoals(user.id, parsed.data);
  if (error || !data) {
    return { success: false, message: "Não foi possível salvar as metas." };
  }

  revalidatePath("/dashboard/metas");
  return { success: true, message: "Metas atualizadas com sucesso." };
}
