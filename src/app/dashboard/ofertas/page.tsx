import {
  AlertTriangle,
  CalendarClock,
  CircleDot,
  HandCoins,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { StatusBadge } from "@/features/dashboard/components/status-badge";
import {
  formatOfferDate,
  formatOfferMoney,
  formatOfferSalary,
  getAnnualBaseSalary,
} from "@/features/offers/services/offer-formatters";
import { parseOfferPortfolioFilter } from "@/features/offers/services/offer-portfolio-rules";
import { getOfferPortfolio } from "@/features/offers/services/offer-service";
import type {
  OfferPortfolioFilter,
  OfferPortfolioState,
} from "@/features/offers/types/offer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Propostas" };

const FILTERS: Array<{ value: OfferPortfolioFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "open", label: "Em decisão" },
  { value: "due_soon", label: "Próximos 7 dias" },
  { value: "overdue", label: "Prazo vencido" },
  { value: "no_deadline", label: "Sem prazo" },
];
const STATE_LABELS: Record<OfferPortfolioState, string> = {
  open: "Em decisão",
  due_soon: "Prazo próximo",
  overdue: "Prazo vencido",
  closed: "Encerrada",
};

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <article className="border-border bg-surface rounded-xl border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{label}</p>
        <Icon className="text-accent size-4" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
    </article>
  );
}

export default async function OffersPage({
  searchParams,
}: PageProps<"/dashboard/ofertas">) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filter = parseOfferPortfolioFilter(rawFilters.state);
  const result = await getOfferPortfolio(user!.id, filter);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header>
        <p className="text-muted-foreground text-xs font-medium">
          Decisão de carreira
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Comparar propostas
          <HandCoins className="text-accent size-5" aria-hidden="true" />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Compare remuneração e condições sem misturar moedas automaticamente.
        </p>
      </header>

      <section
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo das propostas"
      >
        <MetricCard
          label="Propostas registradas"
          value={result.summary.total}
          icon={HandCoins}
        />
        <MetricCard
          label="Em decisão"
          value={result.summary.open}
          icon={CircleDot}
        />
        <MetricCard
          label="Prazo nos próximos 7 dias"
          value={result.summary.dueSoon}
          icon={CalendarClock}
        />
        <MetricCard
          label="Prazo vencido"
          value={result.summary.overdue}
          icon={AlertTriangle}
        />
      </section>

      {result.isLimited ? (
        <p className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border px-4 py-3 text-xs">
          A visão considera as 300 propostas mais recentes. Revise propostas
          antigas diretamente pelas candidaturas quando necessário.
        </p>
      ) : null}

      <nav
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtrar propostas"
      >
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={
              item.value === "all"
                ? "/dashboard/ofertas"
                : `/dashboard/ofertas?state=${item.value}`
            }
            aria-current={filter === item.value ? "page" : undefined}
            className={cn(
              "border-border shrink-0 rounded-lg border px-3 py-2 text-xs transition-colors",
              filter === item.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {result.items.length ? (
        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {result.items.map((offer) => {
            const annualBase = getAnnualBaseSalary(offer);
            const annualCash = annualBase + (offer.bonus_amount ?? 0);
            return (
              <article
                key={offer.id}
                className="border-border bg-surface rounded-xl border p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-medium">
                      {offer.application.job_title}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {offer.application.company.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-[10px]",
                        offer.portfolioState === "overdue"
                          ? "bg-red-500/10 text-red-300"
                          : offer.portfolioState === "due_soon"
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {STATE_LABELS[offer.portfolioState]}
                    </span>
                    {offer.application.archived_at ? (
                      <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-1 text-[10px]">
                        Arquivada
                      </span>
                    ) : null}
                    <StatusBadge status={offer.application.status} />
                  </div>
                </div>

                <p className="mt-5 text-xl font-semibold">
                  {formatOfferSalary(offer)}
                </p>
                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      Base anual equivalente
                    </dt>
                    <dd className="mt-1 font-medium">
                      {formatOfferMoney(annualBase, offer.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      Caixa anual + bônus
                    </dt>
                    <dd className="mt-1 font-medium">
                      {formatOfferMoney(annualCash, offer.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Recebida</dt>
                    <dd className="mt-1">
                      {formatOfferDate(offer.received_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      Prazo de decisão
                    </dt>
                    <dd className="mt-1">
                      {formatOfferDate(offer.decision_deadline)}
                    </dd>
                  </div>
                </dl>

                {offer.equity ? (
                  <div className="text-muted-foreground mt-4 text-xs">
                    <p className="text-foreground font-medium">Participação</p>
                    <p className="mt-1 whitespace-pre-wrap">{offer.equity}</p>
                  </div>
                ) : null}
                {offer.benefits ? (
                  <div className="text-muted-foreground mt-3 text-xs">
                    <p className="text-foreground font-medium">Benefícios</p>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap">
                      {offer.benefits}
                    </p>
                  </div>
                ) : null}

                <Link
                  href={`/dashboard/candidaturas/${offer.application_id}`}
                  className={buttonStyles({
                    variant: "secondary",
                    size: "sm",
                    className: "mt-5 w-full",
                  })}
                >
                  Abrir candidatura
                </Link>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="border-border bg-surface mt-7 rounded-xl border">
          <EmptyState
            title={
              filter === "all"
                ? "Nenhuma proposta registrada"
                : "Nenhuma proposta neste recorte"
            }
            description={
              filter === "all"
                ? "Abra uma candidatura e registre os dados da oferta recebida."
                : "Selecione outro filtro para revisar suas propostas."
            }
          />
        </section>
      )}
    </main>
  );
}
