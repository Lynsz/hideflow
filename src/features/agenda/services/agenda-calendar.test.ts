import { describe, expect, it } from "vitest";

import {
  foldIcsLine,
  formatIcsTimestamp,
  serializeAgendaCalendar,
} from "@/features/agenda/services/agenda-calendar";
import type { AgendaEvent } from "@/features/agenda/types/agenda";

const event: AgendaEvent = {
  id: "event-1",
  kind: "interview",
  title: "Entrevista técnica, React; TypeScript",
  description: "Engenheira de Software · Acme",
  scheduledAt: "2026-08-20T15:30:00.000Z",
  href: "/dashboard/entrevistas/event-1/editar",
  applicationHref: "/dashboard/candidaturas/application-1",
  meetingUrl: "https://meet.example.com/room",
  interviewType: "technical",
  isOverdue: false,
};

describe("formatIcsTimestamp", () => {
  it("converte ISO para o formato UTC do iCalendar", () => {
    expect(formatIcsTimestamp("2026-08-20T15:30:45.123Z")).toBe(
      "20260820T153045Z",
    );
  });
});

describe("foldIcsLine", () => {
  it("limita linhas físicas a 75 octetos inclusive com UTF-8", () => {
    const folded = foldIcsLine(`DESCRIPTION:${"ação ".repeat(30)}`);
    const physicalLines = folded.split("\r\n");

    expect(physicalLines.length).toBeGreaterThan(1);
    expect(
      physicalLines.every(
        (line) => new TextEncoder().encode(line).length <= 75,
      ),
    ).toBe(true);
    expect(physicalLines.slice(1).every((line) => line.startsWith(" "))).toBe(
      true,
    );
  });
});

describe("serializeAgendaCalendar", () => {
  it("gera calendário compatível, escapa texto e inclui reunião", () => {
    const calendar = serializeAgendaCalendar(
      [event],
      "2026-08-18T12:00:00.000Z",
    );
    const unfolded = calendar.replaceAll("\r\n ", "");

    expect(calendar).toContain("BEGIN:VCALENDAR\r\n");
    expect(unfolded).toContain("DTSTART:20260820T153000Z");
    expect(unfolded).toContain("DTEND:20260820T163000Z");
    expect(unfolded).toContain(
      "SUMMARY:Entrevista técnica\\, React\\; TypeScript",
    );
    expect(unfolded).toContain("Reunião: https://meet.example.com/room");
    expect(calendar.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("usa duração menor para lembretes", () => {
    const calendar = serializeAgendaCalendar(
      [{ ...event, kind: "reminder", meetingUrl: null }],
      "2026-08-18T12:00:00.000Z",
    );

    expect(calendar).toContain("DTEND:20260820T160000Z");
  });
});
