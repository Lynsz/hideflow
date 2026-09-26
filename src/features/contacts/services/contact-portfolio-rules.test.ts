import { describe, expect, it } from "vitest";

import {
  buildContactPortfolioItems,
  filterAndSortContactPortfolio,
  parseContactPortfolioFilters,
  summarizeContactPortfolio,
} from "@/features/contacts/services/contact-portfolio-rules";
import type {
  ContactPortfolioApplicationLink,
  ContactPortfolioContact,
  ContactPortfolioInterview,
} from "@/features/contacts/types/contact";

function contact(
  id: string,
  name: string,
  updatedAt: string,
): ContactPortfolioContact {
  return {
    id,
    company_id: "00000000-0000-4000-8000-000000000001",
    name,
    role: null,
    email: null,
    linkedin_url: null,
    contact_type: "recruiter",
    updated_at: updatedAt,
    company: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Acme",
    },
  };
}

function link(
  contactId: string,
  applicationId: string,
  status: ContactPortfolioApplicationLink["application"]["status"],
  updatedAt: string,
): ContactPortfolioApplicationLink {
  return {
    contact_id: contactId,
    application: {
      id: applicationId,
      job_title: `Vaga ${applicationId}`,
      status,
      archived_at: null,
      updated_at: updatedAt,
    },
  };
}

function interview(
  contactId: string,
  scheduledAt: string,
  updatedAt: string,
  result: ContactPortfolioInterview["result"] = "scheduled",
): ContactPortfolioInterview {
  return {
    contact_id: contactId,
    scheduled_at: scheduledAt,
    updated_at: updatedAt,
    result,
  };
}

describe("contact portfolio rules", () => {
  it("normaliza busca e descarta filtros inválidos", () => {
    expect(
      parseContactPortfolioFilters({
        q: "  Ana%, Silva  ",
        company: "not-a-uuid",
        type: "unknown",
        relationship: "unknown",
        sort: "unknown",
      }),
    ).toEqual({
      query: "Ana Silva",
      companyId: "",
      contactType: "",
      relationship: "all",
      sort: "name",
    });
  });

  it("agrega oportunidades, entrevistas e próxima agenda por contato", () => {
    const items = buildContactPortfolioItems(
      [contact("contact-a", "Ana", "2026-09-01T12:00:00Z")],
      [
        link(
          "contact-a",
          "app-1",
          "technical_interview",
          "2026-09-20T12:00:00Z",
        ),
        link("contact-a", "app-2", "rejected", "2026-09-18T12:00:00Z"),
      ],
      [
        interview("contact-a", "2026-09-28T12:00:00Z", "2026-09-22T12:00:00Z"),
        interview(
          "contact-a",
          "2026-09-27T12:00:00Z",
          "2026-09-23T12:00:00Z",
          "rescheduled",
        ),
      ],
      "2026-09-26T12:00:00Z",
    );

    expect(items[0]).toMatchObject({
      applicationCount: 2,
      activeApplicationCount: 1,
      interviewCount: 2,
      nextInterviewAt: "2026-09-27T12:00:00Z",
      lastActivityAt: "2026-09-23T12:00:00Z",
    });
    expect(items[0].latestApplication?.id).toBe("app-1");
  });

  it("filtra, ordena e resume somente o recorte visível", () => {
    const items = buildContactPortfolioItems(
      [
        contact("contact-a", "Ana", "2026-09-01T12:00:00Z"),
        contact("contact-b", "Bia", "2026-09-24T12:00:00Z"),
        contact("contact-c", "Caio", "2026-09-03T12:00:00Z"),
      ],
      [link("contact-a", "app-1", "screening", "2026-09-20T12:00:00Z")],
      [
        interview(
          "contact-c",
          "2026-09-25T12:00:00Z",
          "2026-09-22T12:00:00Z",
          "completed",
        ),
      ],
      "2026-09-26T12:00:00Z",
    );
    const unlinked = filterAndSortContactPortfolio(items, {
      query: "",
      companyId: "",
      contactType: "",
      relationship: "unlinked",
      sort: "activity",
    });

    expect(unlinked.map((item) => item.name)).toEqual(["Bia"]);
    expect(summarizeContactPortfolio(unlinked)).toEqual({
      totalContacts: 1,
      contactsWithActiveApplications: 0,
      interviewers: 0,
      unlinkedContacts: 1,
    });
  });
});
