export default function CompaniesLoading() {
  return (
    <main className="mx-auto max-w-[1440px] animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <div className="bg-muted h-8 w-48 rounded-lg" />
      <div className="bg-muted mt-3 h-4 w-80 max-w-full rounded" />
      <div className="bg-muted mt-7 h-11 rounded-lg" />
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border-border bg-surface h-48 rounded-xl border" />
        ))}
      </div>
      <span className="sr-only">Carregando empresas</span>
    </main>
  );
}
