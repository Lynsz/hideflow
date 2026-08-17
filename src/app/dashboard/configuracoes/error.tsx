"use client";

import { buttonStyles } from "@/components/ui/button";

export default function SettingsError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-xl font-semibold">
        Não foi possível abrir as configurações
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Verifique sua conexão e tente carregar a página novamente.
      </p>
      <button className={buttonStyles({ className: "mt-5" })} onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
