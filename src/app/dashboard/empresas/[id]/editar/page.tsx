import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { CompanyForm } from "@/features/companies/components/company-form";
import { getCompanyById } from "@/features/companies/services/company-service";
import { getContactsByCompany } from "@/features/contacts/services/contact-service";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const [company, contacts] = await Promise.all([
    getCompanyById(user!.id, id),
    getContactsByCompany(user!.id, id),
  ]);
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
      <section className="border-border bg-surface mt-5 rounded-xl border p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Contatos</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Pessoas vinculadas a {company.name}.
            </p>
          </div>
          <Link
            href={`/dashboard/contatos/novo?company=${company.id}`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <Plus className="size-4" />
            Adicionar contato
          </Link>
        </div>
        {contacts.length ? (
          <ul className="divide-border mt-4 divide-y">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {contact.role || contact.email || "Contato"}
                  </p>
                </div>
                <Link
                  className="text-accent text-xs hover:underline"
                  href={`/dashboard/contatos/${contact.id}`}
                >
                  Abrir
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            Nenhum contato cadastrado para esta empresa.
          </p>
        )}
      </section>
    </main>
  );
}
