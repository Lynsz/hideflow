import { Plus } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { KanbanBoard } from "@/features/applications/components/kanban-board";
import {
  buildKanbanUrl,
  parseKanbanFilters,
} from "@/features/applications/services/application-kanban";
import { getKanbanApplications } from "@/features/applications/services/application-service";
import { getCompanyOptions } from "@/features/companies/services/company-service";

type KanbanPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KanbanPage({ searchParams }: KanbanPageProps) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filters = parseKanbanFilters(rawFilters);
  const [result, companies] = await Promise.all([
    getKanbanApplications(user!.id),
    getCompanyOptions(user!.id),
  ]);
  const boardKey = [
    buildKanbanUrl(filters),
    ...result.items.map(
      (application) =>
        `${application.id}:${application.status}:${application.updated_at}`,
    ),
  ].join("|");

  return (
    <main className="min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Candidaturas
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Pipeline
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Acompanhe suas candidaturas em cada etapa do processo seletivo.
          </p>
        </div>
        <Link href="/dashboard/candidaturas/nova" className={buttonStyles()}>
          <Plus className="size-4" aria-hidden="true" />
          Nova candidatura
        </Link>
      </header>

      <KanbanBoard
        key={boardKey}
        initialApplications={result.items}
        initialFilters={filters}
        companies={companies}
        total={result.total}
        isLimited={result.isLimited}
      />
    </main>
  );
}
