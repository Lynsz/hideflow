import { describe, expect, it } from "vitest";

import {
  buildInterviewPortfolioItems,
  filterAndSortInterviewPortfolio,
  parseInterviewPortfolioFilters,
  summarizeInterviewPortfolio,
} from "@/features/interviews/services/interview-portfolio-rules";
import type {
  InterviewListItem,
  InterviewPortfolioDebrief,
  InterviewPortfolioPreparation,
} from "@/features/interviews/types/interview";

function interview(
  id: string,
  scheduledAt: string,
  result: InterviewListItem["result"] = "scheduled",
  company = "Acme",
): InterviewListItem {
  return {
    id,
    application_id: `application-${id}`,
    type: "technical",
    scheduled_at: scheduledAt,
    interviewer_name: "Ana Silva",
    meeting_url: null,
    result,
    application: {
      id: `application-${id}`,
      job_title: `Frontend ${id}`,
      company_id: "00000000-0000-4000-8000-000000000001",
      company: {
        id: "00000000-0000-4000-8000-000000000001",
        name: company,
      },
    },
    contact: null,
  };
}

function completePreparation(
  interviewId: string,
): InterviewPortfolioPreparation {
  return {
    interview_id: interviewId,
    company_research: "Pesquisa",
    role_alignment: "Aderência",
    star_stories: "Histórias",
    questions_to_ask: "Perguntas",
    logistics_notes: "Logística",
  };
}

function partialDebrief(interviewId: string): InterviewPortfolioDebrief {
  return {
    interview_id: interviewId,
    overall_rating: 4,
    went_well: "Clareza",
    improve_next_time: null,
    questions_received: null,
    follow_up_notes: null,
    thank_you_sent_at: null,
  };
}

describe("interview portfolio rules", () => {
  it("normaliza a busca e descarta filtros inválidos", () => {
    expect(
      parseInterviewPortfolioFilters({
        q: "  Ana%, Silva  ",
        company: "not-a-uuid",
        type: "coffee",
        state: "late",
        focus: "unknown",
        sort: "unknown",
      }),
    ).toEqual({
      query: "Ana Silva",
      companyId: "",
      type: "",
      state: "all",
      focus: "all",
      sort: "next",
    });
  });

  it("deriva estado e progresso sem persistir contadores", () => {
    const items = buildInterviewPortfolioItems(
      [
        interview("future", "2026-10-03T12:00:00Z"),
        interview("past", "2026-09-29T12:00:00Z", "completed"),
      ],
      [completePreparation("future")],
      [partialDebrief("past")],
      "2026-10-01T12:00:00Z",
    );

    expect(items[0]).toMatchObject({
      state: "upcoming",
      preparationPercentage: 100,
      preparationPending: false,
      debriefPending: false,
    });
    expect(items[1]).toMatchObject({
      state: "finished",
      debriefCompleted: 2,
      debriefPercentage: 40,
      debriefPending: true,
      thankYouPending: true,
    });
  });

  it("classifica entrevistas passadas sem resultado como aguardando atualização", () => {
    const [item] = buildInterviewPortfolioItems(
      [interview("past", "2026-09-29T12:00:00Z", "rescheduled")],
      [],
      [],
      "2026-10-01T12:00:00Z",
    );

    expect(item.state).toBe("awaiting");
    expect(item.debriefPending).toBe(true);
  });

  it("filtra pendências, ordena próximas datas e resume o recorte", () => {
    const items = buildInterviewPortfolioItems(
      [
        interview("later", "2026-10-05T12:00:00Z"),
        interview("next", "2026-10-02T12:00:00Z"),
        interview("done", "2026-09-20T12:00:00Z", "passed"),
      ],
      [completePreparation("later")],
      [],
      "2026-10-01T12:00:00Z",
    );
    const filtered = filterAndSortInterviewPortfolio(items, {
      query: "",
      companyId: "",
      type: "",
      state: "all",
      focus: "preparation",
      sort: "next",
    });

    expect(filtered.map((item) => item.id)).toEqual(["next"]);
    expect(summarizeInterviewPortfolio(filtered)).toEqual({
      totalInterviews: 1,
      upcomingInterviews: 1,
      preparationPending: 1,
      debriefPending: 0,
    });
  });
});
