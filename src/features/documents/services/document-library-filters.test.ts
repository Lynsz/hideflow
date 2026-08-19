import { describe, expect, it } from "vitest";

import {
  buildDocumentLibraryUrl,
  parseDocumentLibraryFilters,
} from "@/features/documents/services/document-library-filters";

const companyId = "11111111-1111-4111-8111-111111111111";

describe("document library filters", () => {
  it("normaliza filtros válidos", () => {
    expect(
      parseDocumentLibraryFilters({
        q: "  Currículo, Front_End%  ",
        type: "resume",
        company: companyId,
        archive: "all",
        sort: "name",
        page: "3",
      }),
    ).toEqual({
      query: "Currículo Front End",
      documentType: "resume",
      companyId,
      archive: "all",
      sort: "name",
      page: 3,
    });
  });

  it("descarta enums, UUID e página inválidos", () => {
    expect(
      parseDocumentLibraryFilters({
        type: "executable",
        company: "other-user",
        archive: "deleted",
        sort: "size",
        page: "-2",
      }),
    ).toEqual({
      query: "",
      documentType: "",
      companyId: "",
      archive: "active",
      sort: "recent",
      page: 1,
    });
  });

  it("gera URL previsível e reinicia a paginação", () => {
    const filters = parseDocumentLibraryFilters({
      q: "currículo",
      type: "resume",
      company: companyId,
      archive: "archived",
      sort: "oldest",
      page: "4",
    });

    expect(buildDocumentLibraryUrl(filters, { page: 1 })).toBe(
      `/dashboard/documentos?q=curr%C3%ADculo&type=resume&company=${companyId}&archive=archived&sort=oldest`,
    );
  });
});
