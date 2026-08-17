import type { AnalyticsCoverageDatum } from "@/features/analytics/types/analytics";

export function AnalyticsCoverage({
  data,
}: {
  data: AnalyticsCoverageDatum[];
}) {
  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <h2 className="text-sm font-medium">Cobertura dos dados</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Completude dos campos que sustentam as análises.
      </p>
      <dl className="mt-6 space-y-4">
        {data.map((item) => (
          <div key={item.key}>
            <div className="flex items-center justify-between gap-4 text-xs">
              <dt>{item.label}</dt>
              <dd className="text-muted-foreground shrink-0 tabular-nums">
                {item.total ? `${item.value}%` : "—"} · {item.covered}/
                {item.total}
              </dd>
            </div>
            <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
              <div
                className="bg-accent/70 h-full rounded-full"
                style={{ width: `${item.value}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
