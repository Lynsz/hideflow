import {
  AGENDA_KINDS,
  AGENDA_PERIODS,
  type AgendaKindFilter,
  type AgendaPeriod,
} from "@/features/agenda/constants";
import type { AgendaFilters } from "@/features/agenda/types/agenda";

type RawAgendaFilters = Record<string, string | string[] | undefined>;

const periods = new Set<AgendaPeriod>(
  AGENDA_PERIODS.map((period) => period.value),
);
const kinds = new Set<AgendaKindFilter>(AGENDA_KINDS.map((kind) => kind.value));

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAgendaFilters(raw: RawAgendaFilters): AgendaFilters {
  const period = firstValue(raw.period) as AgendaPeriod | undefined;
  const kind = firstValue(raw.type) as AgendaKindFilter | undefined;

  return {
    period: period && periods.has(period) ? period : "30d",
    kind: kind && kinds.has(kind) ? kind : "all",
  };
}

export function getAgendaRange(period: AgendaPeriod, now: string) {
  if (period === "all") return { from: null, to: null };
  if (period === "overdue") return { from: null, to: now };

  const days = Number.parseInt(period, 10);
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + days);
  return { from: now, to: end.toISOString() };
}

export function buildAgendaUrl(
  filters: AgendaFilters,
  overrides: Partial<AgendaFilters> = {},
) {
  const next = { ...filters, ...overrides };
  const search = new URLSearchParams({
    period: next.period,
    type: next.kind,
  });
  return `/dashboard/agenda?${search.toString()}`;
}

export function buildAgendaCalendarUrl(filters: AgendaFilters) {
  const search = new URLSearchParams({
    period: filters.period,
    type: filters.kind,
  });
  return `/dashboard/agenda/calendario?${search.toString()}`;
}
