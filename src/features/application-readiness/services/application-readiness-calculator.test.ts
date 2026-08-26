import { describe, expect, it } from "vitest";

import { calculateApplicationReadiness } from "@/features/application-readiness/services/application-readiness-calculator";
import type { ApplicationReadinessInput } from "@/features/application-readiness/types/application-readiness";

const baseInput = (
  overrides: Partial<ApplicationReadinessInput> = {},
): ApplicationReadinessInput => ({
  id: "application-1",
  status: "applied",
  archivedAt: null,
  jobUrl: null,
  description: null,
  notes: null,
  contactsCount: 0,
  technologiesCount: 0,
  documents: [],
  reminders: [],
  interviews: [],
  hasOffer: false,
  now: "2026-08-26T12:00:00.000Z",
  ...overrides,
});

describe("application readiness calculator", () => {
  it("calcula os cinco pontos básicos de uma candidatura ativa", () => {
    const result = calculateApplicationReadiness(
      baseInput({
        jobUrl: "https://example.com/job",
        notes: "Indicação interna",
        contactsCount: 1,
        technologiesCount: 2,
        documents: [{ documentType: "resume" }],
        reminders: [{ completedAt: null }],
      }),
    );

    expect(result).toMatchObject({
      completed: 5,
      total: 5,
      percentage: 100,
      state: "ready",
    });
  });

  it("exige entrevista apenas nos estágios de entrevista", () => {
    const interviewStage = calculateApplicationReadiness(
      baseInput({ status: "technical_interview" }),
    );
    const screeningStage = calculateApplicationReadiness(
      baseInput({ status: "screening" }),
    );

    expect(interviewStage?.items.at(-1)).toMatchObject({
      key: "interview",
      complete: false,
    });
    expect(interviewStage?.total).toBe(6);
    expect(screeningStage?.items.some((item) => item.key === "interview")).toBe(
      false,
    );
  });

  it("exige proposta estruturada somente no estágio de proposta", () => {
    const withoutOffer = calculateApplicationReadiness(
      baseInput({ status: "offer" }),
    );
    const withOffer = calculateApplicationReadiness(
      baseInput({ status: "offer", hasOffer: true }),
    );

    expect(withoutOffer?.items.at(-1)).toMatchObject({
      key: "offer",
      complete: false,
    });
    expect(withOffer?.items.at(-1)).toMatchObject({
      key: "offer",
      complete: true,
    });
  });

  it("aceita lembrete pendente ou entrevista futura como próximo passo", () => {
    const completedReminder = calculateApplicationReadiness(
      baseInput({ reminders: [{ completedAt: "2026-08-25T12:00:00.000Z" }] }),
    );
    const futureInterview = calculateApplicationReadiness(
      baseInput({
        interviews: [
          {
            result: "scheduled",
            scheduledAt: "2026-08-27T12:00:00.000Z",
          },
        ],
      }),
    );
    const pastInterview = calculateApplicationReadiness(
      baseInput({
        interviews: [
          {
            result: "scheduled",
            scheduledAt: "2026-08-25T12:00:00.000Z",
          },
        ],
      }),
    );

    expect(
      completedReminder?.items.find((item) => item.key === "next_step")
        ?.complete,
    ).toBe(false);
    expect(
      futureInterview?.items.find((item) => item.key === "next_step"),
    ).toMatchObject({ complete: true, href: "#entrevistas" });
    expect(
      pastInterview?.items.find((item) => item.key === "next_step")?.complete,
    ).toBe(false);
  });

  it("não produz checklist para candidaturas arquivadas ou encerradas", () => {
    expect(
      calculateApplicationReadiness(
        baseInput({ archivedAt: "2026-08-20T12:00:00.000Z" }),
      ),
    ).toBeNull();
    expect(
      calculateApplicationReadiness(baseInput({ status: "hired" })),
    ).toBeNull();
  });
});
