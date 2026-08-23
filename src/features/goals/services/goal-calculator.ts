import { PRODUCTIVITY_WINDOW_DAYS } from "@/features/goals/constants";
import type {
  GoalProgress,
  ProductivityWindow,
} from "@/features/goals/types/goal";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toUtcMidnight(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function buildWindow(startTimestamp: number): ProductivityWindow {
  const endTimestamp = startTimestamp + PRODUCTIVITY_WINDOW_DAYS * DAY_IN_MS;
  const start = new Date(startTimestamp).toISOString();
  const endExclusive = new Date(endTimestamp).toISOString();

  return {
    start,
    endExclusive,
    startDate: start.slice(0, 10),
    endDateExclusive: endExclusive.slice(0, 10),
  };
}

export function buildProductivityWindows(now = new Date().toISOString()): {
  currentWindow: ProductivityWindow;
  previousWindow: ProductivityWindow;
} {
  const currentDate = new Date(now);
  if (Number.isNaN(currentDate.getTime())) {
    throw new Error("Data de referência inválida.");
  }

  const currentStart =
    toUtcMidnight(currentDate) - (PRODUCTIVITY_WINDOW_DAYS - 1) * DAY_IN_MS;
  const previousStart = currentStart - PRODUCTIVITY_WINDOW_DAYS * DAY_IN_MS;

  return {
    currentWindow: buildWindow(currentStart),
    previousWindow: buildWindow(previousStart),
  };
}

export function calculateGoalProgress(
  current: number,
  target: number,
): GoalProgress {
  if (target === 0) {
    return { percentage: 0, remaining: 0, state: "paused" };
  }

  const remaining = Math.max(0, target - current);
  return {
    percentage: Math.min(100, Math.round((current / target) * 100)),
    remaining,
    state: remaining === 0 ? "reached" : "in_progress",
  };
}

export function formatProductivityDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${value}T00:00:00.000Z`))
    .replace(" de ", " ");
}
