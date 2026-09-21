import { describe, expect, it } from "vitest";

import {
  buildReadinessCenterItems,
  filterReadinessCenterByGap,
  filterReadinessCenterItems,
  getReadinessActionGap,
  normalizeReadinessCenterFilter,
  normalizeReadinessGapFilter,
  summarizeReadinessCenter,
  summarizeReadinessGaps,
} from "@/features/application-readiness/services/readiness-center-rules";
import type {
  ReadinessCenterApplicationSource,
  ReadinessCenterSources,
} from "@/features/application-readiness/types/readiness-center";

const application = (
  id: string,
  overrides: Partial<ReadinessCenterApplicationSource> = {},
): ReadinessCenterApplicationSource => ({
  id,
  job_title: `Vaga ${id}`,
  job_url: null,
  description: null,
  notes: null,
  status: "applied",
  archived_at: null,
  updated_at: "2026-08-20T12:00:00.000Z",
  company: { id: `company-${id}`, name: `Empresa ${id}` },
  ...overrides,
});

const sources = (
  overrides: Partial<ReadinessCenterSources> = {},
): ReadinessCenterSources => ({
  applications: [],
  contacts: [],
  technologies: [],
  resumes: [],
  reminders: [],
  interviews: [],
  offers: [],
  ...overrides,
});

const NOW = "2026-08-27T12:00:00.000Z";

describe("readiness center rules", () => {
  it("reutiliza a prontidão e ordena as maiores lacunas primeiro", () => {
    const items = buildReadinessCenterItems(
      sources({
        applications: [
          application("ready", {
            job_url: "https://example.com/job",
            description: "Contexto completo",
          }),
          application("empty"),
        ],
        contacts: [{ application_id: "ready" }],
        technologies: [{ application_id: "ready" }],
        resumes: [{ application_id: "ready" }],
        reminders: [{ application_id: "ready" }],
      }),
      NOW,
    );

    expect(items.map((item) => item.application.id)).toEqual([
      "empty",
      "ready",
    ]);
    expect(items.map((item) => item.readiness.percentage)).toEqual([0, 100]);
  });

  it("transforma âncoras em links para a candidatura correta", () => {
    const [item] = buildReadinessCenterItems(
      sources({ applications: [application("one")] }),
      NOW,
    );

    expect(
      item.readiness.items.find((readinessItem) =>
        readinessItem.href.endsWith("#documentos"),
      )?.href,
    ).toBe("/dashboard/candidaturas/one#documentos");
    expect(
      item.readiness.items.find(
        (readinessItem) => readinessItem.key === "next_step",
      )?.href,
    ).toBe("/dashboard/lembretes/novo?application=one");
  });

  it("considera vínculos, entrevista futura e proposta sem expor registros", () => {
    const [item] = buildReadinessCenterItems(
      sources({
        applications: [application("offer", { status: "offer" })],
        contacts: [{ application_id: "offer" }],
        interviews: [
          {
            application_id: "offer",
            result: "scheduled",
            scheduled_at: "2026-08-28T12:00:00.000Z",
          },
        ],
        offers: [{ application_id: "offer" }],
      }),
      NOW,
    );

    expect(
      item.readiness.items.find(
        (readinessItem) => readinessItem.key === "contact",
      )?.complete,
    ).toBe(true);
    expect(
      item.readiness.items.find(
        (readinessItem) => readinessItem.key === "next_step",
      ),
    ).toMatchObject({
      complete: true,
      href: "/dashboard/candidaturas/offer#entrevistas",
    });
    expect(item.readiness.items.at(-1)).toMatchObject({
      key: "offer",
      complete: true,
    });
  });

  it("filtra e resume candidaturas prontas e pendentes", () => {
    const items = buildReadinessCenterItems(
      sources({
        applications: [
          application("ready", {
            job_url: "https://example.com/job",
            notes: "Contexto",
          }),
          application("empty"),
        ],
        contacts: [{ application_id: "ready" }],
        technologies: [{ application_id: "ready" }],
        resumes: [{ application_id: "ready" }],
        reminders: [{ application_id: "ready" }],
      }),
      NOW,
    );

    expect(filterReadinessCenterItems(items, "incomplete")).toHaveLength(1);
    expect(filterReadinessCenterItems(items, "ready")).toHaveLength(1);
    expect(summarizeReadinessCenter(items)).toEqual({
      total: 2,
      incomplete: 1,
      ready: 1,
      averagePercentage: 50,
    });
  });

  it("normaliza filtros e ignora candidaturas arquivadas ou finais", () => {
    const items = buildReadinessCenterItems(
      sources({
        applications: [
          application("archived", {
            archived_at: "2026-08-26T12:00:00.000Z",
          }),
          application("hired", { status: "hired" }),
        ],
      }),
      NOW,
    );

    expect(items).toEqual([]);
    expect(normalizeReadinessCenterFilter("ready")).toBe("ready");
    expect(normalizeReadinessCenterFilter("unknown")).toBe("all");
    expect(normalizeReadinessCenterFilter()).toBe("all");
  });

  it("conta lacunas por candidatura aplicável, sem somar categorias entre si", () => {
    const items = buildReadinessCenterItems(
      sources({
        applications: [
          application("ready", {
            job_url: "https://example.com/job",
            notes: "Contexto",
          }),
          application("interview", { status: "technical_interview" }),
        ],
        contacts: [{ application_id: "ready" }],
        technologies: [{ application_id: "ready" }],
        resumes: [{ application_id: "ready" }],
        reminders: [{ application_id: "ready" }],
      }),
      NOW,
    );
    const gaps = summarizeReadinessGaps(items);

    expect(gaps.find((gap) => gap.key === "context")).toMatchObject({
      missing: 1,
      applicable: 2,
      percentage: 50,
    });
    expect(gaps.find((gap) => gap.key === "interview")).toMatchObject({
      missing: 1,
      applicable: 1,
      percentage: 100,
    });
    expect(gaps.some((gap) => gap.key === "offer")).toBe(false);
    expect(gaps.every((gap) => gap.missing <= gap.applicable)).toBe(true);
  });

  it("filtra por lacuna e aponta a ação da lacuna selecionada", () => {
    const items = buildReadinessCenterItems(
      sources({
        applications: [
          application("resume-missing", {
            job_url: "https://example.com/job",
            notes: "Contexto",
          }),
          application("complete", {
            job_url: "https://example.com/job",
            notes: "Contexto",
          }),
        ],
        resumes: [{ application_id: "complete" }],
      }),
      NOW,
    );
    const visible = filterReadinessCenterByGap(items, "resume");

    expect(visible.map((item) => item.application.id)).toEqual([
      "resume-missing",
    ]);
    expect(getReadinessActionGap(visible[0], "resume")).toMatchObject({
      key: "resume",
      href: "/dashboard/candidaturas/resume-missing#documentos",
    });
    expect(getReadinessActionGap(visible[0], "all")?.key).toBe("technologies");
    expect(normalizeReadinessGapFilter("resume")).toBe("resume");
    expect(normalizeReadinessGapFilter("unknown")).toBe("all");
  });
});
