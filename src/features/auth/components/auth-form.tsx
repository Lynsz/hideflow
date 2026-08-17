"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import { login, signUp } from "@/features/auth/actions";
import {
  loginSchema,
  signUpSchema,
  type LoginFormValues,
  type SignUpFormValues,
} from "@/features/auth/schemas/auth-schema";

type AuthFormProps = {
  mode: "login" | "signup";
  redirectTo?: string;
  initialError?: string;
  initialSuccess?: string;
};

type Feedback = {
  kind: "success" | "error";
  message: string;
};

const inputStyles =
  "h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-400">
      {message}
    </p>
  );
}

function FormFeedback({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;

  return (
    <p
      role={feedback.kind === "error" ? "alert" : "status"}
      className={
        feedback.kind === "error"
          ? "rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300"
          : "border-accent/20 bg-accent/5 text-accent rounded-lg border p-3 text-xs"
      }
    >
      {feedback.message}
    </p>
  );
}

function SubmitButton({
  isSubmitting,
  label,
}: {
  isSubmitting: boolean;
  label: string;
}) {
  return (
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
      {isSubmitting ? "Aguarde…" : label}
    </button>
  );
}

function LoginForm({
  redirectTo,
  initialError,
  initialSuccess,
}: Pick<AuthFormProps, "redirectTo" | "initialError" | "initialSuccess">) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(
    initialError
      ? { kind: "error", message: initialError }
      : initialSuccess
        ? { kind: "success", message: initialSuccess }
        : null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFeedback(null);
    const result = await login(values, redirectTo);

    if (!result.success) {
      setFeedback({ kind: "error", message: result.message });
      return;
    }

    router.replace(result.redirectTo ?? "/dashboard");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="block text-sm font-medium" htmlFor="email">
        E-mail
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`${inputStyles} mt-2`}
          {...register("email")}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </label>

      <label className="block text-sm font-medium" htmlFor="password">
        Senha
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Mínimo de 8 caracteres"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={`${inputStyles} mt-2`}
          {...register("password")}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </label>

      <div className="-mt-1 text-right">
        <Link
          href="/recuperar-senha"
          className="text-muted-foreground hover:text-accent text-xs transition"
        >
          Esqueci minha senha
        </Link>
      </div>

      <SubmitButton isSubmitting={isSubmitting} label="Entrar" />
      <FormFeedback feedback={feedback} />
    </form>
  );
}

function SignUpForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setFeedback(null);
    const result = await signUp(values);

    if (!result.success) {
      setFeedback({ kind: "error", message: result.message });
      return;
    }

    if (result.redirectTo) {
      router.replace(result.redirectTo);
      router.refresh();
      return;
    }

    reset();
    setFeedback({ kind: "success", message: result.message });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="block text-sm font-medium" htmlFor="full-name">
        Nome completo
        <input
          id="full-name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "full-name-error" : undefined}
          className={`${inputStyles} mt-2`}
          {...register("fullName")}
        />
        <FieldError id="full-name-error" message={errors.fullName?.message} />
      </label>

      <label className="block text-sm font-medium" htmlFor="signup-email">
        E-mail
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
          className={`${inputStyles} mt-2`}
          {...register("email")}
        />
        <FieldError id="signup-email-error" message={errors.email?.message} />
      </label>

      <label className="block text-sm font-medium" htmlFor="signup-password">
        Senha
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="8+ caracteres, com letra e número"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "signup-password-error" : undefined
          }
          className={`${inputStyles} mt-2`}
          {...register("password")}
        />
        <FieldError
          id="signup-password-error"
          message={errors.password?.message}
        />
      </label>

      <label
        className="block text-sm font-medium"
        htmlFor="password-confirmation"
      >
        Confirmar senha
        <input
          id="password-confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Repita sua senha"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.passwordConfirmation)}
          aria-describedby={
            errors.passwordConfirmation
              ? "password-confirmation-error"
              : undefined
          }
          className={`${inputStyles} mt-2`}
          {...register("passwordConfirmation")}
        />
        <FieldError
          id="password-confirmation-error"
          message={errors.passwordConfirmation?.message}
        />
      </label>

      <SubmitButton isSubmitting={isSubmitting} label="Criar conta" />
      <FormFeedback feedback={feedback} />
    </form>
  );
}

export function AuthForm({
  mode,
  redirectTo,
  initialError,
  initialSuccess,
}: AuthFormProps) {
  return mode === "login" ? (
    <LoginForm
      redirectTo={redirectTo}
      initialError={initialError}
      initialSuccess={initialSuccess}
    />
  ) : (
    <SignUpForm />
  );
}
