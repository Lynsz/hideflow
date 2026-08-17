export default function AnalyticsLoading() {
  return (
    <main className="mx-auto max-w-[1440px] animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <div className="bg-muted h-8 w-44 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="border-border bg-surface mt-6 h-28 rounded-xl border" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-muted h-28 rounded-xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="border-border bg-surface h-80 rounded-xl border" />
        <div className="border-border bg-surface h-80 rounded-xl border" />
      </div>
      <span className="sr-only">Carregando Analytics</span>
    </main>
  );
}
