export default function SettingsLoading() {
  return (
    <main className="mx-auto max-w-5xl animate-pulse px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="bg-muted h-8 w-52 rounded" />
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="bg-surface border-border h-72 rounded-xl border" />
          <div className="bg-surface border-border h-64 rounded-xl border" />
        </div>
        <div className="bg-surface border-border h-96 rounded-xl border" />
      </div>
    </main>
  );
}
