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
import type { CompanyOption } from "@/features/companies/types/company";
import { createContact, updateContact } from "@/features/contacts/actions";
import { CONTACT_TYPES } from "@/features/contacts/constants";
import {
  contactSchema,
  type ContactFormValues,
} from "@/features/contacts/schemas/contact-schema";

type Props = {
  companies: CompanyOption[];
  contactId?: string;
  defaultValues?: ContactFormValues;
};

export function ContactForm({ companies, contactId, defaultValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaultValues ?? {
      name: "",
      companyId: companies[0]?.id ?? "",
      role: "",
      contactType: "",
      email: "",
      phone: "",
      linkedinUrl: "",
      notes: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setServerError("");
    const result = contactId
      ? await updateContact(contactId, values)
      : await createContact(values);
    if (!result.success) return setServerError(result.message);
    router.replace(result.redirectTo ?? "/dashboard/contatos");
    router.refresh();
  };

  return (
    <form
      className="border-border bg-surface rounded-xl border p-5 sm:p-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelStyles}>
          Nome <span className="text-accent">*</span>
          <input
            className={`${inputStyles} mt-2`}
            autoComplete="name"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name && (
            <span className={fieldErrorStyles}>{errors.name.message}</span>
          )}
        </label>
        <label className={labelStyles}>
          Empresa <span className="text-accent">*</span>
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.companyId)}
            {...register("companyId")}
          >
            <option value="">Selecione</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId && (
            <span className={fieldErrorStyles}>{errors.companyId.message}</span>
          )}
        </label>
        <label className={labelStyles}>
          Cargo
          <input
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("role")}
          />
        </label>
        <label className={labelStyles}>
          Tipo
          <select
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("contactType")}
          >
            <option value="">Não informado</option>
            {CONTACT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelStyles}>
          Email
          <input
            className={`${inputStyles} mt-2`}
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && (
            <span className={fieldErrorStyles}>{errors.email.message}</span>
          )}
        </label>
        <label className={labelStyles}>
          Telefone
          <input
            className={`${inputStyles} mt-2`}
            type="tel"
            autoComplete="tel"
            disabled={isSubmitting}
            {...register("phone")}
          />
        </label>
        <label className={`${labelStyles} sm:col-span-2`}>
          LinkedIn
          <input
            className={`${inputStyles} mt-2`}
            type="url"
            placeholder="https://linkedin.com/in/..."
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.linkedinUrl)}
            {...register("linkedinUrl")}
          />
          {errors.linkedinUrl && (
            <span className={fieldErrorStyles}>
              {errors.linkedinUrl.message}
            </span>
          )}
        </label>
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
          href="/dashboard/contatos"
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
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Salvar contato
        </button>
      </div>
    </form>
  );
}
