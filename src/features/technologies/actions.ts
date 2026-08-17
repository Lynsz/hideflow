"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  addApplicationTechnologySchema,
  removeApplicationTechnologySchema,
} from "@/features/technologies/schemas/technology-schema";
import {
  addTechnologyToApplication,
  removeTechnologyFromApplication,
} from "@/features/technologies/services/technology-service";

export type TechnologyActionResult = {
  success: boolean;
  message: string;
};

function refresh(applicationId: string) {
  revalidatePath(`/dashboard/candidaturas/${applicationId}`);
  revalidatePath("/dashboard/analytics");
}

export async function addApplicationTechnology(
  input: unknown,
): Promise<TechnologyActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = addApplicationTechnologySchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Informe uma tecnologia válida." };

  const result = await addTechnologyToApplication(
    user.id,
    parsed.data.applicationId,
    parsed.data.name,
  );

  if (result.outcome === "not_found")
    return { success: false, message: "Candidatura não encontrada." };
  if (result.outcome === "error")
    return {
      success: false,
      message: "Não foi possível vincular a tecnologia.",
    };

  refresh(parsed.data.applicationId);
  return {
    success: true,
    message:
      result.outcome === "exists"
        ? "Tecnologia já vinculada a esta candidatura."
        : "Tecnologia adicionada.",
  };
}

export async function removeApplicationTechnology(
  input: unknown,
): Promise<TechnologyActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = removeApplicationTechnologySchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Tecnologia inválida." };

  const { data, error } = await removeTechnologyFromApplication(
    user.id,
    parsed.data.applicationId,
    parsed.data.technologyId,
  );
  if (error || !data)
    return {
      success: false,
      message: "Tecnologia não encontrada ou não autorizada.",
    };

  refresh(parsed.data.applicationId);
  return { success: true, message: "Tecnologia removida." };
}
