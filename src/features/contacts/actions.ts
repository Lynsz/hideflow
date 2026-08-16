"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  contactLinkSchema,
  contactSchema,
} from "@/features/contacts/schemas/contact-schema";
import {
  deleteContactRecord,
  insertContact,
  linkContactRecord,
  unlinkContactRecord,
  updateContactRecord,
} from "@/features/contacts/services/contact-service";

export type ContactActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

export async function createContact(
  input: unknown,
): Promise<ContactActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os dados do contato." };
  const { data, error } = await insertContact(user.id, parsed.data);
  if (error || !data)
    return {
      success: false,
      message: "Não foi possível criar o contato. Verifique a empresa.",
    };
  revalidatePath("/dashboard/contatos");
  revalidatePath("/dashboard/empresas");
  return {
    success: true,
    message: "Contato criado com sucesso.",
    redirectTo: `/dashboard/contatos/${data.id}?feedback=created`,
  };
}

export async function updateContact(
  contactId: string,
  input: unknown,
): Promise<ContactActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os dados do contato." };
  const { data, error } = await updateContactRecord(
    user.id,
    contactId,
    parsed.data,
  );
  if (error || !data)
    return {
      success: false,
      message:
        error?.code === "23514"
          ? "Desvincule o contato de candidaturas e entrevistas antes de alterar a empresa."
          : "Contato não encontrado ou não autorizado.",
    };
  revalidatePath("/dashboard/contatos");
  revalidatePath("/dashboard/empresas");
  revalidatePath("/dashboard/candidaturas");
  return {
    success: true,
    message: "Contato atualizado com sucesso.",
    redirectTo: `/dashboard/contatos/${contactId}?feedback=updated`,
  };
}

export async function deleteContact(
  contactId: string,
): Promise<ContactActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  const { data, error } = await deleteContactRecord(user.id, contactId);
  if (error || !data)
    return {
      success: false,
      message: "Contato não encontrado ou não autorizado.",
    };
  revalidatePath("/dashboard/contatos");
  revalidatePath("/dashboard/empresas");
  revalidatePath("/dashboard/candidaturas");
  revalidatePath("/dashboard/entrevistas");
  return {
    success: true,
    message: "Contato excluído com sucesso.",
    redirectTo: "/dashboard/contatos?feedback=deleted",
  };
}

export async function setApplicationContact(
  input: unknown,
  linked: boolean,
): Promise<ContactActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };
  const parsed = contactLinkSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Vínculo inválido." };
  const result = linked
    ? await linkContactRecord(
        user.id,
        parsed.data.applicationId,
        parsed.data.contactId,
      )
    : await unlinkContactRecord(
        user.id,
        parsed.data.applicationId,
        parsed.data.contactId,
      );
  if (result.error)
    return {
      success: false,
      message: linked
        ? "Selecione um contato da mesma empresa."
        : "Não foi possível remover o contato.",
    };
  revalidatePath(`/dashboard/candidaturas/${parsed.data.applicationId}`);
  return {
    success: true,
    message: linked ? "Contato associado." : "Contato removido da candidatura.",
  };
}
