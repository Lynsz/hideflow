import {
  BriefcaseBusiness,
  Clock3,
  FileCheck2,
  MessageSquareReply,
  Trophy,
  UsersRound,
} from "lucide-react";

import type { AnalyticsMetric } from "@/features/analytics/types/analytics";

const icons = {
  applications: BriefcaseBusiness,
  response: MessageSquareReply,
  interview: UsersRound,
  offer: FileCheck2,
  hired: Trophy,
  response_time: Clock3,
} satisfies Record<AnalyticsMetric["key"], typeof BriefcaseBusiness>;

export function AnalyticsMetricCard({ metric }: { metric: AnalyticsMetric }) {
  const Icon = icons[metric.key];
  return (
    <article className="border-border bg-surface rounded-xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-xs">{metric.label}</p>
        <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
        {metric.value}
      </p>
      <p className="text-muted-foreground mt-1.5 text-[11px]">
        {metric.supportingText}
      </p>
    </article>
  );
}
