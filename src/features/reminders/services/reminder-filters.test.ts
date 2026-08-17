import { describe, expect, it } from "vitest";

import {
  getReminderState,
  normalizeReminderFilter,
} from "@/features/reminders/services/reminder-filters";

describe("normalizeReminderFilter", () => {
  it("mantém filtros conhecidos e usa próximos como padrão", () => {
    expect(normalizeReminderFilter("overdue")).toBe("overdue");
    expect(normalizeReminderFilter("completed")).toBe("completed");
    expect(normalizeReminderFilter("injected")).toBe("pending");
    expect(normalizeReminderFilter()).toBe("pending");
  });
});

describe("getReminderState", () => {
  const now = "2026-08-16T18:00:00.000Z";

  it("prioriza conclusão e separa próximos de atrasados", () => {
    expect(
      getReminderState(
        { due_at: "2020-01-01T00:00:00.000Z", completed_at: now },
        now,
      ),
    ).toBe("completed");
    expect(
      getReminderState(
        { due_at: "2026-08-16T17:59:59.000Z", completed_at: null },
        now,
      ),
    ).toBe("overdue");
    expect(
      getReminderState(
        { due_at: "2026-08-16T18:00:00.000Z", completed_at: null },
        now,
      ),
    ).toBe("pending");
  });
});
