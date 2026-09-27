import { ArrowLeft, NotebookPen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { InterviewPreparationForm } from "@/features/interview-preparation/components/interview-preparation-form";
import {
  getInterviewPreparation,
  toInterviewPreparationValues,
} from "@/features/interview-preparation/services/interview-preparation-service";
import { InterviewWorkspaceContext } from "@/features/interviews/components/interview-workspace-context";
import { InterviewWorkspaceNavigation } from "@/features/interviews/components/interview-workspace-navigation";
import { getInterviewById } from "@/features/interviews/services/interview-service";

export const metadata: Metadata = { title: "Preparação da entrevista" };

const interviewIdSchema = z.uuid();

export default async function InterviewPreparationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const parsedId = interviewIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const [interview, preparation] = await Promise.all([
    getInterviewById(user!.id, parsedId.data),
    getInterviewPreparation(user!.id, parsedId.data),
  ]);
  if (!interview) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href={`/dashboard/entrevistas/${parsedId.data}`}
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para a visão geral
      </Link>

      <header className="mt-5">
        <p className="text-muted-foreground text-xs font-medium">
          Preparação individual
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Prepare sua entrevista
          <NotebookPen className="text-accent size-5" aria-hidden="true" />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Organize fatos, exemplos e perguntas para chegar ao encontro com mais
          clareza.
        </p>
      </header>

      <InterviewWorkspaceContext interview={interview} />
      <InterviewWorkspaceNavigation
        interviewId={parsedId.data}
        active="preparation"
      />

      <div className="mt-4">
        <InterviewPreparationForm
          interviewId={parsedId.data}
          defaultValues={toInterviewPreparationValues(preparation)}
        />
      </div>
    </main>
  );
}
