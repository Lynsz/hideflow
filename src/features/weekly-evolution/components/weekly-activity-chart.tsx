import { WEEKLY_EVOLUTION_METRICS } from "@/features/weekly-evolution/constants";
import type { WeeklyEvolutionWeek } from "@/features/weekly-evolution/types/weekly-evolution";
import { cn } from "@/lib/utils";

export function WeeklyActivityChart({
  weeks,
}: {
  weeks: WeeklyEvolutionWeek[];
}) {
  const maximum = Math.max(1, ...weeks.map((week) => week.totalActivity));
  const minWidth = Math.max(640, weeks.length * 72);

  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-sm font-medium">Volume semanal registrado</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Composição das ações e resultados em cada semana civil UTC.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-2" aria-label="Legenda">
          {WEEKLY_EVOLUTION_METRICS.map((metric) => (
            <li
              key={metric.key}
              className="text-muted-foreground flex items-center gap-1.5 text-[10px]"
            >
              <span className={cn("size-2 rounded-full", metric.color)} />
              {metric.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div
          className="flex h-64 items-end gap-2"
          style={{ minWidth }}
          role="img"
          aria-label="Gráfico de barras empilhadas com o volume semanal de atividade"
        >
          {weeks.map((week) => {
            const height = week.totalActivity
              ? Math.max(8, (week.totalActivity / maximum) * 184)
              : 0;
            return (
              <div
                key={week.startDate}
                className="flex h-full min-w-12 flex-1 flex-col items-center"
              >
                <div className="border-border flex h-52 w-full flex-col items-center justify-end border-b">
                  <span className="text-muted-foreground mb-1 text-[10px] tabular-nums">
                    {week.totalActivity}
                  </span>
                  <div
                    className="flex w-full max-w-11 flex-col-reverse overflow-hidden rounded-t"
                    style={{ height }}
                    title={`${week.label}: ${week.totalActivity} registros`}
                    aria-hidden="true"
                  >
                    {WEEKLY_EVOLUTION_METRICS.map((metric) => {
                      const value = week[metric.key];
                      return value ? (
                        <span
                          key={metric.key}
                          className={metric.color}
                          style={{ flexGrow: value }}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
                <span className="text-muted-foreground mt-2 text-[10px] whitespace-nowrap">
                  {week.label}
                </span>
                {week.isCurrent ? (
                  <span className="text-accent mt-0.5 text-[9px]">Atual</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <table className="sr-only">
        <caption>Atividade registrada por semana</caption>
        <thead>
          <tr>
            <th>Semana</th>
            {WEEKLY_EVOLUTION_METRICS.map((metric) => (
              <th key={metric.key}>{metric.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.startDate}>
              <td>{week.label}</td>
              {WEEKLY_EVOLUTION_METRICS.map((metric) => (
                <td key={metric.key}>{week[metric.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
