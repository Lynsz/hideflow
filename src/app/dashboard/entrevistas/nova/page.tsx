import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getContactOptions } from "@/features/contacts/services/contact-service";
import { InterviewForm } from "@/features/interviews/components/interview-form";
import { getInterviewApplicationOptions } from "@/features/interviews/services/interview-service";

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ application?: string }>;
}) {
  const [{ application = "" }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const [applications, contacts] = await Promise.all([
    getInterviewApplicationOptions(user!.id),
    getContactOptions(user!.id),
  ]);
  const selected = applications.some((item) => item.id === application)
    ? application
    : (applications[0]?.id ?? "");
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/entrevistas"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" />
        Voltar para entrevistas
      </Link>
      <header className="mt-5 mb-7">
        <h1 className="text-2xl font-semibold sm:text-3xl">Nova entrevista</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Registre data, formato e entrevistador.
        </p>
      </header>
      {applications.length ? (
        <InterviewForm
          applications={applications}
          contacts={contacts}
          defaultValues={{
            applicationId: selected,
            type: "hr",
            scheduledAt: "",
            contactId: "",
            interviewerName: "",
            meetingUrl: "",
            notes: "",
            result: "scheduled",
          }}
        />
      ) : (
        <div className="border-border bg-surface rounded-xl border p-6 text-sm">
          Cadastre uma candidatura antes de agendar uma entrevista.
        </div>
      )}
    </main>
  );
}
