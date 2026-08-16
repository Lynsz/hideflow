"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import {
  fieldErrorStyles,
  inputStyles,
  labelStyles,
  textareaStyles,
} from "@/components/ui/form-styles";
import type { ContactOption } from "@/features/contacts/types/contact";
import {
  createInterview,
  updateInterview,
} from "@/features/interviews/actions";
import {
  INTERVIEW_RESULTS,
  INTERVIEW_TYPES,
} from "@/features/interviews/constants";
import {
  interviewFormSchema,
  type InterviewFormValues,
} from "@/features/interviews/schemas/interview-schema";
import type { InterviewApplicationOption } from "@/features/interviews/types/interview";
import { toLocalDateTimeInput } from "@/lib/date-time";

type Props = {
  applications: InterviewApplicationOption[];
  contacts: ContactOption[];
  interviewId?: string;
  defaultValues?: InterviewFormValues;
  defaultScheduledAtIso?: string;
};

export function InterviewForm({
  applications,
  contacts,
  interviewId,
  defaultValues,
  defaultScheduledAtIso,
}: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: defaultValues ?? {
      applicationId: applications[0]?.id ?? "",
      type: "hr",
      scheduledAt: "",
      contactId: "",
      interviewerName: "",
      meetingUrl: "",
      notes: "",
      result: "scheduled",
    },
  });
  useEffect(() => {
    if (defaultScheduledAtIso)
      setValue("scheduledAt", toLocalDateTimeInput(defaultScheduledAtIso));
  }, [defaultScheduledAtIso, setValue]);
  const applicationId = useWatch({ control, name: "applicationId" });
  const selected = applications.find((item) => item.id === applicationId);
  const availableContacts = useMemo(
    () =>
      contacts.filter((contact) => contact.company_id === selected?.company_id),
    [contacts, selected?.company_id],
  );
  async function submit(values: InterviewFormValues) {
    setServerError("");
    const date = new Date(values.scheduledAt);
    if (Number.isNaN(date.getTime()))
      return setServerError("Informe uma data e hora válidas.");
    const contact = contacts.find((item) => item.id === values.contactId);
    const input = {
      ...values,
      scheduledAt: date.toISOString(),
      interviewerName: contact?.name ?? values.interviewerName,
      result: interviewId ? values.result : ("scheduled" as const),
    };
    const result = interviewId
      ? await updateInterview(interviewId, input)
      : await createInterview(input);
    if (!result.success) return setServerError(result.message);
    router.replace(result.redirectTo!);
    router.refresh();
  }
  return (
    <form
      className="border-border bg-surface rounded-xl border p-5 sm:p-6"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`${labelStyles} sm:col-span-2`}>
          Candidatura <span className="text-accent">*</span>
          {interviewId ? (
            <>
              <input type="hidden" {...register("applicationId")} />
              <span className="border-border bg-muted mt-2 flex h-11 items-center rounded-lg border px-3.5 text-sm">
                {selected?.job_title} · {selected?.company.name}
              </span>
            </>
          ) : (
            <select
              className={`${inputStyles} mt-2`}
              disabled={isSubmitting}
              {...register("applicationId", {
                onChange: () => setValue("contactId", ""),
              })}
            >
              <option value="">Selecione</option>
              {applications.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.job_title} · {item.company.name}
                </option>
              ))}
            </select>
          )}
          {errors.applicationId && (
            <span className={fieldErrorStyles}>
              {errors.applicationId.message}
            </span>
          )}
        </label>
        <label className={labelStyles}>
          Tipo <span className="text-accent">*</span>
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("type")}
          >
            {INTERVIEW_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelStyles}>
          Data e horário <span className="text-accent">*</span>
          <input
            className={`${inputStyles} mt-2`}
            type="datetime-local"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.scheduledAt)}
            {...register("scheduledAt")}
          />
          {errors.scheduledAt && (
            <span className={fieldErrorStyles}>
              {errors.scheduledAt.message}
            </span>
          )}
          <span className="text-muted-foreground mt-1.5 block text-xs">
            O horário é interpretado no timezone deste dispositivo.
          </span>
        </label>
        <label className={labelStyles}>
          Contato entrevistador
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting || !selected}
            {...register("contactId")}
          >
            <option value="">Informar nome manualmente</option>
            {availableContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
          <span className="text-muted-foreground mt-1.5 block text-xs">
            Apenas contatos da empresa selecionada.
          </span>
        </label>
        <label className={labelStyles}>
          Nome manual
          <input
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("interviewerName")}
          />
        </label>
        <label className={`${labelStyles} sm:col-span-2`}>
          Link da reunião
          <input
            className={`${inputStyles} mt-2`}
            type="url"
            placeholder="https://meet..."
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.meetingUrl)}
            {...register("meetingUrl")}
          />
          {errors.meetingUrl && (
            <span className={fieldErrorStyles}>
              {errors.meetingUrl.message}
            </span>
          )}
        </label>
        {interviewId && (
          <label className={`${labelStyles} sm:col-span-2`}>
            Status / resultado
            <select
              className={`${inputStyles} mt-2`}
              disabled={isSubmitting}
              {...register("result")}
            >
              {INTERVIEW_RESULTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={`${labelStyles} sm:col-span-2`}>
          Observações
          <textarea
            className={`${textareaStyles} mt-2`}
            disabled={isSubmitting}
            {...register("notes")}
          />
        </label>
      </div>
      {serverError && (
        <div className="mt-5">
          <FormFeedback kind="error" message={serverError} />
        </div>
      )}
      <div className="border-border mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/entrevistas"
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancelar
        </Link>
        <button className={buttonStyles()} disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Salvar entrevista
        </button>
      </div>
    </form>
  );
}
