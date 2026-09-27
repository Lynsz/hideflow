import Link from "next/link";

export default function InterviewNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-xl font-semibold">Entrevista não encontrada</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        O registro não existe ou não está disponível para esta conta.
      </p>
      <Link
        className="text-accent mt-4 inline-block text-sm hover:underline"
        href="/dashboard/entrevistas"
      >
        Voltar para entrevistas
      </Link>
    </main>
  );
}
