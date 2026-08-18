import { describe, expect, it } from "vitest";

import { SEARCH_QUERY_MAX_LENGTH } from "@/features/search/constants";
import {
  buildSearchPattern,
  normalizeSearchQuery,
} from "@/features/search/services/search-query";

describe("normalizeSearchQuery", () => {
  it("normaliza espaços e mantém termos úteis", () => {
    expect(normalizeSearchQuery("  Engenheiro   React  ")).toEqual({
      query: "Engenheiro React",
      canSearch: true,
      wasTruncated: false,
    });
  });

  it("usa apenas o primeiro valor quando a URL repete o parâmetro", () => {
    expect(normalizeSearchQuery(["TypeScript", "JavaScript"]).query).toBe(
      "TypeScript",
    );
  });

  it("remove caracteres reservados da sintaxe de filtros", () => {
    expect(normalizeSearchQuery("React*,_(Node):(JS)\\").query).toBe(
      "React Node JS",
    );
  });

  it("preserva caracteres comuns em tecnologias e contatos", () => {
    expect(normalizeSearchQuery("C++ C# dev@example.com").query).toBe(
      "C++ C# dev@example.com",
    );
  });

  it("exige dois caracteres úteis", () => {
    expect(normalizeSearchQuery("A").canSearch).toBe(false);
    expect(normalizeSearchQuery("UX").canSearch).toBe(true);
  });

  it("limita a consulta sem ultrapassar o contrato", () => {
    const result = normalizeSearchQuery(
      "a".repeat(SEARCH_QUERY_MAX_LENGTH + 5),
    );

    expect(result.query).toHaveLength(SEARCH_QUERY_MAX_LENGTH);
    expect(result.wasTruncated).toBe(true);
  });
});

describe("buildSearchPattern", () => {
  it("cria um padrão de correspondência parcial", () => {
    expect(buildSearchPattern("Produto")).toBe("*Produto*");
  });
});
