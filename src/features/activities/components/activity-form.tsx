"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { createActivity } from "@/features/activities/actions";
import { ACTIVITY_TYPE_OPTIONS } from "@/features/activities/constants";
import {
  activityFormSchema,
  type ActivityFormValues,
} from "@/features/activities/schemas/activity-schema";
import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import {
  fieldErrorStyles,
  inputStyles,
  labelStyles,
  textareaStyles,
} from "@/components/ui/form-styles";
import { toLocalDateTimeInput } from "@/lib/date-time";

export function ActivityForm({
  applicationId,
  defaultOccurredAt,
}: {
  applicationId: string;
  defaultOccurredAt: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      applicationId,
      activityType: "note",
      title: "",
      notes: "",
      occurredAt: toLocalDateTimeInput(defaultOccurredAt),
    },
  });

  async function onSubmit(values: ActivityFormValues) {
    setFeedback(null);
    const result = await createActivity({
      ...values,
      occurredAt: new Date(values.occurredAt).toISOString(),
    });
    setFeedback({
      kind: result.success ? "success" : "error",
      message: result.message,
    });
    if (!result.success) return;

    reset({
      applicationId,
      activityType: "note",
      title: "",
      notes: "",
      occurredAt: toLocalDateTimeInput(new Date().toISOString()),
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
      <input type="hidden" {...register("applicationId")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelStyles}>
          Tipo
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("activityType")}
          >
            {ACTIVITY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelStyles}>
          Data e hora
          <input
            type="datetime-local"
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.occurredAt)}
            {...register("occurredAt")}
          />
          {errors.occurredAt ? (
            <span className={fieldErrorStyles}>
              {errors.occurredAt.message}
            </span>
          ) : null}
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Título
          <input
            className={`${inputStyles} mt-2`}
            placeholder="Ex.: Enviei retorno para a recrutadora"
            maxLength={120}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
          {errors.title ? (
            <span className={fieldErrorStyles}>{errors.title.message}</span>
          ) : null}
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Detalhes opcionais
          <textarea
            className={`${textareaStyles} mt-2`}
            placeholder="Registre contexto, resposta ou próximos passos"
            maxLength={2000}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.notes)}
            {...register("notes")}
          />
          {errors.notes ? (
            <span className={fieldErrorStyles}>{errors.notes.message}</span>
          ) : null}
        </label>
      </div>

      {feedback ? (
        <div className="mt-4">
          <FormFeedback kind={feedback.kind} message={feedback.message} />
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          className={buttonStyles({ size: "sm" })}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          Registrar interação
        </button>
      </div>
    </form>
  );
}
