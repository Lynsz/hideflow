import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InterviewWorkspaceTab = "preparation" | "debrief";

export function InterviewWorkspaceNavigation({
  interviewId,
  active,
}: {
  interviewId: string;
  active: InterviewWorkspaceTab;
}) {
  const links = [
    {
      key: "preparation" as const,
      href: `/dashboard/entrevistas/${interviewId}/preparacao`,
      label: "Preparação",
    },
    {
      key: "debrief" as const,
      href: `/dashboard/entrevistas/${interviewId}/retrospectiva`,
      label: "Retrospectiva",
    },
  ];

  return (
    <nav className="mt-4 flex gap-2" aria-label="Espaço da entrevista">
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          aria-current={active === link.key ? "page" : undefined}
          className={cn(
            buttonStyles({ variant: "ghost", size: "sm" }),
            active === link.key && "bg-muted text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
