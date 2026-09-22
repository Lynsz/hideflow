import Link from "next/link";

export default function CompanyNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-xl font-semibold">Empresa não encontrada</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        O registro não existe ou não está disponível para a sua conta.
      </p>
      <Link
        className="text-accent mt-4 inline-block text-sm hover:underline"
        href="/dashboard/empresas"
      >
        Voltar para empresas
      </Link>
    </main>
  );
}
