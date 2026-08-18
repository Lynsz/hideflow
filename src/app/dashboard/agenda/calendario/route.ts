import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { serializeAgendaCalendar } from "@/features/agenda/services/agenda-calendar";
import { parseAgendaFilters } from "@/features/agenda/services/agenda-filters";
import { getAgendaData } from "@/features/agenda/services/agenda-service";

export const dynamic = "force-dynamic";

const CALENDAR_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { error: "Autenticação necessária." },
        { status: 401, headers: CALENDAR_HEADERS },
      );
    }

    const filters = parseAgendaFilters(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const result = await getAgendaData(user.id, filters);
    const calendar = serializeAgendaCalendar(result.items, result.now);
    const date = result.now.slice(0, 10);

    return new Response(calendar, {
      headers: {
        ...CALENDAR_HEADERS,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="hireflow-agenda-${date}.ics"`,
      },
    });
  } catch {
    return Response.json(
      { error: "Não foi possível exportar a agenda." },
      { status: 500, headers: CALENDAR_HEADERS },
    );
  }
}
