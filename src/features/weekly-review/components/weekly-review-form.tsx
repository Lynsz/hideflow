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
import { LocalDateTime } from "@/components/ui/local-date-time";
import { saveWeeklyReview } from "@/features/weekly-review/actions";
import {
  WEEKLY_REVIEW_RATING_OPTIONS,
  WEEKLY_REVIEW_SECTIONS,
} from "@/features/weekly-review/constants";
import {
  weeklyReviewSchema,
  type WeeklyReviewValues,
} from "@/features/weekly-review/schemas/weekly-review-schema";
import { calculateWeeklyReviewProgress } from "@/features/weekly-review/services/weekly-review-calculator";
import type { WeeklyReviewActionResult } from "@/features/weekly-review/types/weekly-review";
import { cn } from "@/lib/utils";

export function WeeklyReviewForm({
  weekStart,
  defaultValues,
  completedAt,
}: {
  weekStart: string;
  defaultValues: WeeklyReviewValues;
  completedAt: string | null;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<WeeklyReviewActionResult | null>(
    null,
  );
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WeeklyReviewValues>({
    resolver: zodResolver(weeklyReviewSchema),
    defaultValues,
  });
  const watched = useWatch({ control });
  const currentValues: WeeklyReviewValues = {
    overallRating: watched.overallRating ?? "",
    wins: watched.wins ?? "",
    challenges: watched.challenges ?? "",
    lessons: watched.lessons ?? "",
    nextWeekFocus: watched.nextWeekFocus ?? "",
    completed: watched.completed ?? false,
  };
  const progress = calculateWeeklyReviewProgress(currentValues);

  const onSubmit = async (values: WeeklyReviewValues) => {
    setFeedback(null);
    const result = await saveWeeklyReview(weekStart, values);
    setFeedback(result);
    if (result.success) router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-medium">Progresso da revisão</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {progress.completed} de {progress.total} pontos registrados
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
            aria-label="Progresso da revisão semanal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percentage}
          />
        </div>
      </section>

      <fieldset className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
        <legend className="px-1 text-sm font-medium">
          Como você avalia o ritmo desta semana?
        </legend>
        <p className="text-muted-foreground mt-1 text-xs">
          Uma percepção pessoal, sem substituir os indicadores reais acima.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {WEEKLY_REVIEW_RATING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "border-border bg-background hover:border-accent/40 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-xs transition",
                currentValues.overallRating === option.value &&
                  "border-accent/60 bg-accent/5 text-accent",
              )}
            >
              <input
                type="radio"
                value={option.value}
                disabled={isSubmitting}
                className="accent-accent size-4"
                {...register("overallRating")}
              />
              <span>
                <strong className="block text-sm">{option.value}</strong>
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {errors.overallRating?.message ? (
          <p className={fieldErrorStyles} role="alert">
            {errors.overallRating.message}
          </p>
        ) : null}
      </fieldset>

      <div className="mt-4 space-y-4">
        {WEEKLY_REVIEW_SECTIONS.map((section, index) => {
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
                    htmlFor={`weekly-review-${section.name}`}
                  >
                    {index + 1}. {section.label}
                  </label>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {section.description}
                  </p>
                </div>
              </div>
              <textarea
                id={`weekly-review-${section.name}`}
                rows={section.name === "nextWeekFocus" ? 4 : 7}
                maxLength={section.maxLength}
                placeholder={section.placeholder}
                disabled={isSubmitting}
                aria-invalid={Boolean(error)}
                aria-describedby={`weekly-review-${section.name}-help`}
                className={`${textareaStyles} mt-4`}
                {...register(section.name)}
              />
              <div
                id={`weekly-review-${section.name}-help`}
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

      <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            disabled={isSubmitting}
            className="accent-accent mt-0.5 size-4"
            {...register("completed")}
          />
          <span>
            <span className="block text-sm font-medium">
              Marcar esta revisão como concluída
            </span>
            <span className="text-muted-foreground mt-1 block text-xs">
              Você continuará podendo editar o conteúdo depois.
            </span>
            {completedAt ? (
              <span className="text-muted-foreground mt-2 block text-[11px]">
                Concluída em <LocalDateTime value={completedAt} />
              </span>
            ) : null}
          </span>
        </label>
      </section>

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
          type="submit"
          disabled={isSubmitting}
          className={buttonStyles()}
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Salvando…" : "Salvar revisão"}
        </button>
      </div>
    </form>
  );
}
