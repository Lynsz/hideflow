"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LoaderCircle, Save } from "lucide-react";
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
import {
  changePassword,
  updatePreferences,
  updateProfile,
} from "@/features/settings/actions";
import {
  CURRENCY_LABELS,
  SETTINGS_ANALYTICS_PERIOD_LABELS,
  SETTINGS_ANALYTICS_PERIODS,
  SUPPORTED_CURRENCIES,
} from "@/features/settings/constants";
import {
  changePasswordSchema,
  preferencesSchema,
  profileSettingsSchema,
  type ChangePasswordValues,
  type PreferencesValues,
  type ProfileSettingsValues,
} from "@/features/settings/schemas/settings-schema";
import type {
  SettingsActionResult,
  UserSettings,
} from "@/features/settings/types/settings";

type Feedback = Pick<SettingsActionResult, "success" | "message"> | null;

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className={fieldErrorStyles} role="alert">
      {message}
    </span>
  ) : null;
}

function FeedbackView({ feedback }: { feedback: Feedback }) {
  return feedback ? (
    <FormFeedback
      kind={feedback.success ? "success" : "error"}
      message={feedback.message}
    />
  ) : null;
}

function SubmitButton({
  pending,
  label = "Salvar alterações",
}: {
  pending: boolean;
  label?: string;
}) {
  return (
    <button className={buttonStyles()} type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      {pending ? "Salvando…" : label}
    </button>
  );
}

export function ProfileSettingsForm({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: { fullName },
  });

  const onSubmit = async (values: ProfileSettingsValues) => {
    setFeedback(null);
    const result = await updateProfile(values);
    setFeedback(result);
    if (result.success) router.refresh();
  };

  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <h2 className="font-medium">Perfil</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Estes dados identificam você dentro do HireFlow.
      </p>

      <form
        className="mt-5 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <label className={labelStyles} htmlFor="settings-full-name">
          Nome completo
          <input
            id="settings-full-name"
            type="text"
            autoComplete="name"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.fullName)}
            className={`${inputStyles} mt-2`}
            {...register("fullName")}
          />
          <FieldError message={errors.fullName?.message} />
        </label>

        <label className={labelStyles} htmlFor="settings-email">
          E-mail
          <input
            id="settings-email"
            type="email"
            value={email}
            readOnly
            className={`${inputStyles} mt-2 opacity-70`}
          />
          <span className="text-muted-foreground mt-1.5 block text-xs">
            A alteração de e-mail não está disponível nesta etapa.
          </span>
        </label>

        <FeedbackView feedback={feedback} />
        <div className="flex justify-end">
          <SubmitButton pending={isSubmitting} />
        </div>
      </form>
    </section>
  );
}

export function PreferencesForm({ settings }: { settings: UserSettings }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      defaultCurrency: settings.defaultCurrency,
      analyticsPeriod: settings.analyticsPeriod,
    },
  });

  const onSubmit = async (values: PreferencesValues) => {
    setFeedback(null);
    const result = await updatePreferences(values);
    setFeedback(result);
    if (result.success) router.refresh();
  };

  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <h2 className="font-medium">Preferências</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Defina os padrões usados ao criar candidaturas e abrir Analytics.
      </p>

      <form
        className="mt-5 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <label className={labelStyles} htmlFor="default-currency">
          Moeda padrão
          <select
            id="default-currency"
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("defaultCurrency")}
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {CURRENCY_LABELS[currency]}
              </option>
            ))}
          </select>
          <FieldError message={errors.defaultCurrency?.message} />
        </label>

        <label className={labelStyles} htmlFor="analytics-period">
          Período inicial de Analytics
          <select
            id="analytics-period"
            className={`${inputStyles} mt-2`}
            disabled={isSubmitting}
            {...register("analyticsPeriod")}
          >
            {SETTINGS_ANALYTICS_PERIODS.map((period) => (
              <option key={period} value={period}>
                {SETTINGS_ANALYTICS_PERIOD_LABELS[period]}
              </option>
            ))}
          </select>
          <FieldError message={errors.analyticsPeriod?.message} />
        </label>

        <FeedbackView feedback={feedback} />
        <div className="flex justify-end">
          <SubmitButton pending={isSubmitting} />
        </div>
      </form>
    </section>
  );
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    setFeedback(null);
    const result = await changePassword(values);
    if (result.success && result.redirectTo) {
      router.replace(result.redirectTo);
      router.refresh();
      return;
    }
    setFeedback(result);
  };

  return (
    <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="bg-accent/10 text-accent grid size-9 shrink-0 place-items-center rounded-lg">
          <KeyRound className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-medium">Segurança</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Alterar a senha encerra as sessões da conta em todos os
            dispositivos.
          </p>
        </div>
      </div>

      <form
        className="mt-5 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <label className={labelStyles} htmlFor="current-password">
          Senha atual
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            className={`${inputStyles} mt-2`}
            {...register("currentPassword")}
          />
          <FieldError message={errors.currentPassword?.message} />
        </label>

        <label className={labelStyles} htmlFor="settings-new-password">
          Nova senha
          <input
            id="settings-new-password"
            type="password"
            autoComplete="new-password"
            placeholder="8+ caracteres, com letra e número"
            disabled={isSubmitting}
            className={`${inputStyles} mt-2`}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </label>

        <label className={labelStyles} htmlFor="settings-password-confirmation">
          Confirmar nova senha
          <input
            id="settings-password-confirmation"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            className={`${inputStyles} mt-2`}
            {...register("passwordConfirmation")}
          />
          <FieldError message={errors.passwordConfirmation?.message} />
        </label>

        <FeedbackView feedback={feedback} />
        <div className="flex justify-end">
          <SubmitButton pending={isSubmitting} label="Alterar senha" />
        </div>
      </form>
    </section>
  );
}
