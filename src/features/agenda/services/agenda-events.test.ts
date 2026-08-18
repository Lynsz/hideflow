import { describe, expect, it } from "vitest";

import { orderAgendaEvents } from "@/features/agenda/services/agenda-events";
import type { AgendaEvent } from "@/features/agenda/types/agenda";

function event(
  id: string,
  scheduledAt: string,
  kind: AgendaEvent["kind"] = "reminder",
): AgendaEvent {
  return {
    id,
    kind,
    title: id,
    description: "Vaga · Empresa",
    scheduledAt,
    href: `/event/${id}`,
    applicationHref: "/application/1",
    meetingUrl: null,
    interviewType: null,
    isOverdue: false,
  };
}

describe("orderAgendaEvents", () => {
  const items = [
    event("later", "2026-08-22T12:00:00.000Z"),
    event("earlier", "2026-08-20T12:00:00.000Z"),
    event("same", "2026-08-20T12:00:00.000Z", "interview"),
  ];

  it("ordena próximos itens do mais cedo para o mais tarde", () => {
    expect(orderAgendaEvents(items).map((item) => item.id)).toEqual([
      "same",
      "earlier",
      "later",
    ]);
  });

  it("ordena atrasados do mais recente para o mais antigo e respeita limite", () => {
    expect(orderAgendaEvents(items, true, 2).map((item) => item.id)).toEqual([
      "later",
      "same",
    ]);
  });

  it("não altera o array recebido", () => {
    const original = [...items];
    orderAgendaEvents(items);
    expect(items).toEqual(original);
  });
});
