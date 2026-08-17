import type { MonthlyApplicationDatum } from "@/features/analytics/types/analytics";

export function MonthlyApplicationsChart({
  data,
}: {
  data: MonthlyApplicationDatum[];
}) {
  const maximum = Math.max(1, ...data.map((item) => item.value));
  const minWidth = Math.max(560, data.length * 56);

  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <h2 className="text-sm font-medium">Candidaturas por mês</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Volume de registros criados no HireFlow em cada mês.
      </p>
      <div className="mt-6 overflow-x-auto pb-2">
        <div
          className="flex h-56 items-end gap-2"
          style={{ minWidth }}
          role="img"
          aria-label="Gráfico de barras com candidaturas criadas por mês"
        >
          {data.map((item) => {
            const height = item.value
              ? Math.max(4, (item.value / maximum) * 160)
              : 0;
            return (
              <div
                key={item.key}
                className="flex h-full min-w-10 flex-1 flex-col items-center"
              >
                <div className="border-border flex h-48 w-full flex-col items-center justify-end border-b">
                  <span className="text-muted-foreground mb-1 text-[10px] tabular-nums">
                    {item.value}
                  </span>
                  <div
                    className={
                      item.value
                        ? "bg-accent/80 border-accent/30 w-full max-w-10 rounded-t border"
                        : "w-full max-w-10"
                    }
                    style={{ height }}
                    title={`${item.label}: ${item.value}`}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-muted-foreground mt-2 text-[10px] whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <table className="sr-only">
        <caption>Candidaturas criadas por mês</caption>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.key}>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
