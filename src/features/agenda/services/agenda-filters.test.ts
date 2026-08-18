import { describe, expect, it } from "vitest";

import {
  buildAgendaCalendarUrl,
  buildAgendaUrl,
  getAgendaRange,
  parseAgendaFilters,
} from "@/features/agenda/services/agenda-filters";

describe("parseAgendaFilters", () => {
  it("aplica os filtros padrão", () => {
    expect(parseAgendaFilters({})).toEqual({ period: "30d", kind: "all" });
  });

  it("aceita somente períodos e tipos conhecidos", () => {
    expect(parseAgendaFilters({ period: "7d", type: "interview" })).toEqual({
      period: "7d",
      kind: "interview",
    });
    expect(parseAgendaFilters({ period: "forever", type: "script" })).toEqual({
      period: "30d",
      kind: "all",
    });
  });

  it("usa apenas o primeiro valor repetido na URL", () => {
    expect(
      parseAgendaFilters({
        period: ["90d", "all"],
        type: ["reminder", "interview"],
      }),
    ).toEqual({ period: "90d", kind: "reminder" });
  });
});

describe("getAgendaRange", () => {
  const now = "2026-08-18T12:00:00.000Z";

  it("calcula períodos futuros em UTC", () => {
    expect(getAgendaRange("7d", now)).toEqual({
      from: now,
      to: "2026-08-25T12:00:00.000Z",
    });
  });

  it("delimita atrasados e mantém todos sem limites temporais", () => {
    expect(getAgendaRange("overdue", now)).toEqual({ from: null, to: now });
    expect(getAgendaRange("all", now)).toEqual({ from: null, to: null });
  });
});

describe("agenda URLs", () => {
  const filters = { period: "30d", kind: "all" } as const;

  it("preserva filtros na navegação e no calendário", () => {
    expect(buildAgendaUrl(filters, { kind: "reminder" })).toBe(
      "/dashboard/agenda?period=30d&type=reminder",
    );
    expect(buildAgendaCalendarUrl(filters)).toBe(
      "/dashboard/agenda/calendario?period=30d&type=all",
    );
  });
});
