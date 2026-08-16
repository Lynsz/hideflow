import { describe, expect, it } from "vitest";

import { formatDateTimeForLocale } from "@/lib/date-time";

describe("date-time", () => {
  it("formata TIMESTAMPTZ em pt-BR no timezone informado", () => {
    const formatted = formatDateTimeForLocale(
      "2026-08-15T18:30:00.000Z",
      "UTC",
    );
    expect(formatted).toContain("15/08/2026");
    expect(formatted).toContain("18:30");
  });
});
