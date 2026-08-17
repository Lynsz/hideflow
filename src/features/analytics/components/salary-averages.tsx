import type { SalaryAverage } from "@/features/analytics/types/analytics";

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString("pt-BR")}`;
  }
}

export function SalaryAverages({ data }: { data: SalaryAverage[] }) {
  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <h2 className="text-sm font-medium">Média salarial informada</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Ponto médio da faixa, separado por moeda para evitar mistura de valores.
      </p>
      {data.length ? (
        <dl className="mt-6 space-y-4">
          {data.map((item) => (
            <div
              key={item.currency}
              className="border-border flex items-end justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <dt className="text-muted-foreground text-xs">
                  {item.currency}
                </dt>
                <dd className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                  {formatCurrency(item.average, item.currency)}
                </dd>
              </div>
              <p className="text-muted-foreground text-right text-[11px]">
                {item.sampleSize}{" "}
                {item.sampleSize === 1 ? "registro" : "registros"}
              </p>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-muted-foreground mt-6 text-sm">
          Nenhuma faixa salarial informada neste recorte.
        </p>
      )}
    </section>
  );
}
