import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "@/lib/site-url";

describe("resolveSiteUrl", () => {
  it("prioriza a URL configurada", () => {
    expect(
      resolveSiteUrl({
        SITE_URL: "https://hireflow.example",
        VERCEL_PROJECT_PRODUCTION_URL: "hireflow.vercel.app",
      }).href,
    ).toBe("https://hireflow.example/");
  });

  it("usa o domínio de produção fornecido pela Vercel", () => {
    expect(
      resolveSiteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "hireflow.vercel.app",
      }).href,
    ).toBe("https://hireflow.vercel.app/");
  });

  it("usa localhost como fallback e bloqueia HTTP remoto", () => {
    expect(resolveSiteUrl({}).href).toBe("http://localhost:3000/");
    expect(resolveSiteUrl({ SITE_URL: "http://127.0.0.1:3000" }).href).toBe(
      "http://127.0.0.1:3000/",
    );
    expect(() =>
      resolveSiteUrl({ SITE_URL: "http://hireflow.example" }),
    ).toThrow("SITE_URL deve usar HTTPS fora do ambiente local.");
  });
});
