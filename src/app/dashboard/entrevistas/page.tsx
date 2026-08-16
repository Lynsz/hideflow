import { Plus } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { InterviewCard } from "@/features/interviews/components/interview-card";
import { getInterviews } from "@/features/interviews/services/interview-service";

const feedbacks: Record<string, string> = {
  created: "Entrevista criada com sucesso.",
  updated: "Entrevista atualizada com sucesso.",
  result: "Resultado da entrevista atualizado.",
  deleted: "Entrevista excluída com sucesso.",
};
export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ feedback?: string }>;
}) {
  const [{ feedback = "" }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const { items: interviews, now } = await getInterviews(user!.id);
  const upcoming = interviews.filter(
    (item) =>
      item.scheduled_at >= now &&
      ["scheduled", "rescheduled"].includes(item.result),
  );
  const past = interviews.filter((item) => !upcoming.includes(item)).reverse();
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">Agenda</p>
          <h1 className="mt-1.5 text-2xl font-semibold sm:text-3xl">
            Entrevistas
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Acompanhe agenda, entrevistadores e resultados.
          </p>
        </div>
        <Link href="/dashboard/entrevistas/nova" className={buttonStyles()}>
          <Plus className="size-4" />
          Nova entrevista
        </Link>
      </header>
      {feedbacks[feedback] && (
        <div className="mt-6">
          <FormFeedback kind="success" message={feedbacks[feedback]} />
        </div>
      )}
      <section className="mt-8">
        <h2 className="text-lg font-medium">Próximas entrevistas</h2>
        {upcoming.length ? (
          <div className="mt-4 space-y-3">
            {upcoming.map((item) => (
              <InterviewCard key={item.id} interview={item} />
            ))}
          </div>
        ) : (
          <div className="border-border bg-surface mt-4 rounded-xl border">
            <EmptyState
              title="Nenhuma entrevista agendada"
              description="Agende uma entrevista para vê-la nesta seção."
            />
          </div>
        )}
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-medium">Entrevistas anteriores</h2>
        {past.length ? (
          <div className="mt-4 space-y-3">
            {past.map((item) => (
              <InterviewCard key={item.id} interview={item} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            Nenhuma entrevista anterior.
          </p>
        )}
      </section>
    </main>
  );
}
