import {
  ChevronLeft,
  ChevronRight,
  FileStack,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { inputStyles } from "@/components/ui/form-styles";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getCompanyOptions } from "@/features/companies/services/company-service";
import { DocumentLibraryActions } from "@/features/documents/components/document-library-actions";
import {
  DOCUMENT_TYPES,
  formatDocumentType,
} from "@/features/documents/constants";
import {
  buildDocumentLibraryUrl,
  parseDocumentLibraryFilters,
} from "@/features/documents/services/document-library-filters";
import { getDocumentLibrary } from "@/features/documents/services/document-library-service";
import { formatFileSize } from "@/features/documents/services/document-formatters";

export const metadata: Metadata = { title: "Documentos" };

type DocumentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filters = parseDocumentLibraryFilters(rawFilters);
  const [result, companies] = await Promise.all([
    getDocumentLibrary(user!.id, filters),
    getCompanyOptions(user!.id),
  ]);
  const hasFilters = Boolean(
    filters.query ||
    filters.documentType ||
    filters.companyId ||
    filters.archive !== "active",
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Arquivos privados
          </p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Biblioteca de documentos
            <FileStack className="text-accent size-5" aria-hidden="true" />
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Encontre e gerencie os arquivos usados em cada candidatura.
          </p>
        </div>
        <Link
          href="/dashboard/candidaturas"
          className={buttonStyles({ variant: "secondary" })}
        >
          Abrir candidaturas
        </Link>
      </header>

      <form
        className="border-border bg-surface mt-6 rounded-xl border p-4"
        role="search"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal
            className="text-accent size-4"
            aria-hidden="true"
          />
          Busca e filtros
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative sm:col-span-2">
            <span className="sr-only">
              Buscar por documento, vaga ou empresa
            </span>
            <Search
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={filters.query}
              maxLength={120}
              className={`${inputStyles} pl-10`}
              placeholder="Documento, vaga ou empresa"
            />
          </label>
          <select
            name="type"
            defaultValue={filters.documentType}
            className={inputStyles}
            aria-label="Tipo de documento"
          >
            <option value="">Todos os tipos</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            name="company"
            defaultValue={filters.companyId}
            className={inputStyles}
            aria-label="Empresa"
          >
            <option value="">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            name="archive"
            defaultValue={filters.archive}
            className={inputStyles}
            aria-label="Arquivamento da candidatura"
          >
            <option value="active">Candidaturas ativas</option>
            <option value="archived">Candidaturas arquivadas</option>
            <option value="all">Ativas e arquivadas</option>
          </select>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            name="sort"
            defaultValue={filters.sort}
            className={`${inputStyles} sm:w-52`}
            aria-label="Ordenação"
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="name">Nome do documento</option>
          </select>
          <div className="flex gap-2">
            {hasFilters ? (
              <Link
                href="/dashboard/documentos"
                className={buttonStyles({ variant: "ghost" })}
              >
                Limpar
              </Link>
            ) : null}
            <button
              type="submit"
              className={buttonStyles({ variant: "secondary" })}
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </form>

      <section className="mt-6" aria-label="Lista de documentos">
        {result.items.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {result.items.map((document) => (
              <article
                key={document.id}
                className="border-border bg-surface rounded-xl border p-5"
              >
                <div className="flex min-w-0 gap-3">
                  <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-lg">
                    <FileText
                      className="text-muted-foreground size-5"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 truncate text-sm font-medium">
                        {document.name}
                      </h2>
                      {document.application.archived_at ? (
                        <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-1 text-[10px]">
                          Arquivada
                        </span>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {document.application.job_title} ·{" "}
                      {document.application.company.name}
                    </p>
                  </div>
                </div>

                <dl className="text-muted-foreground mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-[10px] tracking-wide uppercase">
                      Tipo
                    </dt>
                    <dd className="text-foreground mt-1">
                      {formatDocumentType(document.document_type)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-wide uppercase">
                      Tamanho
                    </dt>
                    <dd className="text-foreground mt-1">
                      {formatFileSize(document.file_size)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-wide uppercase">
                      Enviado em
                    </dt>
                    <dd className="text-foreground mt-1">
                      <LocalDateTime value={document.created_at} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-wide uppercase">
                      Arquivo original
                    </dt>
                    <dd className="text-foreground mt-1 truncate">
                      {document.original_name}
                    </dd>
                  </div>
                </dl>

                <div className="border-border mt-4 border-t pt-4">
                  <DocumentLibraryActions
                    documentId={document.id}
                    documentName={document.name}
                  />
                </div>
                <Link
                  href={`/dashboard/candidaturas/${document.application_id}`}
                  className="text-accent mt-4 inline-block text-xs hover:underline"
                >
                  Abrir candidatura
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title={
                hasFilters
                  ? "Nenhum documento corresponde aos filtros"
                  : "Nenhum documento nas candidaturas ativas"
              }
              description={
                hasFilters
                  ? "Ajuste ou limpe os filtros para ampliar a busca."
                  : "Abra uma candidatura para enviar seu primeiro PDF ou DOCX."
              }
            />
          </div>
        )}
      </section>

      {result.total > 0 ? (
        <nav
          className="mt-5 flex items-center justify-between gap-3"
          aria-label="Paginação"
        >
          <p className="text-muted-foreground text-xs">
            {result.total} {result.total === 1 ? "documento" : "documentos"} ·
            página {result.page} de {result.totalPages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                href={buildDocumentLibraryUrl(filters, {
                  page: result.page - 1,
                })}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Anterior
              </Link>
            ) : null}
            {result.page < result.totalPages ? (
              <Link
                href={buildDocumentLibraryUrl(filters, {
                  page: result.page + 1,
                })}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Próxima
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </main>
  );
}
