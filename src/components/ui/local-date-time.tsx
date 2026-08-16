"use client";

import { useSyncExternalStore } from "react";

import { formatDateTimeForLocale } from "@/lib/date-time";

export function LocalDateTime({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const formatted = useSyncExternalStore(
    () => () => undefined,
    () => formatDateTimeForLocale(value),
    () => "",
  );
  return (
    <time
      dateTime={value}
      className={className}
      aria-label={formatted || "Data e hora carregando"}
    >
      {formatted || "—"}
    </time>
  );
}
