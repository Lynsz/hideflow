import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  Columns3,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

const benefits = [
  { icon: Columns3, label: "Pipeline visual" },
  { icon: BarChart3, label: "Métricas úteis" },
  { icon: ShieldCheck, label: "Dados privados" },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden">
      <header className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav
          className="flex items-center gap-1"
          aria-label="Navegação principal"
        >
          <Link
            href="/login"
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            Entrar
          </Link>
          <Link href="/cadastro" className={buttonStyles({ size: "sm" })}>
            Criar conta
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-20 pb-8 text-center sm:px-8 sm:pt-28">
        <div className="border-border bg-surface text-muted-foreground mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
          <span className="bg-accent size-1.5 rounded-full" />
          Seu processo seletivo, em um só fluxo
        </div>
        <h1 className="mx-auto mt-7 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
          Sua busca por emprego, com menos caos e mais clareza.
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg">
          Organize candidaturas, acompanhe cada etapa e saiba exatamente qual é
          o próximo passo — sem depender de planilhas soltas.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className={buttonStyles({
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            Começar gratuitamente
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/dashboard"
            className={buttonStyles({
              variant: "secondary",
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            Ver demonstração
          </Link>
        </div>

        <ul className="text-muted-foreground mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
          {["Sem cartão", "Dados isolados por usuário", "Responsivo"].map(
            (item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <Check className="text-accent size-3.5" aria-hidden="true" />
                {item}
              </li>
            ),
          )}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-12 pb-24 sm:px-8">
        <div className="border-border bg-surface relative rounded-2xl border p-2 shadow-2xl shadow-black/30">
          <div className="border-border flex h-10 items-center gap-1.5 border-b px-3">
            <span className="size-2 rounded-full bg-[#3a414b]" />
            <span className="size-2 rounded-full bg-[#3a414b]" />
            <span className="size-2 rounded-full bg-[#3a414b]" />
            <span className="text-muted-foreground ml-3 text-[11px]">
              app.hireflow.dev/dashboard
            </span>
          </div>
          <div className="grid min-h-[390px] grid-cols-1 md:grid-cols-[190px_1fr]">
            <aside className="border-border hidden border-r p-4 md:block">
              <Logo href="/dashboard" />
              <div className="mt-8 space-y-2">
                {["Visão geral", "Candidaturas", "Kanban", "Entrevistas"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className={`rounded-md px-3 py-2 text-left text-xs ${
                        index === 0
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </aside>
            <div className="p-5 text-left sm:p-7">
              <p className="text-muted-foreground text-xs">Visão geral</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Bom dia, Marina
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ["Candidaturas", "24"],
                  ["Entrevistas", "5"],
                  ["Propostas", "2"],
                  ["Taxa de avanço", "31%"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="border-border bg-background rounded-xl border p-4"
                  >
                    <p className="text-muted-foreground text-[11px]">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
                <div className="border-border bg-background rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">Atividade recente</p>
                    <BriefcaseBusiness
                      className="text-muted-foreground size-4"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Product Designer · Nubank",
                      "Frontend Engineer · Vercel",
                      "Full Stack Developer · Acme",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="border-border flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-foreground text-xs">{item}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {index + 1}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-border bg-background rounded-xl border p-4">
                  <p className="text-xs font-medium">Pipeline</p>
                  <div className="mt-5 flex h-28 items-end gap-2">
                    {[42, 68, 52, 88, 63, 74, 55].map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className="bg-accent/75 flex-1 rounded-sm"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {benefits.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="border-border bg-surface/60 flex items-center gap-3 rounded-xl border p-4"
            >
              <span className="bg-muted grid size-9 place-items-center rounded-lg">
                <Icon className="text-accent size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
