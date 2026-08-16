import { describe, expect, it } from "vitest";

import { contactSchema } from "@/features/contacts/schemas/contact-schema";

const valid = {
  name: "Ana",
  companyId: crypto.randomUUID(),
  role: "Recruiter",
  contactType: "recruiter",
  email: "ana@example.com",
  phone: "",
  linkedinUrl: "https://linkedin.com/in/ana",
  notes: "",
};

describe("contactSchema", () => {
  it("aceita um contato válido", () =>
    expect(contactSchema.safeParse(valid).success).toBe(true));
  it("exige nome e empresa", () =>
    expect(
      contactSchema.safeParse({ ...valid, name: "", companyId: "" }).success,
    ).toBe(false));
  it("rejeita email inválido", () =>
    expect(contactSchema.safeParse({ ...valid, email: "email" }).success).toBe(
      false,
    ));
  it("rejeita URL inválida", () =>
    expect(
      contactSchema.safeParse({ ...valid, linkedinUrl: "linkedin" }).success,
    ).toBe(false));
  it("rejeita tipo desconhecido", () =>
    expect(
      contactSchema.safeParse({ ...valid, contactType: "ceo" }).success,
    ).toBe(false));
});
