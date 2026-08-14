"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import {
  loginSchema,
  signUpSchema,
  type LoginFormValues,
  type SignUpFormValues,
} from "@/features/auth/schemas/auth-schema";

type AuthFormProps = {
  mode: "login" | "signup";
};

const inputStyles =
  "h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/10";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-400">
      {message}
    </p>
  );
}

function LoginForm() {
  const [notice, setNotice] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = () => {
    setNotice("Login será conectado ao Supabase Auth na Etapa 2.");
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
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={`${inputStyles} mt-2`}
          {...register("password")}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </label>

      <button
        className={buttonStyles({ className: "mt-2 w-full" })}
        type="submit"
      >
        Entrar
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>

      {notice ? (
        <p
          role="status"
          className="border-accent/20 bg-accent/5 text-accent rounded-lg border p-3 text-xs"
        >
          {notice}
        </p>
      ) : null}
    </form>
  );
}

function SignUpForm() {
  const [notice, setNotice] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = () => {
    setNotice("Cadastro será conectado ao Supabase Auth na Etapa 2.");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="block text-sm font-medium" htmlFor="name">
        Nome
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`${inputStyles} mt-2`}
          {...register("name")}
        />
        <FieldError id="name-error" message={errors.name?.message} />
      </label>

      <label className="block text-sm font-medium" htmlFor="signup-email">
        E-mail
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
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
          placeholder="Mínimo de 8 caracteres"
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

      <button
        className={buttonStyles({ className: "mt-2 w-full" })}
        type="submit"
      >
        Criar conta
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>

      {notice ? (
        <p
          role="status"
          className="border-accent/20 bg-accent/5 text-accent rounded-lg border p-3 text-xs"
        >
          {notice}
        </p>
      ) : null}
    </form>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  return mode === "login" ? <LoginForm /> : <SignUpForm />;
}
