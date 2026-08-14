import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "@/features/auth/services/redirects";

describe("getSafeRedirectPath", () => {
  it("aceita somente caminhos internos", () => {
    expect(getSafeRedirectPath("/dashboard?view=active")).toBe(
      "/dashboard?view=active",
    );
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "dashboard",
    "/\\\\evil.example",
    "/%5C%5Cevil.example",
    "/%2F%2Fevil.example",
  ])("rejeita redirect externo ou inválido: %s", (value) => {
    expect(getSafeRedirectPath(value)).toBe("/dashboard");
  });
});
