import type { WeeklyReviewPeriod } from "@/features/weekly-review/types/weekly-review";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function utcMidnight(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function mondayTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return utcMidnight(date) - daysSinceMonday * DAY_IN_MS;
}

function parseCivilDate(value: string) {
  if (!DATE_PATTERN.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isNaN(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
    ? null
    : timestamp;
}

export function buildWeeklyReviewPeriod(
  startTimestamp: number,
): WeeklyReviewPeriod {
  const start = new Date(startTimestamp).toISOString();
  const endExclusive = new Date(startTimestamp + WEEK_IN_MS).toISOString();
  return {
    start,
    endExclusive,
    startDate: start.slice(0, 10),
    endDateExclusive: endExclusive.slice(0, 10),
  };
}

export function parseWeeklyReviewPeriod(
  requestedWeek: string | undefined,
  now = new Date().toISOString(),
) {
  const nowTimestamp = Date.parse(now);
  if (Number.isNaN(nowTimestamp))
    throw new Error("Data de referência inválida.");

  const currentMonday = mondayTimestamp(nowTimestamp);
  const requestedTimestamp = requestedWeek
    ? parseCivilDate(requestedWeek)
    : null;
  const selectedMonday =
    requestedTimestamp === null
      ? currentMonday
      : Math.min(mondayTimestamp(requestedTimestamp), currentMonday);

  return {
    period: buildWeeklyReviewPeriod(selectedMonday),
    currentWeekStart: new Date(currentMonday).toISOString().slice(0, 10),
  };
}

export function shiftWeeklyReviewPeriod(weekStart: string, weeks: number) {
  const timestamp = parseCivilDate(weekStart);
  if (timestamp === null || mondayTimestamp(timestamp) !== timestamp) {
    throw new Error("Início de semana inválido.");
  }
  return new Date(timestamp + weeks * WEEK_IN_MS).toISOString().slice(0, 10);
}

export function formatWeeklyReviewDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${value}T00:00:00.000Z`))
    .replace(" de ", " ");
}

export function isValidReviewWeekStart(
  value: string,
  now = new Date().toISOString(),
) {
  const timestamp = parseCivilDate(value);
  const nowTimestamp = Date.parse(now);
  if (timestamp === null || Number.isNaN(nowTimestamp)) return false;
  return (
    mondayTimestamp(timestamp) === timestamp &&
    timestamp <= mondayTimestamp(nowTimestamp)
  );
}
