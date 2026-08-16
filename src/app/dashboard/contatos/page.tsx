import { Building2, ExternalLink, Mail, Plus, Search } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles } from "@/components/ui/form-styles";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getCompanyOptions } from "@/features/companies/services/company-service";
import {
  CONTACT_TYPES,
  formatContactType,
} from "@/features/contacts/constants";
import { getContacts } from "@/features/contacts/services/contact-service";

type Props = {
  searchParams: Promise<{
    q?: string;
    company?: string;
    type?: string;
    feedback?: string;
  }>;
};
const feedbacks: Record<string, string> = {
  deleted: "Contato excluído com sucesso.",
};

export default async function ContactsPage({ searchParams }: Props) {
  const [{ q = "", company = "", type = "", feedback = "" }, user] =
    await Promise.all([searchParams, getCurrentUser()]);
  const [contacts, companies] = await Promise.all([
    getContacts(user!.id, {
      query: q.trim(),
      companyId: company,
      contactType: type,
    }),
    getCompanyOptions(user!.id),
  ]);
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Relacionamentos
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Contatos
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Recruiters, gestores e entrevistadores das suas oportunidades.
          </p>
        </div>
        <Link href="/dashboard/contatos/novo" className={buttonStyles()}>
          <Plus className="size-4" />
          Novo contato
        </Link>
      </header>
      {feedbacks[feedback] && (
        <div className="mt-6">
          <FormFeedback kind="success" message={feedbacks[feedback]} />
        </div>
      )}
      <form
        className="mt-6 grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px_220px_auto]"
        role="search"
      >
        <label className="relative">
          <span className="sr-only">Buscar contatos</span>
          <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input
            name="q"
            defaultValue={q}
            className={`${inputStyles} pl-10`}
            placeholder="Nome, cargo, empresa ou email"
          />
        </label>
        <select
          name="company"
          defaultValue={company}
          className={inputStyles}
          aria-label="Filtrar por empresa"
        >
          <option value="">Todas as empresas</option>
          {companies.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={type}
          className={inputStyles}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos os tipos</option>
          {CONTACT_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button className={buttonStyles({ variant: "secondary" })}>
          Filtrar
        </button>
      </form>
      <section className="mt-6" aria-label="Lista de contatos">
        {contacts.length === 0 ? (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title="Nenhum contato cadastrado"
              description="Adicione recruiters, entrevistadores e outros contatos relacionados às suas oportunidades."
            />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {contacts.map((contact) => (
              <article
                key={contact.id}
                className="border-border bg-surface rounded-xl border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/contatos/${contact.id}`}
                      className="font-medium hover:underline"
                    >
                      {contact.name}
                    </Link>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {contact.role || formatContactType(contact.contact_type)}
                    </p>
                  </div>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px]">
                    {formatContactType(contact.contact_type)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                  <Building2 className="size-3.5" />
                  {contact.company.name}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  {contact.email && (
                    <a
                      className="text-accent inline-flex items-center gap-1 hover:underline"
                      href={`mailto:${contact.email}`}
                    >
                      <Mail className="size-3.5" />
                      {contact.email}
                    </a>
                  )}
                  {contact.linkedin_url && (
                    <a
                      className="text-accent inline-flex items-center gap-1 hover:underline"
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
