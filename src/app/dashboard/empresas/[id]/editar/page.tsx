import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { CompanyForm } from "@/features/companies/components/company-form";
import { getCompanyById } from "@/features/companies/services/company-service";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const company = await getCompanyById(user!.id, id);
  if (!company) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/empresas"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para empresas
      </Link>
      <header className="mt-5 mb-7">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Editar empresa
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Atualize os dados de {company.name}.
        </p>
      </header>
      <CompanyForm
        companyId={company.id}
        defaultValues={{
          name: company.name,
          website: company.website ?? "",
          linkedinUrl: company.linkedin_url ?? "",
          location: company.location ?? "",
          notes: company.notes ?? "",
        }}
      />
    </main>
  );
}
