import type { AgendaEvent } from "@/features/agenda/types/agenda";

const encoder = new TextEncoder();

function escapeIcsText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

export function formatIcsTimestamp(value: string) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export function foldIcsLine(line: string) {
  const parts: string[] = [];
  let current = "";
  let byteLength = 0;
  let limit = 75;

  for (const character of line) {
    const characterLength = encoder.encode(character).length;
    if (byteLength + characterLength > limit && current) {
      parts.push(current);
      current = character;
      byteLength = characterLength;
      limit = 74;
    } else {
      current += character;
      byteLength += characterLength;
    }
  }

  parts.push(current);
  return parts.join("\r\n ");
}

export function serializeAgendaCalendar(
  events: AgendaEvent[],
  generatedAt: string,
) {
  const stamp = formatIcsTimestamp(generatedAt);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HireFlow//Agenda//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const event of events) {
    const start = new Date(event.scheduledAt);
    const durationMinutes = event.kind === "interview" ? 60 : 30;
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    const description = event.meetingUrl
      ? `${event.description}\nReunião: ${event.meetingUrl}`
      : event.description;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.kind}-${event.id}@hireflow`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${formatIcsTimestamp(event.scheduledAt)}`,
      `DTEND:${formatIcsTimestamp(end.toISOString())}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}
