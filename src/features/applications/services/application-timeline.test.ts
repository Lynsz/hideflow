import { describe, expect, it } from "vitest";
import { buildApplicationTimeline } from "@/features/applications/services/application-timeline";
import type { ApplicationHistory } from "@/features/applications/types/application";
import type { InterviewEvent } from "@/features/interviews/types/interview";

const user = crypto.randomUUID();
const application = crypto.randomUUID();
const history: ApplicationHistory[] = [
  {
    id: "h1",
    user_id: user,
    application_id: application,
    from_status: "applied",
    to_status: "screening",
    created_at: "2026-02-02T10:00:00Z",
  },
];
const interviewEvents: InterviewEvent[] = [
  {
    id: "i1",
    user_id: user,
    application_id: application,
    interview_id: "x",
    event_type: "created",
    interview_type: "hr",
    result: "scheduled",
    scheduled_at: "2026-02-04T10:00:00Z",
    created_at: "2026-02-03T10:00:00Z",
  },
  {
    id: "i2",
    user_id: user,
    application_id: application,
    interview_id: "x",
    event_type: "completed",
    interview_type: "hr",
    result: "completed",
    scheduled_at: "2026-02-04T10:00:00Z",
    created_at: "2026-02-04T11:00:00Z",
  },
];
describe("buildApplicationTimeline", () => {
  it("combina criação, status e entrevistas do mais recente ao mais antigo", () =>
    expect(
      buildApplicationTimeline(
        "2026-02-01T10:00:00Z",
        history,
        interviewEvents,
      ).map((item) => item.id),
    ).toEqual([
      "interview-i2",
      "interview-i1",
      "status-h1",
      "application-created",
    ]));
  it("ordena timestamps iguais de forma determinística", () => {
    const result = buildApplicationTimeline(history[0].created_at, history, [
      { ...interviewEvents[0], created_at: history[0].created_at },
    ]);
    expect(result.map((item) => item.kind)).toEqual([
      "interview_event",
      "status_changed",
      "application_created",
    ]);
  });
  it("funciona sem entrevistas", () =>
    expect(
      buildApplicationTimeline("2026-02-01T10:00:00Z", history, []),
    ).toHaveLength(2));
  it("mantém a criação quando não há histórico", () =>
    expect(buildApplicationTimeline("2026-02-01T10:00:00Z", [], [])).toEqual([
      expect.objectContaining({ title: "Candidatura criada" }),
    ]));
});
