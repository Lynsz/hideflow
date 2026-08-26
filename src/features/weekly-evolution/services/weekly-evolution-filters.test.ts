import { describe, expect, it } from "vitest";

import {
  getWeeklyEvolutionWeeks,
  parseWeeklyEvolutionPeriod,
} from "@/features/weekly-evolution/services/weekly-evolution-filters";

describe("weekly evolution filters", () => {
  it("usa oito semanas como período padrão seguro", () => {
    expect(parseWeeklyEvolutionPeriod(undefined)).toBe("8w");
    expect(parseWeeklyEvolutionPeriod("all")).toBe("8w");
  });

  it("aceita períodos suportados e normaliza arrays da URL", () => {
    expect(parseWeeklyEvolutionPeriod("4w")).toBe("4w");
    expect(parseWeeklyEvolutionPeriod(["12w", "4w"])).toBe("12w");
    expect(getWeeklyEvolutionWeeks("12w")).toBe(12);
  });
});
