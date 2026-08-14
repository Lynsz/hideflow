import { Building2, ExternalLink, Linkedin, MapPin, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles } from "@/components/ui/form-styles";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { DeleteCompanyButton } from "@/features/companies/components/delete-company-button";
import { getCompanies } from "@/features/companies/services/company-service";

type CompaniesPageProps = {
  searchParams: Promise<{ q?: string; feedback?: string }>;
};

const FEEDBACK: Record<string, string> = {
  created: "Empresa criada com sucesso.",
  updated: "Empresa atualizada com sucesso.",
};

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const [{ q = "", feedback = "" }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const companies = await getCompanies(user!.id, q);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">Organização</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Empresas
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Organize as empresas relacionadas às suas oportunidades.
          </p>
        </div>
        <Link href="/dashboard/empresas/nova" className={buttonStyles()}>
          <Plus className="size-4" aria-hidden="true" />
          Nova empresa
        </Link>
      </header>

      {FEEDBACK[feedback] ? (
        <div className="mt-6">
          <FormFeedback kind="success" message={FEEDBACK[feedback]} />
        </div>
      ) : null}

      <form className="mt-6 flex gap-2" role="search">
        <label className="relative flex-1">
          <span className="sr-only">Pesquisar empresas</span>
          <Search
            className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={q}
            className={`${inputStyles} pl-10`}
            placeholder="Pesquisar por nome"
          />
        </label>
        <button className={buttonStyles({ variant: "secondary" })} type="submit">
          Buscar
        </button>
      </form>

      <section className="mt-6" aria-label="Lista de empresas">
        {companies.length === 0 ? (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title={q ? "Nenhuma empresa encontrada" : "Você ainda não cadastrou nenhuma empresa"}
              description={
                q
                  ? "Tente pesquisar por outro nome."
                  : "Cadastre uma empresa para começar a organizar suas candidaturas."
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {companies.map((company) => (
              <article
                key={company.id}
                className="border-border bg-surface rounded-xl border p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="bg-accent/10 text-accent grid size-10 shrink-0 place-items-center rounded-lg">
                    <Building2 className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-medium">{company.name}</h2>
                    {company.location ? (
                      <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                        <MapPin className="size-3" aria-hidden="true" />
                        {company.location}
                      </p>
                    ) : null}
                  </div>
                </div>

                {company.notes ? (
                  <p className="text-muted-foreground mt-4 line-clamp-2 text-sm leading-6">
                    {company.notes}
                  </p>
                ) : null}

                <div className="border-border mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
                  {company.website ? (
                    <a
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Website
                    </a>
                  ) : null}
                  {company.linkedin_url ? (
                    <a
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                      href={company.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Linkedin className="size-4" aria-hidden="true" />
                      LinkedIn
                    </a>
                  ) : null}
                  <div className="ml-auto flex items-start gap-1">
                    <Link
                      href={`/dashboard/empresas/${company.id}/editar`}
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Editar
                    </Link>
                    <DeleteCompanyButton
                      companyId={company.id}
                      companyName={company.name}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
