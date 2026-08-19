"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  offerDeleteSchema,
  offerSchema,
} from "@/features/offers/schemas/offer-schema";
import {
  deleteOfferRecord,
  saveOfferRecord,
} from "@/features/offers/services/offer-service";

export type OfferActionResult = { success: boolean; message: string };

function refresh(applicationId: string) {
  revalidatePath("/dashboard/ofertas");
  revalidatePath("/dashboard/busca");
  revalidatePath(`/dashboard/candidaturas/${applicationId}`);
}

export async function saveOffer(input: unknown): Promise<OfferActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = offerSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os dados da proposta." };

  const { data, error } = await saveOfferRecord(user.id, parsed.data);
  if (error || !data)
    return {
      success: false,
      message: "Não foi possível salvar a proposta nesta candidatura.",
    };

  refresh(data.application_id);
  return { success: true, message: "Proposta salva com sucesso." };
}

export async function deleteOffer(input: unknown): Promise<OfferActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = offerDeleteSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Candidatura inválida." };

  const { data, error } = await deleteOfferRecord(
    user.id,
    parsed.data.applicationId,
  );
  if (error || !data)
    return {
      success: false,
      message: "Proposta não encontrada ou não autorizada.",
    };

  refresh(data.application_id);
  return { success: true, message: "Proposta excluída com sucesso." };
}
