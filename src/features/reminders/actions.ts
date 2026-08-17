"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { reminderMutationSchema } from "@/features/reminders/schemas/reminder-schema";
import {
  deleteReminderRecord,
  insertReminder,
  setReminderCompletion,
  updateReminderRecord,
} from "@/features/reminders/services/reminder-service";

export type ReminderActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

function refresh(applicationId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/lembretes");
  if (applicationId) revalidatePath(`/dashboard/candidaturas/${applicationId}`);
}

export async function createReminder(
  input: unknown,
): Promise<ReminderActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = reminderMutationSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os dados do lembrete." };

  const { data, error } = await insertReminder(user.id, parsed.data);
  if (error || !data)
    return {
      success: false,
      message: "Não foi possível criar o lembrete. Verifique a candidatura.",
    };

  refresh(data.application_id);
  return {
    success: true,
    message: "Lembrete criado com sucesso.",
    redirectTo: "/dashboard/lembretes?feedback=created",
  };
}

export async function updateReminder(
  reminderId: string,
  input: unknown,
): Promise<ReminderActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = reminderMutationSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os dados do lembrete." };

  const { data, error } = await updateReminderRecord(
    user.id,
    reminderId,
    parsed.data,
  );
  if (error || !data)
    return {
      success: false,
      message: "Lembrete não encontrado ou não autorizado.",
    };

  refresh(data.application_id);
  return {
    success: true,
    message: "Lembrete atualizado com sucesso.",
    redirectTo: "/dashboard/lembretes?feedback=updated",
  };
}

export async function toggleReminder(
  reminderId: string,
  completed: boolean,
): Promise<ReminderActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const { data, error } = await setReminderCompletion(
    user.id,
    reminderId,
    completed,
  );
  if (error || !data)
    return {
      success: false,
      message: "Lembrete não encontrado ou não autorizado.",
    };

  refresh(data.application_id);
  return {
    success: true,
    message: completed ? "Lembrete concluído." : "Lembrete reaberto.",
  };
}

export async function deleteReminder(
  reminderId: string,
): Promise<ReminderActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const { data, error } = await deleteReminderRecord(user.id, reminderId);
  if (error || !data)
    return {
      success: false,
      message: "Lembrete não encontrado ou não autorizado.",
    };

  refresh(data.application_id);
  return {
    success: true,
    message: "Lembrete excluído com sucesso.",
    redirectTo: "/dashboard/lembretes?feedback=deleted",
  };
}
