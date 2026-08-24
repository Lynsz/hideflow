import { ArrowLeft, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { InterviewDebriefForm } from "@/features/interview-debrief/components/interview-debrief-form";
import {
  getInterviewDebrief,
  toInterviewDebriefValues,
} from "@/features/interview-debrief/services/interview-debrief-service";
import { InterviewWorkspaceContext } from "@/features/interviews/components/interview-workspace-context";
import { InterviewWorkspaceNavigation } from "@/features/interviews/components/interview-workspace-navigation";
import { getInterviewById } from "@/features/interviews/services/interview-service";

export const metadata: Metadata = { title: "Retrospectiva da entrevista" };

const interviewIdSchema = z.uuid();

export default async function InterviewDebriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const parsedId = interviewIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const [interview, debrief] = await Promise.all([
    getInterviewById(user!.id, parsedId.data),
    getInterviewDebrief(user!.id, parsedId.data),
  ]);
  if (!interview) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/entrevistas"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para entrevistas
      </Link>

      <header className="mt-5">
        <p className="text-muted-foreground text-xs font-medium">
          Aprendizado individual
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Registre sua retrospectiva
          <MessageSquareText
            className="text-accent size-5"
            aria-hidden="true"
          />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Capture impressões enquanto estão frescas e transforme cada conversa
          em aprendizado para a próxima etapa.
        </p>
      </header>

      <InterviewWorkspaceContext interview={interview} />
      <InterviewWorkspaceNavigation
        interviewId={parsedId.data}
        active="debrief"
      />

      <div className="mt-4">
        <InterviewDebriefForm
          interviewId={parsedId.data}
          defaultValues={toInterviewDebriefValues(debrief)}
          thankYouSentAt={debrief?.thank_you_sent_at ?? null}
        />
      </div>
    </main>
  );
}
