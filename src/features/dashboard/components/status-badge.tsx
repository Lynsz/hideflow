import type { ApplicationStatus } from "@/features/dashboard/types/dashboard";
import { cn } from "@/lib/utils";

const statusStyles: Record<ApplicationStatus, string> = {
  Aplicada: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  Triagem: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  Entrevista: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  Proposta: "border-accent/20 bg-accent/10 text-accent",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
