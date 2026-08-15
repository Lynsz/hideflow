export default function KanbanLoading() {
  return (
    <main className="min-w-0 animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <div className="bg-muted h-8 w-48 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-muted h-24 rounded-xl" />
        <div className="bg-muted h-24 rounded-xl" />
        <div className="bg-muted h-24 rounded-xl" />
      </div>
      <div className="border-border bg-surface mt-4 h-40 rounded-xl border" />
      <div className="mt-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-surface h-[28rem] w-72 shrink-0 rounded-xl border"
          />
        ))}
      </div>
      <span className="sr-only">Carregando Kanban</span>
    </main>
  );
}
