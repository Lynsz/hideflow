import Link from "next/link";
export default function ContactNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-xl font-semibold">Contato não encontrado</h1>
      <Link
        className="text-accent mt-4 inline-block text-sm hover:underline"
        href="/dashboard/contatos"
      >
        Voltar para contatos
      </Link>
    </main>
  );
}
