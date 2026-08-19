"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import {
  fieldErrorStyles,
  inputStyles,
  labelStyles,
  textareaStyles,
} from "@/components/ui/form-styles";
import { deleteOffer, saveOffer } from "@/features/offers/actions";
import {
  OFFER_SALARY_PERIOD_LABELS,
  OFFER_SALARY_PERIODS,
} from "@/features/offers/constants";
import {
  offerSchema,
  type OfferFormValues,
} from "@/features/offers/schemas/offer-schema";
import type { ApplicationOffer } from "@/features/offers/types/offer";
import { SUPPORTED_CURRENCIES } from "@/features/settings/constants";
import type { SupportedCurrency } from "@/types/database";

function valuesFromOffer(
  applicationId: string,
  offer: ApplicationOffer | null,
  currency: string,
  today: string,
): OfferFormValues {
  const supportedCurrency = SUPPORTED_CURRENCIES.includes(
    currency as SupportedCurrency,
  )
    ? (currency as SupportedCurrency)
    : "BRL";

  return {
    applicationId,
    salaryAmount: offer ? String(offer.salary_amount) : "",
    salaryPeriod: offer?.salary_period ?? "monthly",
    currency: offer?.currency ?? supportedCurrency,
    bonusAmount:
      offer?.bonus_amount === null || offer?.bonus_amount === undefined
        ? ""
        : String(offer.bonus_amount),
    equity: offer?.equity ?? "",
    benefits: offer?.benefits ?? "",
    receivedAt: offer?.received_at ?? today,
    decisionDeadline: offer?.decision_deadline ?? "",
    notes: offer?.notes ?? "",
  };
}

export function OfferManager({
  applicationId,
  offer,
  defaultCurrency,
  today,
}: {
  applicationId: string;
  offer: ApplicationOffer | null;
  defaultCurrency: string;
  today: string;
}) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const emptyValues = valuesFromOffer(
    applicationId,
    null,
    defaultCurrency,
    today,
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: valuesFromOffer(
      applicationId,
      offer,
      defaultCurrency,
      today,
    ),
  });

  async function submit(values: OfferFormValues) {
    setFeedback(null);
    const result = await saveOffer(values);
    setFeedback({
      kind: result.success ? "success" : "error",
      message: result.message,
    });
    if (result.success) router.refresh();
  }

  function remove() {
    if (!offer || !window.confirm("Excluir os dados desta proposta?")) return;
    setFeedback(null);
    startDeleteTransition(async () => {
      const result = await deleteOffer({ applicationId });
      setFeedback({
        kind: result.success ? "success" : "error",
        message: result.message,
      });
      if (!result.success) return;
      reset(emptyValues);
      router.refresh();
    });
  }

  const disabled = isSubmitting || isDeleting;

  return (
    <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
      <div>
        <h2 className="font-medium">Proposta</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Registre a oferta recebida sem alterar automaticamente o pipeline.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="mt-5">
        <input type="hidden" {...register("applicationId")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={labelStyles}>
            Salário-base <span className="text-accent">*</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className={`${inputStyles} mt-2`}
              disabled={disabled}
              aria-invalid={Boolean(errors.salaryAmount)}
              {...register("salaryAmount")}
            />
            {errors.salaryAmount ? (
              <span className={fieldErrorStyles}>
                {errors.salaryAmount.message}
              </span>
            ) : null}
          </label>

          <label className={labelStyles}>
            Periodicidade
            <select
              className={`${inputStyles} mt-2`}
              disabled={disabled}
              {...register("salaryPeriod")}
            >
              {OFFER_SALARY_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {OFFER_SALARY_PERIOD_LABELS[period]}
                </option>
              ))}
            </select>
          </label>

          <label className={labelStyles}>
            Moeda
            <select
              className={`${inputStyles} mt-2`}
              disabled={disabled}
              {...register("currency")}
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className={labelStyles}>
            Bônus
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputStyles} mt-2`}
              disabled={disabled}
              aria-invalid={Boolean(errors.bonusAmount)}
              {...register("bonusAmount")}
            />
            {errors.bonusAmount ? (
              <span className={fieldErrorStyles}>
                {errors.bonusAmount.message}
              </span>
            ) : null}
          </label>

          <label className={labelStyles}>
            Recebida em
            <input
              type="date"
              className={`${inputStyles} mt-2`}
              disabled={disabled}
              aria-invalid={Boolean(errors.receivedAt)}
              {...register("receivedAt")}
            />
            {errors.receivedAt ? (
              <span className={fieldErrorStyles}>
                {errors.receivedAt.message}
              </span>
            ) : null}
          </label>

          <label className={labelStyles}>
            Prazo para decisão
            <input
              type="date"
              className={`${inputStyles} mt-2`}
              disabled={disabled}
              aria-invalid={Boolean(errors.decisionDeadline)}
              {...register("decisionDeadline")}
            />
            {errors.decisionDeadline ? (
              <span className={fieldErrorStyles}>
                {errors.decisionDeadline.message}
              </span>
            ) : null}
          </label>

          <label className={`${labelStyles} sm:col-span-2`}>
            Participação ou equity
            <input
              className={`${inputStyles} mt-2`}
              placeholder="Ex.: 0,1% com vesting de 4 anos"
              disabled={disabled}
              aria-invalid={Boolean(errors.equity)}
              {...register("equity")}
            />
            {errors.equity ? (
              <span className={fieldErrorStyles}>{errors.equity.message}</span>
            ) : null}
          </label>

          <label className={`${labelStyles} sm:col-span-2`}>
            Benefícios
            <textarea
              className={`${textareaStyles} mt-2`}
              placeholder="Plano de saúde, auxílio, férias, equipamentos..."
              disabled={disabled}
              aria-invalid={Boolean(errors.benefits)}
              {...register("benefits")}
            />
            {errors.benefits ? (
              <span className={fieldErrorStyles}>
                {errors.benefits.message}
              </span>
            ) : null}
          </label>

          <label className={`${labelStyles} sm:col-span-2`}>
            Observações
            <textarea
              className={`${textareaStyles} mt-2`}
              placeholder="Condições, dúvidas e pontos para negociar"
              disabled={disabled}
              aria-invalid={Boolean(errors.notes)}
              {...register("notes")}
            />
            {errors.notes ? (
              <span className={fieldErrorStyles}>{errors.notes.message}</span>
            ) : null}
          </label>
        </div>

        {feedback ? (
          <div className="mt-4">
            <FormFeedback kind={feedback.kind} message={feedback.message} />
          </div>
        ) : null}

        <div className="border-border mt-5 flex flex-wrap justify-end gap-2 border-t pt-5">
          {offer ? (
            <button
              type="button"
              onClick={remove}
              disabled={disabled}
              className={buttonStyles({ variant: "ghost" })}
            >
              {isDeleting ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Excluir proposta
            </button>
          ) : null}
          <button className={buttonStyles()} disabled={disabled}>
            {isSubmitting ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Salvar proposta
          </button>
        </div>
      </form>
    </section>
  );
}
