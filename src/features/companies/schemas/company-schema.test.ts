import { describe, expect, it } from "vitest";

import { companySchema } from "@/features/companies/schemas/company-schema";

const validCompany = {
  name: "Acme",
  website: "https://acme.example",
  linkedinUrl: "",
  location: "São Paulo",
  notes: "",
};

describe("companySchema", () => {
  it("aceita uma empresa com URLs opcionais vazias", () => {
    expect(
      companySchema.safeParse({ ...validCompany, website: "" }).success,
    ).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const result = companySchema.safeParse({ ...validCompany, name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejeita URL incompleta", () => {
    const result = companySchema.safeParse({
      ...validCompany,
      website: "acme.example",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita protocolos inseguros", () => {
    const result = companySchema.safeParse({
      ...validCompany,
      website: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });
});
