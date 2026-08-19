import { describe, expect, it } from "vitest";

import {
  formatOfferDate,
  formatOfferSalary,
  getAnnualBaseSalary,
} from "@/features/offers/services/offer-formatters";

describe("offer formatters", () => {
  it("formata salário preservando moeda e periodicidade", () => {
    const result = formatOfferSalary({
      salary_amount: 12000,
      salary_period: "monthly",
      currency: "BRL",
    });
    expect(result).toContain("12.000,00");
    expect(result).toContain("por mês");
  });

  it("formata datas civis sem deslocamento de timezone", () => {
    expect(formatOfferDate("2026-08-19")).toBe("19/08/2026");
    expect(formatOfferDate(null)).toBe("Não informado");
  });

  it("anualiza somente remunerações mensais", () => {
    expect(
      getAnnualBaseSalary({ salary_amount: 10000, salary_period: "monthly" }),
    ).toBe(120000);
    expect(
      getAnnualBaseSalary({ salary_amount: 120000, salary_period: "annual" }),
    ).toBe(120000);
  });
});
