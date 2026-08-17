export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok", service: "hireflow" },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
