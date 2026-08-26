import {
  DEFAULT_WEEKLY_EVOLUTION_PERIOD,
  WEEKLY_EVOLUTION_PERIOD_OPTIONS,
} from "@/features/weekly-evolution/constants";
import type { WeeklyEvolutionPeriod } from "@/features/weekly-evolution/types/weekly-evolution";

export function parseWeeklyEvolutionPeriod(
  value: string | string[] | undefined,
): WeeklyEvolutionPeriod {
  const candidate = Array.isArray(value) ? value[0] : value;
  return WEEKLY_EVOLUTION_PERIOD_OPTIONS.some(
    (option) => option.value === candidate,
  )
    ? (candidate as WeeklyEvolutionPeriod)
    : DEFAULT_WEEKLY_EVOLUTION_PERIOD;
}

export function getWeeklyEvolutionWeeks(period: WeeklyEvolutionPeriod) {
  return WEEKLY_EVOLUTION_PERIOD_OPTIONS.find(
    (option) => option.value === period,
  )!.weeks;
}
