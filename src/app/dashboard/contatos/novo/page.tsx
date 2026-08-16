import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getCompanyOptions } from "@/features/companies/services/company-service";
import { ContactForm } from "@/features/contacts/components/contact-form";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const [{ company = "" }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const companies = await getCompanyOptions(user!.id);
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/contatos"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" />
        Voltar para contatos
      </Link>
      <header className="mt-5 mb-7">
        <h1 className="text-2xl font-semibold sm:text-3xl">Novo contato</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Cadastre uma pessoa relacionada a uma empresa.
        </p>
      </header>
      {companies.length ? (
        <ContactForm
          companies={companies}
          defaultValues={{
            name: "",
            companyId: companies.some((item) => item.id === company)
              ? company
              : companies[0].id,
            role: "",
            contactType: "",
            email: "",
            phone: "",
            linkedinUrl: "",
            notes: "",
          }}
        />
      ) : (
        <div className="border-border bg-surface rounded-xl border p-6 text-sm">
          Cadastre uma empresa antes de adicionar contatos.{" "}
          <Link
            className="text-accent hover:underline"
            href="/dashboard/empresas/nova"
          >
            Nova empresa
          </Link>
        </div>
      )}
    </main>
  );
}
