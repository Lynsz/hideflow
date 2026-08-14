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
import { createCompany, updateCompany } from "@/features/companies/actions";
import {
  companySchema,
  type CompanyFormValues,
} from "@/features/companies/schemas/company-schema";

type CompanyFormProps = {
  companyId?: string;
  defaultValues?: CompanyFormValues;
};

const EMPTY_VALUES: CompanyFormValues = {
  name: "",
  website: "",
  linkedinUrl: "",
  location: "",
  notes: "",
};

export function CompanyForm({ companyId, defaultValues }: CompanyFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
  });

  const onSubmit = async (values: CompanyFormValues) => {
    setServerError("");
    const result = companyId
      ? await updateCompany(companyId, values)
      : await createCompany(values);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    router.replace(result.redirectTo ?? "/dashboard/empresas");
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
          Nome <span className="text-accent">*</span>
          <input
            className={`${inputStyles} mt-2`}
            autoComplete="organization"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name ? (
            <span className={fieldErrorStyles}>{errors.name.message}</span>
          ) : null}
        </label>

        <label className={labelStyles}>
          Website
          <input
            className={`${inputStyles} mt-2`}
            type="url"
            placeholder="https://empresa.com"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.website)}
            {...register("website")}
          />
          {errors.website ? (
            <span className={fieldErrorStyles}>{errors.website.message}</span>
          ) : null}
        </label>

        <label className={labelStyles}>
          LinkedIn
          <input
            className={`${inputStyles} mt-2`}
            type="url"
            placeholder="https://linkedin.com/company/..."
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.linkedinUrl)}
            {...register("linkedinUrl")}
          />
          {errors.linkedinUrl ? (
            <span className={fieldErrorStyles}>
              {errors.linkedinUrl.message}
            </span>
          ) : null}
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Localização
          <input
            className={`${inputStyles} mt-2`}
            placeholder="São Paulo, SP"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.location)}
            {...register("location")}
          />
          {errors.location ? (
            <span className={fieldErrorStyles}>{errors.location.message}</span>
          ) : null}
        </label>

        <label className={`${labelStyles} sm:col-span-2`}>
          Observações
          <textarea
            className={`${textareaStyles} mt-2`}
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
          href="/dashboard/empresas"
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
          {isSubmitting ? "Salvando…" : "Salvar empresa"}
        </button>
      </div>
    </form>
  );
}
