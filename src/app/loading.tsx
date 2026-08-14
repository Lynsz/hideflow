export default function Loading() {
  return (
    <div
      className="bg-background grid min-h-dvh place-items-center"
      role="status"
    >
      <div className="text-muted-foreground flex items-center gap-3 text-sm">
        <span className="border-border border-t-accent size-4 animate-spin rounded-full border-2" />
        Carregando HireFlow…
      </div>
    </div>
  );
}
