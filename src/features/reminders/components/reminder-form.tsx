"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import {
  fieldErrorStyles,
  inputStyles,
  labelStyles,
  textareaStyles,
} from "@/components/ui/form-styles";
import { createReminder, updateReminder } from "@/features/reminders/actions";
import {
  reminderFormSchema,
  type ReminderFormValues,
} from "@/features/reminders/schemas/reminder-schema";
import type { ReminderApplicationOption } from "@/features/reminders/types/reminder";
import { toLocalDateTimeInput } from "@/lib/date-time";

type Props = {
  applications: ReminderApplicationOption[];
  reminderId?: string;
  defaultValues?: ReminderFormValues;
  defaultDueAtIso?: string;
};

export function ReminderForm({
  applications,
  reminderId,
  defaultValues,
  defaultDueAtIso,
}: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: defaultValues ?? {
      applicationId: applications[0]?.id ?? "",
      title: "",
      notes: "",
      dueAt: "",
    },
  });

  useEffect(() => {
    if (defaultDueAtIso)
      setValue("dueAt", toLocalDateTimeInput(defaultDueAtIso));
  }, [defaultDueAtIso, setValue]);

  async function submit(values: ReminderFormValues) {
    setServerError("");
    const dueAt = new Date(values.dueAt);
    if (Number.isNaN(dueAt.getTime())) {
      setServerError("Informe uma data e hora válidas.");
      return;
    }

    const input = { ...values, dueAt: dueAt.toISOString() };
    const result = reminderId
      ? await updateReminder(reminderId, input)
      : await createReminder(input);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    router.replace(result.redirectTo!);
    router.refresh();
  }

  const selectedApplication = applications.find(
    (application) => application.id === defaultValues?.applicationId,
  );

  return (
    <form
      className="border-border bg-surface rounded-xl border p-5 sm:p-6"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`${labelStyles} sm:col-span-2`}>
          Candidatura <span className="text-accent">*</span>
          {reminderId ? (
            <>
              <input type="hidden" {...register("applicationId")} />
              <span className="border-border bg-muted mt-2 flex h-11 items-center rounded-lg border px-3.5 text-sm">
                {selectedApplication?.job_title} ·{" "}
                {selectedApplication?.company.name}
              </span>
            </>
          ) : (
            <select
              className={`${inputStyles} mt-2`}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.applicationId)}
              {...register("applicationId")}
            >
              <option value="">Selecione</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.job_title} · {application.company.name}
                </option>
              ))}
            </select>
          )}
          {errors.applicationId ? (
            <span className={fieldErrorStyles}>
              {errors.applicationId.message}
            </span>
          ) : null}
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          O que precisa ser feito? <span className="text-accent">*</span>
          <input
            className={`${inputStyles} mt-2`}
            placeholder="Ex.: Enviar follow-up após a entrevista"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
          {errors.title ? (
            <span className={fieldErrorStyles}>{errors.title.message}</span>
          ) : null}
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Data e horário <span className="text-accent">*</span>
          <input
            className={`${inputStyles} mt-2`}
            type="datetime-local"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.dueAt)}
            {...register("dueAt")}
          />
          {errors.dueAt ? (
            <span className={fieldErrorStyles}>{errors.dueAt.message}</span>
          ) : null}
          <span className="text-muted-foreground mt-1.5 block text-xs">
            O horário é interpretado no timezone deste dispositivo.
          </span>
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Observações
          <textarea
            className={`${textareaStyles} mt-2`}
            placeholder="Contexto, mensagem a enviar ou próximos passos"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.notes)}
            {...register("notes")}
          />
          {errors.notes ? (
            <span className={fieldErrorStyles}>{errors.notes.message}</span>
          ) : null}
        </label>
      </div>

      {serverError ? (
        <div className="mt-5">
          <FormFeedback kind="error" message={serverError} />
        </div>
      ) : null}

      <div className="border-border mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/lembretes"
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancelar
        </Link>
        <button className={buttonStyles()} disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          Salvar lembrete
        </button>
      </div>
    </form>
  );
}
