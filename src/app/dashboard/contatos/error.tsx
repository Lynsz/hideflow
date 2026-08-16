"use client";
export default function ContactsError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-xl font-semibold">
        Não foi possível carregar os contatos
      </h1>
      <button
        className="text-accent mt-4 text-sm hover:underline"
        onClick={reset}
      >
        Tentar novamente
      </button>
    </main>
  );
}
