import { HandCoins } from "lucide-react";
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
import { getOffers } from "@/features/offers/services/offer-service";

export const metadata: Metadata = { title: "Propostas" };

export default async function OffersPage() {
  const user = await getCurrentUser();
  const offers = await getOffers(user!.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
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

      {offers.length ? (
        <section className="mt-7 grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => {
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
            title="Nenhuma proposta registrada"
            description="Abra uma candidatura e registre os dados da oferta recebida."
          />
        </section>
      )}
    </main>
  );
}
