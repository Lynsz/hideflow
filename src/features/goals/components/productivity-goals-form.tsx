"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import {
  fieldErrorStyles,
  inputStyles,
  labelStyles,
} from "@/components/ui/form-styles";
import { saveProductivityGoals } from "@/features/goals/actions";
import { MAX_PRODUCTIVITY_TARGET } from "@/features/goals/constants";
import { productivityGoalSchema } from "@/features/goals/schemas/goal-schema";
import type {
  GoalActionResult,
  ProductivityGoalValues,
} from "@/features/goals/types/goal";

const FIELDS = [
  {
    name: "applicationsTarget",
    label: "Candidaturas enviadas",
    description: "Registros com data de candidatura.",
  },
  {
    name: "followUpsTarget",
    label: "Follow-ups concluídos",
    description: "Lembretes concluídos.",
  },
  {
    name: "outreachTarget",
    label: "Contatos realizados",
    description: "E-mails, ligações ou LinkedIn.",
  },
] as const;

export function ProductivityGoalsForm({
  defaultValues,
}: {
  defaultValues: ProductivityGoalValues;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<GoalActionResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductivityGoalValues>({
    resolver: zodResolver(productivityGoalSchema),
    defaultValues,
  });

  const onSubmit = async (values: ProductivityGoalValues) => {
    setFeedback(null);
    const result = await saveProductivityGoals(values);
    setFeedback(result);
    if (result.success) router.refresh();
  };

  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <h2 className="font-medium">Ajustar metas</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Use zero para pausar uma meta sem apagar o histórico.
      </p>

      <form
        className="mt-5 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {FIELDS.map((field) => (
          <label
            key={field.name}
            className={labelStyles}
            htmlFor={`goal-${field.name}`}
          >
            {field.label}
            <span className="text-muted-foreground ml-1 text-xs font-normal">
              · {field.description}
            </span>
            <input
              id={`goal-${field.name}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_PRODUCTIVITY_TARGET}
              step={1}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors[field.name])}
              className={`${inputStyles} mt-2`}
              {...register(field.name, { valueAsNumber: true })}
            />
            {errors[field.name]?.message ? (
              <span className={fieldErrorStyles} role="alert">
                {errors[field.name]?.message}
              </span>
            ) : null}
          </label>
        ))}

        {feedback ? (
          <FormFeedback
            kind={feedback.success ? "success" : "error"}
            message={feedback.message}
          />
        ) : null}

        <div className="flex justify-end">
          <button
            className={buttonStyles()}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {isSubmitting ? "Salvando…" : "Salvar metas"}
          </button>
        </div>
      </form>
    </section>
  );
}
