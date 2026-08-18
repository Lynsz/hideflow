export default function SearchLoading() {
  return (
    <main className="mx-auto max-w-5xl animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="bg-muted h-8 w-48 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="bg-muted mt-6 h-11 rounded-lg" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="bg-muted h-4 w-28 rounded" />
            <div className="border-border bg-surface h-40 rounded-xl border" />
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando busca global</span>
    </main>
  );
}
