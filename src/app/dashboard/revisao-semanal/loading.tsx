export default function WeeklyReviewLoading() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="bg-muted h-8 w-64 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="bg-muted mt-6 h-20 rounded-xl" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-muted h-32 rounded-xl" />
        ))}
      </div>
      <div className="bg-muted mt-4 h-40 rounded-xl" />
      <div className="bg-muted mt-4 h-64 rounded-xl" />
      <span className="sr-only">Carregando revisão semanal</span>
    </main>
  );
}
