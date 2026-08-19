import { describe, expect, it } from "vitest";

import {
  buildPriorityItems,
  filterPriorityItems,
  normalizePriorityFilter,
} from "@/features/priorities/services/priority-rules";
import type {
  PriorityApplication,
  PrioritySources,
} from "@/features/priorities/types/priority";

const application = (
  id: string,
  archivedAt: string | null = null,
): PriorityApplication => ({
  id,
  job_title: `Vaga ${id}`,
  status: "applied",
  archived_at: archivedAt,
  company: { id: `company-${id}`, name: `Empresa ${id}` },
});

const sources: PrioritySources = {
  reminders: [
    {
      id: "reminder-1",
      title: "Responder recrutadora",
      due_at: "2026-08-18T12:00:00.000Z",
      application: application("1"),
    },
  ],
  offers: [
    {
      id: "offer-1",
      decision_deadline: "2026-08-20",
      application: application("2"),
    },
    {
      id: "offer-archived",
      decision_deadline: "2026-08-18",
      application: application("archived", "2026-08-01T00:00:00.000Z"),
    },
  ],
  interviews: [
    {
      id: "interview-1",
      scheduled_at: "2026-08-19T18:00:00.000Z",
      type: "technical",
      application: application("3"),
    },
  ],
  staleApplications: [
    { ...application("1"), updated_at: "2026-07-01T00:00:00.000Z" },
    { ...application("4"), updated_at: "2026-07-02T00:00:00.000Z" },
  ],
};

describe("priority rules", () => {
  it("ordena por severidade e classifica prazos determinísticos", () => {
    const result = buildPriorityItems(sources, "2026-08-19T12:00:00.000Z");

    expect(result.map((item) => item.id)).toEqual([
      "reminder:reminder-1",
      "offer:offer-1",
      "interview:interview-1",
      "application:4",
    ]);
    expect(result.map((item) => item.severity)).toEqual([
      "critical",
      "attention",
      "attention",
      "attention",
    ]);
  });

  it("remove arquivadas e não repete candidatura parada com ação concreta", () => {
    const result = buildPriorityItems(sources, "2026-08-19T12:00:00.000Z");
    expect(result.some((item) => item.id.includes("archived"))).toBe(false);
    expect(result.some((item) => item.id === "application:1")).toBe(false);
  });

  it("remove prioridades de processos encerrados", () => {
    const result = buildPriorityItems(
      {
        ...sources,
        reminders: [
          {
            ...sources.reminders[0],
            application: {
              ...sources.reminders[0].application,
              status: "hired",
            },
          },
        ],
      },
      "2026-08-19T12:00:00.000Z",
    );
    expect(result.some((item) => item.id === "reminder:reminder-1")).toBe(
      false,
    );
  });

  it("filtra as categorias sem alterar a ordem", () => {
    const result = buildPriorityItems(sources, "2026-08-19T12:00:00.000Z");
    expect(
      filterPriorityItems(result, "offers").map((item) => item.id),
    ).toEqual(["offer:offer-1"]);
  });

  it("distingue propostas expiradas de compromissos planejados", () => {
    const result = buildPriorityItems(
      {
        reminders: [],
        staleApplications: [],
        offers: [
          {
            id: "expired",
            decision_deadline: "2026-08-18",
            application: application("5"),
          },
          {
            id: "planned",
            decision_deadline: "2026-08-23",
            application: application("6"),
          },
        ],
        interviews: [
          {
            id: "planned",
            scheduled_at: "2026-08-21T18:00:00.000Z",
            type: "hr",
            application: application("7"),
          },
        ],
      },
      "2026-08-19T12:00:00.000Z",
    );

    expect(result.map((item) => [item.id, item.severity])).toEqual([
      ["offer:expired", "critical"],
      ["offer:planned", "planned"],
      ["interview:planned", "planned"],
    ]);
  });

  it("normaliza filtros desconhecidos", () => {
    expect(normalizePriorityFilter("interviews")).toBe("interviews");
    expect(normalizePriorityFilter("invalid")).toBe("all");
    expect(normalizePriorityFilter()).toBe("all");
  });
});
