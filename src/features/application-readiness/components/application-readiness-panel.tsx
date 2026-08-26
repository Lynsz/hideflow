import { CheckCircle2, CircleAlert, ClipboardList } from "lucide-react";
import Link from "next/link";

import type { ApplicationReadinessResult } from "@/features/application-readiness/types/application-readiness";
import { cn } from "@/lib/utils";

const STATE_LABELS: Record<ApplicationReadinessResult["state"], string> = {
  ready: "Pronta",
  in_progress: "Em preparação",
  needs_attention: "Pede atenção",
};

const STATE_STYLES: Record<ApplicationReadinessResult["state"], string> = {
  ready: "bg-accent/15 text-accent",
  in_progress: "bg-amber-400/15 text-amber-300",
  needs_attention: "bg-rose-400/15 text-rose-300",
};

export function ApplicationReadinessPanel({
  result,
}: {
  result: ApplicationReadinessResult;
}) {
  return (
    <section className="border-border bg-surface mt-7 rounded-xl border p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-lg">
            <ClipboardList className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-medium">Prontidão da candidatura</h2>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-[10px] font-medium",
                  STATE_STYLES[result.state],
                )}
              >
                {STATE_LABELS[result.state]}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
              Checklist contextual para manter o processo organizado. Não é uma
              avaliação da qualidade da candidatura.
            </p>
          </div>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="text-2xl font-semibold tracking-[-0.04em]">
            {result.percentage}%
          </p>
          <p className="text-muted-foreground mt-1 text-[11px]">
            {result.completed} de {result.total} pontos preparados
          </p>
        </div>
      </div>

      <div className="bg-muted mt-5 h-2 overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full transition-[width]"
          style={{ width: `${result.percentage}%` }}
          role="progressbar"
          aria-label="Prontidão da candidatura"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={result.percentage}
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {result.items.map((readinessItem) => {
          const Icon = readinessItem.complete ? CheckCircle2 : CircleAlert;

          return (
            <article
              key={readinessItem.key}
              className="border-border bg-muted/20 flex items-start gap-3 rounded-lg border p-4"
            >
              <Icon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  readinessItem.complete ? "text-accent" : "text-amber-300",
                )}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium">{readinessItem.label}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  {readinessItem.description}
                </p>
              </div>
              <Link
                href={readinessItem.href}
                className="text-accent shrink-0 text-xs hover:underline"
              >
                {readinessItem.action}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
