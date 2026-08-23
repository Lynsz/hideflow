export default function InterviewPreparationLoading() {
  return (
    <main className="mx-auto max-w-5xl animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="bg-muted h-8 w-72 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="border-border bg-surface mt-7 h-56 rounded-xl border" />
      <div className="border-border bg-surface mt-4 h-32 rounded-xl border" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-surface h-64 rounded-xl border"
          />
        ))}
      </div>
      <span className="sr-only">Carregando preparação da entrevista</span>
    </main>
  );
}
