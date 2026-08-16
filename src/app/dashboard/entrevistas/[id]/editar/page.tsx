import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getContactOptions } from "@/features/contacts/services/contact-service";
import { InterviewForm } from "@/features/interviews/components/interview-form";
import {
  getInterviewApplicationOptions,
  getInterviewById,
} from "@/features/interviews/services/interview-service";

export default async function EditInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const [interview, applications, contacts] = await Promise.all([
    getInterviewById(user!.id, id),
    getInterviewApplicationOptions(user!.id),
    getContactOptions(user!.id),
  ]);
  if (!interview) notFound();
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
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Editar entrevista
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Atualize a agenda ou registre o resultado.
        </p>
      </header>
      <InterviewForm
        interviewId={id}
        applications={applications}
        contacts={contacts}
        defaultScheduledAtIso={interview.scheduled_at}
        defaultValues={{
          applicationId: interview.application_id,
          type: interview.type,
          scheduledAt: "",
          contactId: interview.contact_id ?? "",
          interviewerName: interview.interviewer_name ?? "",
          meetingUrl: interview.meeting_url ?? "",
          notes: interview.notes ?? "",
          result: interview.result,
        }}
      />
    </main>
  );
}
