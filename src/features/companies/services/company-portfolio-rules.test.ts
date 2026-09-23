import { describe, expect, it } from "vitest";

import {
  buildCompanyPortfolioItems,
  filterAndSortCompanyPortfolio,
  parseCompanyPortfolioFilters,
  summarizeCompanyPortfolio,
} from "@/features/companies/services/company-portfolio-rules";
import type {
  Company,
  CompanyPortfolioApplication,
  CompanyPortfolioContact,
} from "@/features/companies/types/company";

function company(id: string, name: string, updatedAt: string): Company {
  return {
    id,
    user_id: "user-1",
    name,
    website: null,
    linkedin_url: null,
    location: null,
    notes: null,
    created_at: updatedAt,
    updated_at: updatedAt,
  };
}

function application(
  id: string,
  companyId: string,
  status: CompanyPortfolioApplication["status"],
  updatedAt: string,
  archivedAt: string | null = null,
): CompanyPortfolioApplication {
  return {
    id,
    company_id: companyId,
    job_title: `Vaga ${id}`,
    status,
    archived_at: archivedAt,
    updated_at: updatedAt,
  };
}

describe("company portfolio rules", () => {
  it("normaliza filtros inválidos e neutraliza curingas da busca", () => {
    expect(
      parseCompanyPortfolioFilters({
        q: "  Acme%_\\  ",
        relationship: "invalid",
        sort: "invalid",
      }),
    ).toEqual({ query: "Acme", relationship: "all", sort: "name" });
  });

  it("agrega candidaturas, contatos e atividade por empresa", () => {
    const companies = [
      company("company-a", "Acme", "2026-09-01T10:00:00Z"),
      company("company-b", "Beta", "2026-09-02T10:00:00Z"),
    ];
    const applications = [
      application(
        "app-1",
        "company-a",
        "technical_interview",
        "2026-09-20T10:00:00Z",
      ),
      application("app-2", "company-a", "rejected", "2026-09-10T10:00:00Z"),
      application(
        "app-3",
        "company-b",
        "offer",
        "2026-09-21T10:00:00Z",
        "2026-09-22T10:00:00Z",
      ),
    ];
    const contacts: CompanyPortfolioContact[] = [
      {
        id: "contact-1",
        company_id: "company-a",
        updated_at: "2026-09-23T10:00:00Z",
      },
    ];

    const items = buildCompanyPortfolioItems(companies, applications, contacts);

    expect(items[0]).toMatchObject({
      name: "Acme",
      applicationCount: 2,
      activeApplicationCount: 1,
      contactCount: 1,
      lastActivityAt: "2026-09-23T10:00:00Z",
    });
    expect(items[0].latestApplication?.id).toBe("app-1");
    expect(items[1]).toMatchObject({
      applicationCount: 1,
      activeApplicationCount: 0,
      contactCount: 0,
    });
  });

  it("resume o portfólio e combina filtro com ordenação", () => {
    const items = buildCompanyPortfolioItems(
      [
        company("company-a", "Acme", "2026-09-01T10:00:00Z"),
        company("company-b", "Beta", "2026-09-22T10:00:00Z"),
        company("company-c", "Cora", "2026-09-03T10:00:00Z"),
      ],
      [
        application("app-1", "company-a", "screening", "2026-09-20T10:00:00Z"),
        application("app-2", "company-c", "rejected", "2026-09-21T10:00:00Z"),
      ],
      [],
    );

    expect(summarizeCompanyPortfolio(items)).toEqual({
      totalCompanies: 3,
      companiesWithActiveApplications: 1,
      activeApplications: 1,
      companiesWithContacts: 0,
    });
    expect(
      filterAndSortCompanyPortfolio(items, {
        query: "",
        relationship: "history",
        sort: "activity",
      }).map((item) => item.name),
    ).toEqual(["Cora"]);
    expect(
      filterAndSortCompanyPortfolio(items, {
        query: "",
        relationship: "all",
        sort: "activity",
      }).map((item) => item.name),
    ).toEqual(["Beta", "Cora", "Acme"]);
  });
});
