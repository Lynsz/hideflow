import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

export default function ApplicationNotFound() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4 text-center">
      <div>
        <BriefcaseBusiness
          className="text-accent mx-auto size-7"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-xl font-semibold">
          Candidatura não encontrada
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          O registro não existe ou não está disponível para a sua conta.
        </p>
        <Link
          href="/dashboard/candidaturas"
          className={buttonStyles({ className: "mt-5" })}
        >
          Voltar para candidaturas
        </Link>
      </div>
    </main>
  );
}
