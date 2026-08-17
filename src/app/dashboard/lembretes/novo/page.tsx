import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { ReminderForm } from "@/features/reminders/components/reminder-form";
import { getReminderApplicationOptions } from "@/features/reminders/services/reminder-service";

export default async function NewReminderPage({
  searchParams,
}: {
  searchParams: Promise<{ application?: string }>;
}) {
  const [{ application = "" }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const applications = await getReminderApplicationOptions(user!.id);
  const selected = applications.some((item) => item.id === application)
    ? application
    : (applications[0]?.id ?? "");

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/lembretes"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para lembretes
      </Link>
      <header className="mt-5 mb-7">
        <h1 className="text-2xl font-semibold sm:text-3xl">Novo lembrete</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Defina o próximo passo e o prazo para realizá-lo.
        </p>
      </header>
      {applications.length ? (
        <ReminderForm
          applications={applications}
          defaultValues={{
            applicationId: selected,
            title: "",
            notes: "",
            dueAt: "",
          }}
        />
      ) : (
        <div className="border-border bg-surface rounded-xl border p-6 text-sm">
          Cadastre uma candidatura antes de criar um lembrete.
        </div>
      )}
    </main>
  );
}
