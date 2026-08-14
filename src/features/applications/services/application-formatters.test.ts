import { describe, expect, it } from "vitest";

import {
  formatEmploymentType,
  formatSalary,
  formatStatus,
  formatWorkMode,
} from "@/features/applications/services/application-formatters";

describe("application formatters", () => {
  it("centraliza os labels da interface", () => {
    expect(formatStatus("technical_interview")).toBe("Entrevista técnica");
    expect(formatWorkMode("hybrid")).toBe("Híbrido");
    expect(formatEmploymentType("temporary")).toBe("Temporário");
  });

  it("formata uma faixa salarial", () => {
    expect(
      formatSalary({ salary_min: 5000, salary_max: 8000, currency: "BRL" }),
    ).toContain("5.000");
  });
});
