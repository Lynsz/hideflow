"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import {
  fieldErrorStyles,
  inputStyles,
  labelStyles,
} from "@/components/ui/form-styles";
import { requestPasswordRecovery } from "@/features/auth/recovery-actions";
import {
  passwordRecoveryRequestSchema,
  type PasswordRecoveryRequestValues,
} from "@/features/auth/schemas/auth-schema";

export function PasswordRecoveryForm({
  initialError,
}: {
  initialError?: string;
}) {
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(
    initialError ? { kind: "error" as const, message: initialError } : null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordRecoveryRequestValues>({
    resolver: zodResolver(passwordRecoveryRequestSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: PasswordRecoveryRequestValues) => {
    setFeedback(null);
    const result = await requestPasswordRecovery(values);
    setFeedback({
      kind: result.success ? "success" : "error",
      message: result.message,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className={labelStyles} htmlFor="recovery-email">
        E-mail da conta
        <input
          id="recovery-email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "recovery-email-error" : undefined}
          className={`${inputStyles} mt-2`}
          {...register("email")}
        />
        {errors.email ? (
          <span
            id="recovery-email-error"
            role="alert"
            className={fieldErrorStyles}
          >
            {errors.email.message}
          </span>
        ) : null}
      </label>

      <button
        className={buttonStyles({ className: "mt-2 w-full" })}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="size-4" aria-hidden="true" />
        )}
        {isSubmitting ? "Enviando…" : "Enviar instruções"}
      </button>

      {feedback ? (
        <FormFeedback kind={feedback.kind} message={feedback.message} />
      ) : null}
    </form>
  );
}
