import { describe, expect, it } from "vitest";

import { normalizeTechnologyName } from "@/features/technologies/services/technology-normalizer";

describe("normalizeTechnologyName", () => {
  it("remove espaços externos, colapsa espaços internos e normaliza caixa", () => {
    expect(normalizeTechnologyName("  React   Native  ")).toEqual({
      name: "React Native",
      normalizedName: "react native",
    });
  });

  it("preserva símbolos relevantes do nome", () => {
    expect(normalizeTechnologyName("C#")).toEqual({
      name: "C#",
      normalizedName: "c#",
    });
    expect(normalizeTechnologyName(".NET")).toEqual({
      name: ".NET",
      normalizedName: ".net",
    });
  });
});
