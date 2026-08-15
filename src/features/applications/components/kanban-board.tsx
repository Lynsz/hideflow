"use client";

import {
  DragDropProvider,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import {
  CircleAlert,
  GripVertical,
  LoaderCircle,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/form-styles";
import { changeApplicationStatus } from "@/features/applications/actions";
import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  FINAL_APPLICATION_STATUSES,
  INTERVIEW_APPLICATION_STATUSES,
  WORK_MODES,
  WORK_MODE_LABELS,
} from "@/features/applications/constants";
import {
  formatDate,
  formatEmploymentType,
  formatSalary,
  formatWorkMode,
} from "@/features/applications/services/application-formatters";
import {
  buildKanbanUrl,
  filterKanbanApplications,
  groupKanbanApplications,
  moveKanbanApplication,
  parseKanbanFilters,
  restoreKanbanApplication,
} from "@/features/applications/services/application-kanban";
import type {
  KanbanApplication,
  KanbanFilters as KanbanFilterValues,
} from "@/features/applications/types/application";
import type { CompanyOption } from "@/features/companies/types/company";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/database";

type KanbanBoardProps = {
  initialApplications: KanbanApplication[];
  initialFilters: KanbanFilterValues;
  companies: CompanyOption[];
  total: number;
  isLimited: boolean;
};

type Feedback = { kind: "success" | "error"; message: string } | null;

function KanbanCard({
  application,
  isPending,
  onMove,
}: {
  application: KanbanApplication;
  isPending: boolean;
  onMove: (applicationId: string, status: ApplicationStatus) => void;
}) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: application.id,
    type: "application-card",
    data: { status: application.status },
    disabled: isPending,
  });

  return (
    <article
      ref={ref}
      className={cn(
        "border-border bg-surface-raised rounded-lg border p-3.5 shadow-sm transition",
        isDragging && "opacity-40",
        isPending && "border-accent/25",
      )}
    >
      <div className="flex items-start gap-2">
        <Link
          href={`/dashboard/candidaturas/${application.id}`}
          className="min-w-0 flex-1 rounded-sm"
        >
          <h3 className="truncate text-sm font-medium hover:underline">
            {application.job_title}
          </h3>
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {application.company.name}
          </p>
        </Link>
        <button
          ref={handleRef}
          type="button"
          className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-8 shrink-0 cursor-grab place-items-center rounded-md transition active:cursor-grabbing disabled:cursor-not-allowed"
          aria-label={`Mover ${application.job_title} por arraste`}
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <GripVertical className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <dl className="text-muted-foreground mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
        <div>
          <dt className="sr-only">Modalidade</dt>
          <dd className="truncate">{formatWorkMode(application.work_mode)}</dd>
        </div>
        <div>
          <dt className="sr-only">Contrato</dt>
          <dd className="truncate">
            {formatEmploymentType(application.employment_type)}
          </dd>
        </div>
        {application.location ? (
          <div className="col-span-2">
            <dt className="sr-only">Localização</dt>
            <dd className="truncate">{application.location}</dd>
          </div>
        ) : null}
        {application.salary_min !== null || application.salary_max !== null ? (
          <div className="col-span-2">
            <dt className="sr-only">Faixa salarial</dt>
            <dd className="truncate">{formatSalary(application)}</dd>
          </div>
        ) : null}
        {application.applied_at ? (
          <div className="col-span-2">
            <dt className="sr-only">Data da candidatura</dt>
            <dd>Aplicada em {formatDate(application.applied_at)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="border-border mt-3 border-t pt-3">
        <label className="sr-only" htmlFor={`move-${application.id}`}>
          Mover {application.job_title} para outro status
        </label>
        <select
          id={`move-${application.id}`}
          className={`${inputStyles} h-9 text-xs`}
          value={application.status}
          disabled={isPending}
          onChange={(event) =>
            onMove(application.id, event.target.value as ApplicationStatus)
          }
        >
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              Mover para: {APPLICATION_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

function KanbanColumn({
  status,
  applications,
  pendingIds,
  onMove,
}: {
  status: ApplicationStatus;
  applications: KanbanApplication[];
  pendingIds: ReadonlySet<string>;
  onMove: (applicationId: string, status: ApplicationStatus) => void;
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `column:${status}`,
    type: "kanban-column",
    accept: "application-card",
    data: { status },
  });
  const isFinal = FINAL_APPLICATION_STATUSES.includes(status);

  return (
    <section
      ref={ref}
      className={cn(
        "border-border bg-background/70 flex min-h-[28rem] w-[18rem] shrink-0 flex-col rounded-xl border p-3 sm:w-[19rem]",
        isFinal && "bg-surface/55 border-dashed",
        status === "hired" &&
          "before:bg-border relative ml-3 before:absolute before:inset-y-3 before:-left-2 before:w-px sm:ml-5 sm:before:-left-3",
        isDropTarget && "border-accent/60 bg-accent/5",
      )}
      aria-labelledby={`column-title-${status}`}
    >
      <header className="flex items-center justify-between gap-3 px-1 py-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "bg-accent size-1.5 shrink-0 rounded-full",
              isFinal && "bg-muted-foreground",
            )}
            aria-hidden="true"
          />
          <h2
            id={`column-title-${status}`}
            className="truncate text-xs font-medium"
          >
            {APPLICATION_STATUS_LABELS[status]}
          </h2>
        </div>
        <span
          className="bg-muted text-muted-foreground grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[11px]"
          aria-label={`${applications.length} candidaturas`}
        >
          {applications.length}
        </span>
      </header>

      <div className="mt-3 flex flex-1 flex-col gap-2.5">
        {applications.length === 0 ? (
          <div className="border-border text-muted-foreground grid min-h-24 place-items-center rounded-lg border border-dashed px-3 text-center text-xs">
            Nenhuma candidatura
          </div>
        ) : (
          applications.map((application) => (
            <KanbanCard
              key={application.id}
              application={application}
              isPending={pendingIds.has(application.id)}
              onMove={onMove}
            />
          ))
        )}
      </div>

      <Link
        href={`/dashboard/candidaturas/nova?status=${status}`}
        className={buttonStyles({
          variant: "ghost",
          size: "sm",
          className: "mt-3 w-full text-xs",
        })}
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Adicionar
      </Link>
    </section>
  );
}

export function KanbanBoard({
  initialApplications,
  initialFilters,
  companies,
  total,
  isLimited,
}: KanbanBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [applications, setApplications] = useState(initialApplications);
  const [filters, setFilters] = useState(initialFilters);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState<Feedback>(null);

  const visibleApplications = useMemo(
    () => filterKanbanApplications(applications, filters),
    [applications, filters],
  );
  const groups = useMemo(
    () => groupKanbanApplications(visibleApplications),
    [visibleApplications],
  );
  const activeCount = visibleApplications.filter((application) =>
    ACTIVE_APPLICATION_STATUSES.includes(application.status),
  ).length;
  const interviewCount = visibleApplications.filter((application) =>
    INTERVIEW_APPLICATION_STATUSES.includes(application.status),
  ).length;
  const offerCount = groups.offer.length;
  const hasFilters = Boolean(
    filters.query ||
    filters.workMode ||
    filters.employmentType ||
    filters.companyId,
  );

  const markPending = (applicationId: string, pending: boolean) => {
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(applicationId);
      else next.delete(applicationId);
      return next;
    });
  };

  const moveApplication = async (
    applicationId: string,
    nextStatus: ApplicationStatus,
  ) => {
    if (pendingIds.has(applicationId)) return;

    const optimistic = moveKanbanApplication(
      applications,
      applicationId,
      nextStatus,
    );
    if (!optimistic.changed || !optimistic.previous) return;

    setApplications(optimistic.items);
    markPending(applicationId, true);
    setFeedback(null);

    try {
      const result = await changeApplicationStatus({
        applicationId,
        previousStatus: optimistic.previous.status,
        status: nextStatus,
      });

      if (!result.success) {
        setApplications((current) =>
          restoreKanbanApplication(current, optimistic.previous!),
        );
        setFeedback({ kind: "error", message: result.message });
        if (result.currentStatus) router.refresh();
        return;
      }

      setFeedback({ kind: "success", message: result.message });
    } catch {
      setApplications((current) =>
        restoreKanbanApplication(current, optimistic.previous!),
      );
      setFeedback({
        kind: "error",
        message:
          "A conexão falhou. A candidatura voltou para a etapa anterior.",
      });
    } finally {
      markPending(applicationId, false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;
    const applicationId = event.operation.source?.id;
    const status = event.operation.target?.data.status;

    if (applicationId === undefined || !APPLICATION_STATUSES.includes(status)) {
      return;
    }

    void moveApplication(String(applicationId), status);
  };

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = parseKanbanFilters({
      q: filters.query,
      workMode: filters.workMode,
      employmentType: filters.employmentType,
      company: filters.companyId,
    });
    setFilters(normalized);
    router.push(buildKanbanUrl(normalized));
  };

  const clearFilters = () => {
    const emptyFilters = parseKanbanFilters({});
    setFilters(emptyFilters);
    router.push(pathname);
  };

  return (
    <>
      <section
        className="mt-6 grid grid-cols-3 gap-3"
        aria-label="Resumo do pipeline"
      >
        {[
          { label: "Em andamento", value: activeCount },
          { label: "Entrevistas", value: interviewCount },
          { label: "Propostas", value: offerCount },
        ].map((metric) => (
          <div
            key={metric.label}
            className="border-border bg-surface rounded-xl border p-3.5 sm:p-4"
          >
            <p className="text-muted-foreground truncate text-[11px] sm:text-xs">
              {metric.label}
            </p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      <form
        className="border-border bg-surface mt-4 rounded-xl border p-4"
        role="search"
        onSubmit={applyFilters}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal
            className="text-accent size-4"
            aria-hidden="true"
          />
          Busca e filtros
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="relative sm:col-span-2">
            <span className="sr-only">
              Buscar candidatura por vaga ou empresa
            </span>
            <Search
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              className={`${inputStyles} pl-10`}
              value={filters.query}
              placeholder="Buscar candidatura..."
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
            />
          </label>
          <select
            className={inputStyles}
            value={filters.workMode}
            aria-label="Modalidade"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                workMode: event.target.value as KanbanFilterValues["workMode"],
              }))
            }
          >
            <option value="">Todas as modalidades</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
          <select
            className={inputStyles}
            value={filters.employmentType}
            aria-label="Tipo de contrato"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                employmentType: event.target
                  .value as KanbanFilterValues["employmentType"],
              }))
            }
          >
            <option value="">Todos os contratos</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EMPLOYMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <select
            className={inputStyles}
            value={filters.companyId}
            aria-label="Empresa"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                companyId: event.target.value,
              }))
            }
          >
            <option value="">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          {hasFilters ? (
            <button
              type="button"
              className={buttonStyles({ variant: "ghost" })}
              onClick={clearFilters}
            >
              Limpar filtros
            </button>
          ) : null}
          <button
            type="submit"
            className={buttonStyles({ variant: "secondary" })}
          >
            Aplicar filtros
          </button>
        </div>
      </form>

      {feedback ? (
        <p
          className={cn(
            "mt-4 rounded-lg border p-3 text-sm",
            feedback.kind === "error"
              ? "border-red-400/20 bg-red-400/5 text-red-300"
              : "border-accent/20 bg-accent/5 text-accent",
          )}
          role={feedback.kind === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      ) : null}

      {isLimited ? (
        <p className="border-border bg-surface text-muted-foreground mt-4 flex items-start gap-2 rounded-lg border p-3 text-xs">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Exibindo as {initialApplications.length} candidaturas atualizadas mais
          recentemente, de um total de {total}.
        </p>
      ) : null}

      {total === 0 ? (
        <section className="border-border bg-surface mt-6 rounded-xl border px-6 py-14 text-center">
          <h2 className="font-medium">Seu pipeline ainda está vazio</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Cadastre uma candidatura para começar a acompanhar cada etapa do
            processo seletivo.
          </p>
          <Link
            href="/dashboard/candidaturas/nova"
            className={buttonStyles({ className: "mt-5" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Nova candidatura
          </Link>
        </section>
      ) : visibleApplications.length === 0 ? (
        <section className="border-border bg-surface mt-6 rounded-xl border px-6 py-14 text-center">
          <h2 className="font-medium">
            Nenhuma candidatura corresponde aos filtros selecionados.
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Ajuste a busca ou limpe os filtros para visualizar o pipeline.
          </p>
        </section>
      ) : null}

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div
          className="mt-6 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] overflow-x-auto pb-4"
          aria-label="Kanban de candidaturas"
        >
          <div className="flex w-max gap-3 pr-1">
            {APPLICATION_STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                applications={groups[status]}
                pendingIds={pendingIds}
                onMove={(applicationId, nextStatus) => {
                  void moveApplication(applicationId, nextStatus);
                }}
              />
            ))}
          </div>
        </div>
      </DragDropProvider>
    </>
  );
}
