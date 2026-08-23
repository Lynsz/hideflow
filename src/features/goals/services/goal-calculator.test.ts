import { describe, expect, it } from "vitest";

import {
  buildProductivityWindows,
  calculateGoalProgress,
  formatProductivityDate,
} from "@/features/goals/services/goal-calculator";

describe("buildProductivityWindows", () => {
  it("cria duas janelas civis consecutivas de sete dias em UTC", () => {
    expect(buildProductivityWindows("2026-08-23T18:30:00.000Z")).toEqual({
      currentWindow: {
        start: "2026-08-17T00:00:00.000Z",
        endExclusive: "2026-08-24T00:00:00.000Z",
        startDate: "2026-08-17",
        endDateExclusive: "2026-08-24",
      },
      previousWindow: {
        start: "2026-08-10T00:00:00.000Z",
        endExclusive: "2026-08-17T00:00:00.000Z",
        startDate: "2026-08-10",
        endDateExclusive: "2026-08-17",
      },
    });
  });

  it("rejeita uma data de referência inválida", () => {
    expect(() => buildProductivityWindows("inválida")).toThrow(
      "Data de referência inválida.",
    );
  });
});

describe("calculateGoalProgress", () => {
  it("limita a barra em 100% e preserva o valor realizado", () => {
    expect(calculateGoalProgress(8, 5)).toEqual({
      percentage: 100,
      remaining: 0,
      state: "reached",
    });
  });

  it("calcula o restante de uma meta em andamento", () => {
    expect(calculateGoalProgress(2, 5)).toEqual({
      percentage: 40,
      remaining: 3,
      state: "in_progress",
    });
  });

  it("trata zero como meta pausada sem divisão inválida", () => {
    expect(calculateGoalProgress(4, 0)).toEqual({
      percentage: 0,
      remaining: 0,
      state: "paused",
    });
  });
});

describe("formatProductivityDate", () => {
  it("mantém a data civil independente do fuso do processo", () => {
    expect(formatProductivityDate("2026-08-17")).toMatch(/^17 ago\.?$/);
  });
});
