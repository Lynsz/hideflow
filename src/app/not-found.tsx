import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col p-5 sm:p-8">
      <Logo />
      <section className="m-auto max-w-lg py-16 text-center">
        <p className="text-accent text-sm font-semibold">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">
          Esta página saiu do fluxo.
        </h1>
        <p className="text-muted-foreground mt-4 text-sm leading-6">
          O endereço pode estar incorreto ou a página ainda não faz parte desta
          etapa do HireFlow.
        </p>
        <Link
          href="/"
          className={buttonStyles({ variant: "secondary", className: "mt-7" })}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
