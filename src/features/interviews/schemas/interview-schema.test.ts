import { describe, expect, it } from "vitest";

import { interviewMutationSchema } from "@/features/interviews/schemas/interview-schema";

const valid = {
  applicationId: crypto.randomUUID(),
  type: "technical",
  scheduledAt: "2026-08-15T18:00:00.000Z",
  contactId: "",
  interviewerName: "Ana",
  meetingUrl: "https://meet.example.com/a",
  notes: "",
  result: "scheduled",
};
describe("interviewMutationSchema", () => {
  it("aceita entrevista válida", () =>
    expect(interviewMutationSchema.safeParse(valid).success).toBe(true));
  it("aceita data passada", () =>
    expect(
      interviewMutationSchema.safeParse({
        ...valid,
        scheduledAt: "2020-01-01T10:00:00.000Z",
      }).success,
    ).toBe(true));
  it("exige candidatura", () =>
    expect(
      interviewMutationSchema.safeParse({ ...valid, applicationId: "" })
        .success,
    ).toBe(false));
  it("rejeita tipo e resultado desconhecidos", () => {
    expect(
      interviewMutationSchema.safeParse({ ...valid, type: "chat" }).success,
    ).toBe(false);
    expect(
      interviewMutationSchema.safeParse({ ...valid, result: "maybe" }).success,
    ).toBe(false);
  });
  it("rejeita data e link inválidos", () => {
    expect(
      interviewMutationSchema.safeParse({ ...valid, scheduledAt: "amanhã" })
        .success,
    ).toBe(false);
    expect(
      interviewMutationSchema.safeParse({ ...valid, meetingUrl: "meet" })
        .success,
    ).toBe(false);
  });
});
