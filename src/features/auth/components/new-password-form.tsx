"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LoaderCircle } from "lucide-react";
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
import { resetPassword } from "@/features/auth/recovery-actions";
import {
  newPasswordSchema,
  type NewPasswordValues,
} from "@/features/auth/schemas/auth-schema";

export function NewPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
  });

  const onSubmit = async (values: NewPasswordValues) => {
    setServerError("");
    const result = await resetPassword(values);
    if (!result.success) {
      setServerError(result.message);
      return;
    }

    router.replace(result.redirectTo ?? "/login");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className={labelStyles} htmlFor="new-password">
        Nova senha
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="8+ caracteres, com letra e número"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          className={`${inputStyles} mt-2`}
          {...register("password")}
        />
        {errors.password ? (
          <span role="alert" className={fieldErrorStyles}>
            {errors.password.message}
          </span>
        ) : null}
      </label>

      <label className={labelStyles} htmlFor="new-password-confirmation">
        Confirmar nova senha
        <input
          id="new-password-confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Repita sua nova senha"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.passwordConfirmation)}
          className={`${inputStyles} mt-2`}
          {...register("passwordConfirmation")}
        />
        {errors.passwordConfirmation ? (
          <span role="alert" className={fieldErrorStyles}>
            {errors.passwordConfirmation.message}
          </span>
        ) : null}
      </label>

      {serverError ? <FormFeedback kind="error" message={serverError} /> : null}

      <button
        className={buttonStyles({ className: "mt-2 w-full" })}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="size-4" aria-hidden="true" />
        )}
        {isSubmitting ? "Atualizando…" : "Definir nova senha"}
      </button>
    </form>
  );
}
