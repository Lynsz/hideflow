import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";

type AuthShellProps = {
  title: string;
  description: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthShellProps) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <section className="flex min-h-dvh flex-col px-5 py-5 sm:px-10 sm:py-8 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-16">
          <p className="text-accent mb-3 text-xs font-semibold tracking-[0.16em] uppercase">
            Acesso seguro
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            {description}
          </p>

          <div className="mt-8">{children}</div>

          <p className="text-muted-foreground mt-7 text-center text-sm">
            {footerText}{" "}
            <Link
              className="text-foreground hover:text-accent font-medium"
              href={footerLinkHref}
            >
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </section>

      <aside className="border-border bg-surface relative hidden overflow-hidden border-l lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#252a3133_1px,transparent_1px),linear-gradient(to_bottom,#252a3133_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_80%)] bg-[size:44px_44px]" />
        <div className="border-border bg-background/80 text-muted-foreground relative ml-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
          <LockKeyhole className="text-accent size-3.5" aria-hidden="true" />
          Seus dados permanecem privados
        </div>

        <div className="relative max-w-lg">
          <blockquote className="text-foreground text-3xl leading-tight font-medium tracking-[-0.04em]">
            “Organização transforma uma busca cansativa em um processo que você
            consegue conduzir.”
          </blockquote>
          <p className="text-muted-foreground mt-6 text-sm">
            Seu próximo passo, com clareza.
          </p>
        </div>
      </aside>
    </main>
  );
}
