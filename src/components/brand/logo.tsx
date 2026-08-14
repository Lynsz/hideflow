import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
};

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="HireFlow — página inicial"
    >
      <span className="border-accent/25 bg-accent/10 grid size-8 place-items-center rounded-lg border">
        <span className="border-accent h-3.5 w-3.5 rounded-[4px] border-2" />
      </span>
      <span className="text-foreground text-[15px] font-semibold tracking-[-0.02em]">
        HireFlow
      </span>
    </Link>
  );
}
