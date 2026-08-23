export default function GoalsLoading() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="bg-muted h-8 w-72 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-surface h-72 rounded-xl border"
          />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="border-border bg-surface h-96 rounded-xl border" />
        <div className="border-border bg-surface h-60 rounded-xl border" />
      </div>
      <span className="sr-only">Carregando metas</span>
    </main>
  );
}
