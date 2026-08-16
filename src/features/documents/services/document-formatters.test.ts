import { describe, expect, it } from "vitest";

import { formatFileSize } from "@/features/documents/services/document-formatters";

describe("formatFileSize", () => {
  it.each([
    [512, "512 B"],
    [1536, "1.5 KB"],
    [2 * 1024 * 1024, "2.0 MB"],
  ])("formata %i bytes", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
