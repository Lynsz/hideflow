export default function AgendaLoading() {
  return (
    <main className="mx-auto max-w-5xl animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="bg-muted h-8 w-40 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="border-border bg-surface mt-6 h-28 rounded-xl border" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-surface h-32 rounded-xl border"
          />
        ))}
      </div>
      <span className="sr-only">Carregando agenda</span>
    </main>
  );
}
