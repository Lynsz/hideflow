import type { AnalyticsBarDatum } from "@/features/analytics/types/analytics";

type Props = {
  title: string;
  subtitle: string;
  data: AnalyticsBarDatum[];
  emptyMessage: string;
};

export function HorizontalBarChart({
  title,
  subtitle,
  data,
  emptyMessage,
}: Props) {
  const maximum = Math.max(1, ...data.map((item) => item.value));

  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
      {data.length ? (
        <ul className="mt-6 space-y-4" aria-label={title}>
          {data.map((item) => (
            <li key={item.key}>
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="truncate">{item.label}</span>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {item.value} · {item.percentage}%
                </span>
              </div>
              <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-accent h-full rounded-full"
                  style={{ width: `${(item.value / maximum) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-6 text-sm">{emptyMessage}</p>
      )}
    </section>
  );
}
