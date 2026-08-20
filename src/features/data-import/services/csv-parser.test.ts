import { describe, expect, it } from "vitest";

import { APPLICATION_IMPORT_HEADERS } from "@/features/data-import/constants";
import { parseApplicationsCsv } from "@/features/data-import/services/csv-parser";

function buildCsv(rows: string[][]) {
  return [APPLICATION_IMPORT_HEADERS, ...rows]
    .map((row) =>
      row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
}

const validRow = [
  "ignored-id",
  "Acme, Inc.",
  "Pessoa Desenvolvedora",
  "applied",
  "remote",
  "clt",
  "São Paulo",
  "8000,50",
  "10000",
  "BRL",
  "2026-08-20",
  "Indicação",
  "https://example.com/vaga",
  "TypeScript | React | typescript",
  "2026-08-20T00:00:00.000Z",
  "2026-08-20T00:00:00.000Z",
];

describe("parseApplicationsCsv", () => {
  it("interpreta o CSV exportado, aspas e tecnologias sem duplicação", () => {
    const result = parseApplicationsCsv(`\uFEFF${buildCsv([validRow])}`);

    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      expect.objectContaining({
        rowNumber: 2,
        companyName: "Acme, Inc.",
        jobTitle: "Pessoa Desenvolvedora",
        salaryMin: 8000.5,
        technologies: ["TypeScript", "React"],
      }),
    ]);
  });

  it("restaura o prefixo neutralizado pelo exportador sem executar conteúdo", () => {
    const row = [...validRow];
    row[2] = '\'=HYPERLINK("https://example.com")';
    const result = parseApplicationsCsv(buildCsv([row]));

    expect(result.errors).toEqual([]);
    expect(result.rows[0].jobTitle).toBe('=HYPERLINK("https://example.com")');
  });

  it("rejeita cabeçalho externo, CSV malformado e arquivo sem linhas", () => {
    expect(
      parseApplicationsCsv('"empresa","vaga"').errors[0].message,
    ).toContain("cabeçalho");
    expect(parseApplicationsCsv('"id').errors[0].message).toContain("aspas");
    expect(parseApplicationsCsv('"id"x').errors[0].message).toContain(
      "fechamento",
    );
    expect(
      parseApplicationsCsv(`${APPLICATION_IMPORT_HEADERS.join(",")}\n`)
        .errors[0].message,
    ).toContain("não possui candidaturas");
  });

  it("reporta a linha com enum, data, URL ou faixa salarial inválidos", () => {
    const invalid = [...validRow];
    invalid[3] = "unknown";
    invalid[10] = "2026-02-31";
    invalid[12] = "javascript:alert(1)";
    invalid[7] = "12000";
    invalid[8] = "9000";

    const result = parseApplicationsCsv(buildCsv([validRow, invalid]));

    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].rowNumber).toBe(3);
  });

  it("preserva quebras de linha dentro de células entre aspas", () => {
    const row = [...validRow];
    row[11] = "Evento\nComunidade";
    const result = parseApplicationsCsv(buildCsv([row]));

    expect(result.errors).toEqual([]);
    expect(result.rows[0].source).toBe("Evento\nComunidade");
  });

  it("preserva pipes e barras escapados nos nomes de tecnologias", () => {
    const row = [...validRow];
    row[13] = "Node\\|Bun | C\\\\C";
    const result = parseApplicationsCsv(buildCsv([row]));

    expect(result.errors).toEqual([]);
    expect(result.rows[0].technologies).toEqual(["Node|Bun", "C\\C"]);
  });

  it("limita o lote antes de montar os registros de importação", () => {
    const result = parseApplicationsCsv(
      buildCsv(Array.from({ length: 201 }, () => validRow)),
    );

    expect(result.rows).toEqual([]);
    expect(result.errors[0].message).toContain("200 candidaturas");
  });
});
