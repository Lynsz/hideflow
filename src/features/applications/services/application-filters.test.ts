import { describe, expect, it } from "vitest";

import {
  buildApplicationListUrl,
  parseApplicationFilters,
  sanitizeSearchTerm,
} from "@/features/applications/services/application-filters";

describe("application filters", () => {
  it("normaliza filtros válidos e a página", () => {
    expect(
      parseApplicationFilters({
        q: "  Frontend  ",
        status: "applied",
        workMode: "remote",
        employmentType: "clt",
        company: "company-id",
        archive: "archived",
        sort: "job",
        page: "2",
      }),
    ).toEqual({
      query: "Frontend",
      status: "applied",
      workMode: "remote",
      employmentType: "clt",
      companyId: "company-id",
      archive: "archived",
      sort: "job",
      page: 2,
    });
  });

  it("descarta enums inválidos e páginas negativas", () => {
    const filters = parseApplicationFilters({
      status: "invalid",
      workMode: "invalid",
      employmentType: "invalid",
      sort: "invalid",
      archive: "invalid",
      page: "-3",
    });

    expect(filters).toMatchObject({
      status: "",
      workMode: "",
      employmentType: "",
      sort: "recent",
      archive: "active",
      page: 1,
    });
  });

  it("remove operadores do filtro PostgREST da busca", () => {
    expect(sanitizeSearchTerm("Acme,job_title.eq.secret(*)")).toBe(
      "Acme job title eq secret",
    );
  });

  it("preserva filtros ao gerar a URL da próxima página", () => {
    const filters = parseApplicationFilters({
      q: "Frontend",
      status: "screening",
      archive: "all",
      page: "1",
    });

    expect(buildApplicationListUrl(filters, { page: 2 })).toBe(
      "/dashboard/candidaturas?q=Frontend&status=screening&archive=all&page=2",
    );
  });
});
