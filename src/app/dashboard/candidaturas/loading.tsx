export default function ApplicationsLoading() {
  return (
    <main className="mx-auto max-w-[1440px] animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <div className="bg-muted h-8 w-56 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-96 max-w-full rounded" />
      <div className="border-border bg-surface mt-7 h-40 rounded-xl border" />
      <div className="border-border bg-surface mt-5 h-96 rounded-xl border" />
      <span className="sr-only">Carregando candidaturas</span>
    </main>
  );
}
