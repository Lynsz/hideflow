"use client";

import { RotateCcw } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";

export default function PrioritiesError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">
          Não foi possível carregar as prioridades
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Tente novamente em alguns instantes.
        </p>
        <button
          type="button"
          onClick={reset}
          className={buttonStyles({ className: "mt-5" })}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
