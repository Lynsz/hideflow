"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { companySchema } from "@/features/companies/schemas/company-schema";
import {
  deleteCompanyRecord,
  insertCompany,
  updateCompanyRecord,
} from "@/features/companies/services/company-service";

export type CompanyActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

const INVALID_COMPANY = "Revise os dados da empresa e tente novamente.";

export async function createCompany(
  input: unknown,
): Promise<CompanyActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { success: false, message: INVALID_COMPANY };

  const { error } = await insertCompany(user.id, parsed.data);
  if (error)
    return { success: false, message: "Não foi possível criar a empresa." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/empresas");
  return {
    success: true,
    message: "Empresa criada com sucesso.",
    redirectTo: "/dashboard/empresas?feedback=created",
  };
}

export async function updateCompany(
  companyId: string,
  input: unknown,
): Promise<CompanyActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const parsedId = companySchema.safeParse(input);
  if (!parsedId.success) return { success: false, message: INVALID_COMPANY };

  const { data, error } = await updateCompanyRecord(
    user.id,
    companyId,
    parsedId.data,
  );
  if (error || !data)
    return {
      success: false,
      message: "Empresa não encontrada ou não autorizada.",
    };

  revalidatePath("/dashboard/empresas");
  revalidatePath("/dashboard/candidaturas");
  return {
    success: true,
    message: "Empresa atualizada com sucesso.",
    redirectTo: "/dashboard/empresas?feedback=updated",
  };
}

export async function deleteCompany(
  companyId: string,
): Promise<CompanyActionResult> {
  const user = await getCurrentUser();
  if (!user)
    return { success: false, message: "Sua sessão expirou. Entre novamente." };

  const result = await deleteCompanyRecord(user.id, companyId);
  if (result.blocked) {
    return {
      success: false,
      message:
        "Esta empresa possui candidaturas vinculadas e não pode ser excluída.",
    };
  }
  if (result.error || !result.data) {
    return {
      success: false,
      message: "Empresa não encontrada ou não autorizada.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/empresas");
  return {
    success: true,
    message: "Empresa excluída com sucesso.",
    redirectTo: "/dashboard/empresas?feedback=deleted",
  };
}
