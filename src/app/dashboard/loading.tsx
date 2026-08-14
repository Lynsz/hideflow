export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-[1440px] animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <div className="bg-muted h-8 w-52 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-80 max-w-full rounded" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-surface h-36 rounded-xl border"
          />
        ))}
      </div>
      <div className="mt-3 grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        <div className="border-border bg-surface h-96 rounded-xl border" />
        <div className="border-border bg-surface h-96 rounded-xl border" />
      </div>
      <span className="sr-only">Carregando dashboard</span>
    </main>
  );
}
