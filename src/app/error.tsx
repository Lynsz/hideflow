"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { buttonStyles } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center p-5">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold text-red-400">
          Algo não saiu como esperado
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Não foi possível carregar esta página.
        </h1>
        <p className="text-muted-foreground mt-4 text-sm leading-6">
          Tente novamente. Se o problema continuar, volte em alguns instantes.
        </p>
        <button
          type="button"
          onClick={reset}
          className={buttonStyles({ className: "mt-7" })}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
