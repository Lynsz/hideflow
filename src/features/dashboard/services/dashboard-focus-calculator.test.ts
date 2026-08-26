import { describe, expect, it } from "vitest";

import { buildDashboardFocusData } from "@/features/dashboard/services/dashboard-focus-calculator";
import type { PriorityItem } from "@/features/priorities/types/priority";

function priority(
  id: string,
  severity: PriorityItem["severity"],
): PriorityItem {
  return {
    id,
    kind: "stale_application",
    severity,
    title: `Prioridade ${id}`,
    description: "Vaga · Empresa",
    scheduledAt: "2026-08-20T12:00:00.000Z",
    dateKind: "instant",
    href: `/dashboard/candidaturas/${id}`,
    applicationHref: `/dashboard/candidaturas/${id}`,
    applicationId: id,
  };
}

describe("dashboard focus calculator", () => {
  it("resume severidades e limita a prévia sem reordenar prioridades", () => {
    const items = [
      priority("1", "critical"),
      priority("2", "attention"),
      priority("3", "attention"),
      priority("4", "planned"),
    ];
    const result = buildDashboardFocusData({
      priorities: { items, now: "2026-08-26T12:00:00.000Z", isLimited: true },
      review: null,
      weekStart: "2026-08-24",
    });

    expect(result.priorities).toMatchObject({
      total: 4,
      counts: { critical: 1, attention: 2, planned: 1 },
      isLimited: true,
    });
    expect(result.priorities.preview.map((item) => item.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("representa uma revisão inexistente com progresso vazio", () => {
    const result = buildDashboardFocusData({
      priorities: {
        items: [],
        now: "2026-08-26T12:00:00.000Z",
        isLimited: false,
      },
      review: null,
      weekStart: "2026-08-24",
    });

    expect(result.review).toEqual({
      weekStart: "2026-08-24",
      status: "not_started",
      progress: { completed: 0, total: 5, percentage: 0 },
      overallRating: null,
      nextWeekFocus: null,
    });
  });

  it("calcula progresso e preserva o foco de uma revisão concluída", () => {
    const result = buildDashboardFocusData({
      priorities: {
        items: [],
        now: "2026-08-26T12:00:00.000Z",
        isLimited: false,
      },
      review: {
        overall_rating: 4,
        wins: "Duas entrevistas",
        challenges: "Agenda apertada",
        lessons: null,
        next_week_focus: "Preparar o desafio técnico",
        completed_at: "2026-08-26T18:00:00.000Z",
      },
      weekStart: "2026-08-24",
    });

    expect(result.review).toEqual({
      weekStart: "2026-08-24",
      status: "completed",
      progress: { completed: 4, total: 5, percentage: 80 },
      overallRating: 4,
      nextWeekFocus: "Preparar o desafio técnico",
    });
  });
});
