"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import {
  fieldErrorStyles,
  labelStyles,
  textareaStyles,
} from "@/components/ui/form-styles";
import { saveInterviewPreparation } from "@/features/interview-preparation/actions";
import { INTERVIEW_PREPARATION_SECTIONS } from "@/features/interview-preparation/constants";
import {
  interviewPreparationSchema,
  type InterviewPreparationValues,
} from "@/features/interview-preparation/schemas/interview-preparation-schema";
import { calculateInterviewPreparationProgress } from "@/features/interview-preparation/services/interview-preparation-calculator";
import type { InterviewPreparationActionResult } from "@/features/interview-preparation/types/interview-preparation";

export function InterviewPreparationForm({
  interviewId,
  defaultValues,
}: {
  interviewId: string;
  defaultValues: InterviewPreparationValues;
}) {
  const router = useRouter();
  const [feedback, setFeedback] =
    useState<InterviewPreparationActionResult | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InterviewPreparationValues>({
    resolver: zodResolver(interviewPreparationSchema),
    defaultValues,
  });
  const watched = useWatch({ control });
  const currentValues: InterviewPreparationValues = {
    companyResearch: watched.companyResearch ?? "",
    roleAlignment: watched.roleAlignment ?? "",
    starStories: watched.starStories ?? "",
    questionsToAsk: watched.questionsToAsk ?? "",
    logisticsNotes: watched.logisticsNotes ?? "",
  };
  const progress = calculateInterviewPreparationProgress(currentValues);

  const onSubmit = async (values: InterviewPreparationValues) => {
    setFeedback(null);
    const result = await saveInterviewPreparation(interviewId, values);
    setFeedback(result);
    if (result.success) router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-medium">Progresso da preparação</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {progress.completed} de {progress.total} seções preenchidas
            </p>
          </div>
          <span className="text-accent text-2xl font-semibold">
            {progress.percentage}%
          </span>
        </div>
        <div className="bg-muted mt-4 h-2 overflow-hidden rounded-full">
          <div
            className="bg-accent h-full rounded-full transition-[width]"
            style={{ width: `${progress.percentage}%` }}
            role="progressbar"
            aria-label="Progresso da preparação"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percentage}
          />
        </div>
      </section>

      <div className="mt-4 space-y-4">
        {INTERVIEW_PREPARATION_SECTIONS.map((section, index) => {
          const value = currentValues[section.name];
          const complete = value.trim().length > 0;
          const error = errors[section.name]?.message;

          return (
            <section
              key={section.name}
              className="border-border bg-surface rounded-xl border p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold">
                  {complete ? (
                    <CheckCircle2
                      className="size-4 text-emerald-300"
                      aria-label="Seção preenchida"
                    />
                  ) : (
                    <Circle className="size-4" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <label
                    className={labelStyles}
                    htmlFor={`preparation-${section.name}`}
                  >
                    {index + 1}. {section.label}
                  </label>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {section.description}
                  </p>
                </div>
              </div>

              <textarea
                id={`preparation-${section.name}`}
                rows={section.name === "logisticsNotes" ? 4 : 7}
                maxLength={section.maxLength}
                placeholder={section.placeholder}
                disabled={isSubmitting}
                aria-invalid={Boolean(error)}
                aria-describedby={`preparation-${section.name}-help`}
                className={`${textareaStyles} mt-4`}
                {...register(section.name)}
              />
              <div
                id={`preparation-${section.name}-help`}
                className="mt-1.5 flex justify-between gap-3"
              >
                {error ? (
                  <span className={fieldErrorStyles} role="alert">
                    {error}
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-muted-foreground shrink-0 text-[11px]">
                  {value.length}/{section.maxLength}
                </span>
              </div>
            </section>
          );
        })}
      </div>

      {feedback ? (
        <div className="mt-4">
          <FormFeedback
            kind={feedback.success ? "success" : "error"}
            message={feedback.message}
          />
        </div>
      ) : null}

      <div className="border-border bg-background/90 sticky bottom-0 mt-4 flex justify-end border-t py-4 backdrop-blur">
        <button
          className={buttonStyles()}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Salvando…" : "Salvar preparação"}
        </button>
      </div>
    </form>
  );
}
