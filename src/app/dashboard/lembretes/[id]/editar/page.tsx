import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { ReminderForm } from "@/features/reminders/components/reminder-form";
import {
  getReminderApplicationOptions,
  getReminderById,
} from "@/features/reminders/services/reminder-service";

export default async function EditReminderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const [reminder, applications] = await Promise.all([
    getReminderById(user!.id, id),
    getReminderApplicationOptions(user!.id),
  ]);
  if (!reminder) notFound();

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
        <h1 className="text-2xl font-semibold sm:text-3xl">Editar lembrete</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Atualize o próximo passo ou ajuste o prazo.
        </p>
      </header>
      <ReminderForm
        reminderId={id}
        applications={applications}
        defaultDueAtIso={reminder.due_at}
        defaultValues={{
          applicationId: reminder.application_id,
          title: reminder.title,
          notes: reminder.notes ?? "",
          dueAt: "",
        }}
      />
    </main>
  );
}
