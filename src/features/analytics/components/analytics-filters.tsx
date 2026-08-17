import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/form-styles";
import {
  ANALYTICS_PERIOD_LABELS,
  ANALYTICS_PERIODS,
} from "@/features/analytics/constants";
import type { AnalyticsFilters } from "@/features/analytics/types/analytics";

type Props = {
  filters: AnalyticsFilters;
  companies: Array<{ id: string; name: string }>;
};

export function AnalyticsFiltersForm({ filters, companies }: Props) {
  const hasFilters = filters.period !== "12m" || Boolean(filters.companyId);

  return (
    <form className="border-border bg-surface mt-6 rounded-xl border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="text-accent size-4" aria-hidden="true" />
        Recorte dos indicadores
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]">
        <label>
          <span className="sr-only">Período</span>
          <select
            name="period"
            defaultValue={filters.period}
            className={inputStyles}
            aria-label="Período"
          >
            {ANALYTICS_PERIODS.map((period) => (
              <option key={period} value={period}>
                {ANALYTICS_PERIOD_LABELS[period]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Empresa</span>
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
        </label>
        <div className="flex gap-2">
          {hasFilters ? (
            <Link
              href="/dashboard/analytics"
              className={buttonStyles({ variant: "ghost" })}
            >
              Limpar
            </Link>
          ) : null}
          <button className={buttonStyles({ variant: "secondary" })}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </form>
  );
}
