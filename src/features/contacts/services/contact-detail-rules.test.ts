import { describe, expect, it } from "vitest";

import { summarizeContactRelationship } from "@/features/contacts/services/contact-detail-rules";
import type {
  ContactApplication,
  ContactInterview,
} from "@/features/contacts/types/contact";

function application(
  status: ContactApplication["status"],
  archivedAt: string | null = null,
): ContactApplication {
  return {
    id: `${status}-${archivedAt ?? "active"}`,
    job_title: "Frontend Developer",
    status,
    archived_at: archivedAt,
    updated_at: "2026-09-24T12:00:00Z",
  };
}

function interview(
  result: ContactInterview["result"],
  scheduledAt: string,
): ContactInterview {
  return {
    id: `${result}-${scheduledAt}`,
    application_id: "application-1",
    type: "technical",
    scheduled_at: scheduledAt,
    meeting_url: null,
    result,
    application: {
      id: "application-1",
      job_title: "Frontend Developer",
      status: "technical_interview",
    },
  };
}

describe("summarizeContactRelationship", () => {
  it("resume candidaturas ativas e entrevistas futuras", () => {
    expect(
      summarizeContactRelationship(
        [
          application("applied"),
          application("rejected"),
          application("offer", "2026-09-20T12:00:00Z"),
        ],
        [
          interview("scheduled", "2026-09-25T12:00:00Z"),
          interview("rescheduled", "2026-09-24T12:00:00Z"),
          interview("completed", "2026-09-23T12:00:00Z"),
        ],
        "2026-09-24T12:00:00Z",
      ),
    ).toEqual({
      analyzedApplications: 3,
      activeApplications: 1,
      analyzedInterviews: 3,
      upcomingInterviews: 2,
    });
  });

  it("não conta entrevista pendente que já ficou no passado", () => {
    const summary = summarizeContactRelationship(
      [],
      [interview("scheduled", "2026-09-23T23:59:59Z")],
      "2026-09-24T00:00:00Z",
    );

    expect(summary.upcomingInterviews).toBe(0);
    expect(summary.analyzedInterviews).toBe(1);
  });
});
