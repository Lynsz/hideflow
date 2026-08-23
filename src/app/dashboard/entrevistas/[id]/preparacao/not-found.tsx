import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

export default function InterviewPreparationNotFound() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4 text-center">
      <div>
        <p className="text-muted-foreground text-xs font-medium">Erro 404</p>
        <h1 className="mt-2 text-xl font-semibold">
          Entrevista não encontrada
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          O registro não existe ou não está disponível para a sua conta.
        </p>
        <Link
          href="/dashboard/entrevistas"
          className={buttonStyles({ className: "mt-5" })}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para entrevistas
        </Link>
      </div>
    </main>
  );
}
