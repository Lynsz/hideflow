import { describe, expect, it } from "vitest";

import { summarizeCompanyApplications } from "@/features/companies/services/company-detail-rules";
import type { CompanyDetailApplication } from "@/features/companies/types/company";

function application(
  status: CompanyDetailApplication["status"],
  archivedAt: string | null = null,
): CompanyDetailApplication {
  return {
    id: `${status}-${archivedAt ?? "active"}`,
    job_title: "Frontend Developer",
    status,
    location: null,
    work_mode: null,
    applied_at: null,
    archived_at: archivedAt,
    updated_at: "2026-09-22T12:00:00Z",
  };
}

describe("summarizeCompanyApplications", () => {
  it("resume candidaturas ativas, em entrevista e contratações", () => {
    const summary = summarizeCompanyApplications([
      application("applied"),
      application("technical_interview"),
      application("hired"),
      application("rejected"),
    ]);

    expect(summary).toEqual({
      analyzed: 4,
      active: 2,
      interviewStage: 1,
      hired: 1,
    });
  });

  it("não conta candidaturas arquivadas como ativas ou em entrevista", () => {
    const summary = summarizeCompanyApplications([
      application("hr_interview", "2026-09-20T12:00:00Z"),
      application("offer", "2026-09-21T12:00:00Z"),
    ]);

    expect(summary.active).toBe(0);
    expect(summary.interviewStage).toBe(0);
    expect(summary.analyzed).toBe(2);
  });

  it("preserva contratações históricas mesmo quando arquivadas", () => {
    const summary = summarizeCompanyApplications([
      application("hired", "2026-09-22T12:00:00Z"),
    ]);

    expect(summary.hired).toBe(1);
  });
});
