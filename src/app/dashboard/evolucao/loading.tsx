export default function WeeklyEvolutionLoading() {
  return (
    <main className="mx-auto max-w-[1440px] animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <div className="bg-muted h-8 w-64 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-muted h-9 w-24 rounded-lg" />
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-muted h-32 rounded-xl" />
        ))}
      </div>
      <div className="bg-muted mt-4 h-80 rounded-xl" />
      <div className="bg-muted mt-4 h-72 rounded-xl" />
      <span className="sr-only">Carregando evolução semanal</span>
    </main>
  );
}
