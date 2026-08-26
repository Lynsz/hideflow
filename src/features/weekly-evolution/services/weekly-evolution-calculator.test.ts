import { describe, expect, it } from "vitest";

import { calculateWeeklyEvolution } from "@/features/weekly-evolution/services/weekly-evolution-calculator";

const targets = { applications: 5, followUps: 3, outreach: 2 };

describe("weekly evolution calculator", () => {
  it("agrupa eventos em semanas UTC e preserva semanas sem atividade", () => {
    const result = calculateWeeklyEvolution({
      rangeStartDate: "2026-08-03",
      weeksCount: 3,
      targets,
      sources: {
        applications: [
          { applied_at: "2026-08-03" },
          { applied_at: "2026-08-09" },
          { applied_at: "2026-08-17" },
        ],
        followUps: [{ completed_at: "2026-08-10T00:00:00.000Z" }],
        outreach: [{ occurred_at: "2026-08-16T23:59:59.999Z" }],
        interviews: [],
        offers: [],
        reviews: [],
      },
    });

    expect(result.weeks.map((week) => week.totalActivity)).toEqual([2, 2, 1]);
    expect(result.weeks.at(-1)?.isCurrent).toBe(true);
    expect(result.summary.activeWeeks).toBe(3);
  });

  it("calcula totais, conclusão e média somente a partir de avaliações existentes", () => {
    const result = calculateWeeklyEvolution({
      rangeStartDate: "2026-08-03",
      weeksCount: 3,
      targets,
      sources: {
        applications: [{ applied_at: "2026-08-04" }],
        followUps: [],
        outreach: [],
        interviews: [
          { scheduled_at: "2026-08-05T12:00:00.000Z" },
          { scheduled_at: "2026-08-18T12:00:00.000Z" },
        ],
        offers: [{ received_at: "2026-08-18" }],
        reviews: [
          {
            week_start: "2026-08-03",
            overall_rating: 3,
            completed_at: "2026-08-09T20:00:00.000Z",
          },
          {
            week_start: "2026-08-17",
            overall_rating: 4,
            completed_at: null,
          },
        ],
      },
    });

    expect(result.summary).toEqual({
      activeWeeks: 2,
      completedReviews: 1,
      averageRating: 3.5,
      applications: 1,
      interviews: 2,
      offers: 1,
    });
    expect(result.weeks[0]).toMatchObject({
      reviewCompleted: true,
      overallRating: 3,
    });
  });

  it("ignora registros inválidos ou fora do intervalo selecionado", () => {
    const result = calculateWeeklyEvolution({
      rangeStartDate: "2026-08-10",
      weeksCount: 1,
      targets,
      sources: {
        applications: [
          { applied_at: "inválida" },
          { applied_at: "2026-08-03" },
        ],
        followUps: [{ completed_at: null }],
        outreach: [],
        interviews: [],
        offers: [],
        reviews: [],
      },
    });

    expect(result.weeks[0].totalActivity).toBe(0);
    expect(result.summary.averageRating).toBeNull();
  });
});
