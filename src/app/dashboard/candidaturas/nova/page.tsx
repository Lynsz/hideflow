import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { getCompanyOptions } from "@/features/companies/services/company-service";

export default async function NewApplicationPage() {
  const user = await getCurrentUser();
  const companies = await getCompanyOptions(user!.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/candidaturas"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para candidaturas
      </Link>
      <header className="mt-5 mb-7">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Nova candidatura
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Registre uma nova oportunidade no seu pipeline.
        </p>
      </header>

      {companies.length === 0 ? (
        <div className="border-border bg-surface rounded-xl border p-8 text-center">
          <Building2
            className="text-accent mx-auto size-6"
            aria-hidden="true"
          />
          <h2 className="mt-4 font-medium">Cadastre uma empresa primeiro</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Toda candidatura precisa estar relacionada a uma empresa do seu
            cadastro.
          </p>
          <Link
            href="/dashboard/empresas/nova"
            className={buttonStyles({ className: "mt-5" })}
          >
            Nova empresa
          </Link>
        </div>
      ) : (
        <ApplicationForm companies={companies} />
      )}
    </main>
  );
}
