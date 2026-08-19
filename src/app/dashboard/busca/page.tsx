import {
  BellRing,
  BriefcaseBusiness,
  Building2,
  Code2,
  FileText,
  MessageSquareText,
  Search,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { inputStyles } from "@/components/ui/form-styles";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
} from "@/features/search/constants";
import { normalizeSearchQuery } from "@/features/search/services/search-query";
import { searchWorkspace } from "@/features/search/services/search-service";
import type {
  GlobalSearchGroup,
  SearchResultKind,
} from "@/features/search/types/search";

export const metadata: Metadata = { title: "Busca global" };

const RESULT_ICONS: Record<SearchResultKind, LucideIcon> = {
  application: BriefcaseBusiness,
  company: Building2,
  contact: Users,
  reminder: BellRing,
  document: FileText,
  technology: Code2,
  activity: MessageSquareText,
};

const SEARCHABLE_AREAS = [
  "candidaturas",
  "empresas",
  "contatos",
  "lembretes",
  "documentos",
  "tecnologias",
  "interações",
] as const;

function SearchResultGroup({ group }: { group: GlobalSearchGroup }) {
  const Icon = RESULT_ICONS[group.kind];

  return (
    <section aria-labelledby={`search-group-${group.kind}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="text-accent size-4" aria-hidden="true" />
        <h2 id={`search-group-${group.kind}`} className="text-sm font-medium">
          {group.label}
        </h2>
        <span className="text-muted-foreground text-xs">
          {group.items.length}
        </span>
      </div>
      <div className="border-border bg-surface divide-border divide-y overflow-hidden rounded-xl border">
        {group.items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="hover:bg-muted/50 focus-visible:bg-muted/50 flex items-center gap-3 px-4 py-3.5 transition-colors outline-none sm:px-5"
          >
            <span className="bg-muted grid size-9 shrink-0 place-items-center rounded-lg">
              <Icon
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {item.title}
              </span>
              <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                {item.description || group.label.slice(0, -1)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [{ q }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const queryState = normalizeSearchQuery(q);
  const result = queryState.canSearch
    ? await searchWorkspace(user!.id, queryState.query)
    : null;
  const hasRawQuery = typeof q === "string" ? q.length > 0 : Boolean(q?.[0]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header>
        <p className="text-muted-foreground text-xs font-medium">
          Navegação rápida
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Busca global
          <Search className="text-accent size-5" aria-hidden="true" />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Encontre qualquer registro privado do seu processo seletivo.
        </p>
      </header>

      <form className="mt-6" role="search" action="/dashboard/busca">
        <label htmlFor="global-search" className="sr-only">
          Buscar no HireFlow
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <span className="relative flex-1">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="global-search"
              name="q"
              type="search"
              defaultValue={queryState.query}
              minLength={SEARCH_QUERY_MIN_LENGTH}
              maxLength={SEARCH_QUERY_MAX_LENGTH}
              className={`${inputStyles} h-11 pl-10`}
              placeholder="Vaga, empresa, contato, interação..."
              autoComplete="off"
              autoFocus
            />
          </span>
          <button type="submit" className={buttonStyles()}>
            Buscar
          </button>
        </div>
        <div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span>Digite pelo menos {SEARCH_QUERY_MIN_LENGTH} caracteres.</span>
          <span>
            Atalho:{" "}
            <kbd className="border-border rounded border px-1.5 py-0.5">
              Ctrl K
            </kbd>
          </span>
        </div>
      </form>

      {queryState.wasTruncated ? (
        <p className="border-border bg-muted/40 mt-5 rounded-lg border px-4 py-3 text-xs">
          A busca considerou os primeiros {SEARCH_QUERY_MAX_LENGTH} caracteres.
        </p>
      ) : null}

      {!hasRawQuery ? (
        <section className="border-border bg-surface mt-8 rounded-xl border p-5 sm:p-6">
          <h2 className="text-sm font-medium">Pesquise em todo o HireFlow</h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            A busca consulta somente os dados vinculados à sua conta e retorna
            até seis resultados por categoria.
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SEARCHABLE_AREAS.map((area) => (
              <li
                key={area}
                className="border-border bg-background rounded-lg border px-3 py-2.5 text-xs capitalize"
              >
                {area}
              </li>
            ))}
          </ul>
        </section>
      ) : !queryState.canSearch ? (
        <div className="border-border bg-surface mt-8 rounded-xl border">
          <EmptyState
            title="Digite um termo mais específico"
            description={`Use pelo menos ${SEARCH_QUERY_MIN_LENGTH} caracteres úteis para iniciar a busca.`}
          />
        </div>
      ) : result?.total === 0 ? (
        <div className="border-border bg-surface mt-8 rounded-xl border">
          <EmptyState
            title={`Nenhum resultado para “${queryState.query}”`}
            description="Tente outro nome, cargo, empresa, arquivo, tecnologia ou interação."
          />
        </div>
      ) : (
        <>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {result?.total} {result?.total === 1 ? "resultado" : "resultados"}
              <span className="text-muted-foreground font-normal">
                {" "}
                para “{queryState.query}”
              </span>
            </p>
            {result?.isLimited ? (
              <p className="text-muted-foreground text-xs">
                Exibindo até seis por categoria
              </p>
            ) : null}
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-start">
            {result?.groups.map((group) => (
              <SearchResultGroup key={group.kind} group={group} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
