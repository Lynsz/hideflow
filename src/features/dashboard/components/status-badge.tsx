import { APPLICATION_STATUS_LABELS } from "@/features/applications/constants";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/database";

const statusStyles: Record<ApplicationStatus, string> = {
  saved: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
  applied: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  screening: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  hr_interview: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  technical_interview: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  technical_challenge:
    "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300",
  final_interview: "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
  offer: "border-accent/20 bg-accent/10 text-accent",
  hired: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  rejected: "border-red-400/20 bg-red-400/10 text-red-300",
  withdrawn: "border-orange-400/20 bg-orange-400/10 text-orange-300",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium",
        statusStyles[status],
      )}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
