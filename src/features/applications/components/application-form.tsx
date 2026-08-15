"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import {
  fieldErrorStyles,
  inputStyles,
  labelStyles,
  textareaStyles,
} from "@/components/ui/form-styles";
import {
  createApplication,
  updateApplication,
} from "@/features/applications/actions";
import {
  APPLICATION_SOURCES,
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODES,
  WORK_MODE_LABELS,
} from "@/features/applications/constants";
import {
  applicationSchema,
  type ApplicationFormValues,
} from "@/features/applications/schemas/application-schema";
import type { CompanyOption } from "@/features/companies/types/company";
import type { ApplicationStatus } from "@/types/database";

type ApplicationFormProps = {
  companies: CompanyOption[];
  applicationId?: string;
  defaultValues?: ApplicationFormValues;
  initialStatus?: ApplicationStatus;
};

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className={fieldErrorStyles} role="alert">
      {message}
    </span>
  ) : null;
}

export function ApplicationForm({
  companies,
  applicationId,
  defaultValues,
  initialStatus = "saved",
}: ApplicationFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: defaultValues ?? {
      companyId: "",
      jobTitle: "",
      jobUrl: "",
      location: "",
      workMode: "",
      employmentType: "",
      salaryMin: "",
      salaryMax: "",
      currency: "BRL",
      appliedAt: "",
      source: "",
      status: initialStatus,
      description: "",
      notes: "",
    },
  });

  const onSubmit = async (values: ApplicationFormValues) => {
    setServerError("");
    const result = applicationId
      ? await updateApplication(applicationId, values)
      : await createApplication(values);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    router.replace(result.redirectTo ?? "/dashboard/candidaturas");
    router.refresh();
  };

  return (
    <form
      className="border-border bg-surface rounded-xl border p-5 sm:p-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`${labelStyles} sm:col-span-2`}>
          Empresa <span className="text-accent">*</span>
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.companyId)}
            {...register("companyId")}
          >
            <option value="">Selecione uma empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.companyId?.message} />
          <Link
            href="/dashboard/empresas/nova"
            className="text-accent mt-2 inline-block text-xs hover:underline"
          >
            Cadastrar uma nova empresa
          </Link>
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Vaga <span className="text-accent">*</span>
          <input
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.jobTitle)}
            {...register("jobTitle")}
          />
          <FieldError message={errors.jobTitle?.message} />
        </label>

        <label className={labelStyles}>
          URL da vaga
          <input
            className={`${inputStyles} mt-2`}
            type="url"
            placeholder="https://..."
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.jobUrl)}
            {...register("jobUrl")}
          />
          <FieldError message={errors.jobUrl?.message} />
        </label>

        <label className={labelStyles}>
          Localização
          <input
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.location)}
            {...register("location")}
          />
          <FieldError message={errors.location?.message} />
        </label>

        <label className={labelStyles}>
          Modalidade
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("workMode")}
          >
            <option value="">Não informada</option>
            {WORK_MODES.map((value) => (
              <option key={value} value={value}>
                {WORK_MODE_LABELS[value]}
              </option>
            ))}
          </select>
          <FieldError message={errors.workMode?.message} />
        </label>

        <label className={labelStyles}>
          Tipo de contratação
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("employmentType")}
          >
            <option value="">Não informado</option>
            {EMPLOYMENT_TYPES.map((value) => (
              <option key={value} value={value}>
                {EMPLOYMENT_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
          <FieldError message={errors.employmentType?.message} />
        </label>

        <label className={labelStyles}>
          Salário mínimo
          <input
            className={`${inputStyles} mt-2`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.salaryMin)}
            {...register("salaryMin")}
          />
          <FieldError message={errors.salaryMin?.message} />
        </label>

        <label className={labelStyles}>
          Salário máximo
          <input
            className={`${inputStyles} mt-2`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.salaryMax)}
            {...register("salaryMax")}
          />
          <FieldError message={errors.salaryMax?.message} />
        </label>

        <label className={labelStyles}>
          Moeda
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("currency")}
          >
            <option value="BRL">BRL — Real brasileiro</option>
          </select>
          <FieldError message={errors.currency?.message} />
        </label>

        <label className={labelStyles}>
          Data da candidatura
          <input
            className={`${inputStyles} mt-2`}
            type="date"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.appliedAt)}
            {...register("appliedAt")}
          />
          <FieldError message={errors.appliedAt?.message} />
        </label>

        <label className={labelStyles}>
          Fonte
          <input
            className={`${inputStyles} mt-2`}
            list="application-sources"
            disabled={isSubmitting}
            {...register("source")}
          />
          <datalist id="application-sources">
            {APPLICATION_SOURCES.map((source) => (
              <option key={source} value={source} />
            ))}
          </datalist>
          <FieldError message={errors.source?.message} />
        </label>

        <label className={labelStyles}>
          Status <span className="text-accent">*</span>
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("status")}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {APPLICATION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <FieldError message={errors.status?.message} />
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Descrição
          <textarea
            className={`${textareaStyles} mt-2`}
            disabled={isSubmitting}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Observações
          <textarea
            className={`${textareaStyles} mt-2`}
            disabled={isSubmitting}
            {...register("notes")}
          />
          <FieldError message={errors.notes?.message} />
        </label>
      </div>

      {serverError ? (
        <div className="mt-5">
          <FormFeedback kind="error" message={serverError} />
        </div>
      ) : null}

      <div className="border-border mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Link
          href={
            applicationId
              ? `/dashboard/candidaturas/${applicationId}`
              : "/dashboard/candidaturas"
          }
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancelar
        </Link>
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
          {isSubmitting ? "Salvando…" : "Salvar candidatura"}
        </button>
      </div>
    </form>
  );
}
