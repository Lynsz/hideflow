export default function InterviewLearningsLoading() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="bg-muted h-8 w-72 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-muted h-32 rounded-xl" />
        ))}
      </div>
      <div className="bg-muted mt-4 h-44 rounded-xl" />
      <div className="bg-muted mt-4 h-36 rounded-xl" />
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="bg-muted h-72 rounded-xl" />
        <div className="bg-muted h-72 rounded-xl" />
      </div>
      <span className="sr-only">Carregando aprendizados</span>
    </main>
  );
}
