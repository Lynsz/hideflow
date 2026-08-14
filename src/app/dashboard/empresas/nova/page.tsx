import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { CompanyForm } from "@/features/companies/components/company-form";

export default function NewCompanyPage() {
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
          Nova empresa
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Cadastre uma empresa para relacioná-la às suas candidaturas.
        </p>
      </header>
      <CompanyForm />
    </main>
  );
}
