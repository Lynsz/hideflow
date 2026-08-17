"use client";

import { LoaderCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles, labelStyles } from "@/components/ui/form-styles";
import {
  addApplicationTechnology,
  removeApplicationTechnology,
} from "@/features/technologies/actions";
import type { TechnologyOption } from "@/features/technologies/types/technology";

type Feedback = { kind: "success" | "error"; message: string } | null;

export function ApplicationTechnologyManager({
  applicationId,
  linked,
  suggestions,
}: {
  applicationId: string;
  linked: TechnologyOption[];
  suggestions: TechnologyOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState<"add" | string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const linkedIds = useMemo(
    () => new Set(linked.map((technology) => technology.id)),
    [linked],
  );
  const availableSuggestions = suggestions.filter(
    (technology) => !linkedIds.has(technology.id),
  );
  const listId = `technology-suggestions-${applicationId}`;

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setPending("add");
    const result = await addApplicationTechnology({ applicationId, name });
    setPending(null);
    setFeedback({
      kind: result.success ? "success" : "error",
      message: result.message,
    });
    if (!result.success) return;
    setName("");
    router.refresh();
  }

  async function remove(technologyId: string) {
    setFeedback(null);
    setPending(technologyId);
    const result = await removeApplicationTechnology({
      applicationId,
      technologyId,
    });
    setPending(null);
    setFeedback({
      kind: result.success ? "success" : "error",
      message: result.message,
    });
    if (result.success) router.refresh();
  }

  return (
    <section className="border-border bg-surface rounded-xl border p-5">
      <div>
        <h2 className="font-medium">Tecnologias</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Tags estruturadas usadas no ranking do Analytics.
        </p>
      </div>

      {linked.length ? (
        <ul
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Tecnologias vinculadas"
        >
          {linked.map((technology) => (
            <li
              key={technology.id}
              className="bg-muted text-foreground inline-flex min-h-8 items-center gap-1 rounded-full pl-3 text-xs"
            >
              {technology.name}
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground grid size-8 place-items-center rounded-full transition-colors disabled:opacity-50"
                aria-label={`Remover ${technology.name}`}
                disabled={pending !== null}
                onClick={() => remove(technology.id)}
              >
                {pending === technology.id ? (
                  <LoaderCircle
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <X className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-4 text-xs">
          Nenhuma tecnologia informada.
        </p>
      )}

      <form className="mt-5" onSubmit={add}>
        <label className={labelStyles} htmlFor={`technology-${applicationId}`}>
          Adicionar tecnologia
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id={`technology-${applicationId}`}
            className={inputStyles}
            list={availableSuggestions.length ? listId : undefined}
            maxLength={60}
            autoComplete="off"
            placeholder="Ex.: React, TypeScript, PostgreSQL"
            value={name}
            disabled={pending !== null}
            onChange={(event) => setName(event.target.value)}
          />
          {availableSuggestions.length ? (
            <datalist id={listId}>
              {availableSuggestions.map((technology) => (
                <option key={technology.id} value={technology.name} />
              ))}
            </datalist>
          ) : null}
          <button
            className={buttonStyles({ size: "sm", className: "shrink-0" })}
            disabled={pending !== null || !name.trim()}
          >
            {pending === "add" ? (
              <LoaderCircle
                className="size-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Plus className="size-3.5" aria-hidden="true" />
            )}
            Adicionar
          </button>
        </div>
      </form>

      {feedback ? (
        <div className="mt-4">
          <FormFeedback kind={feedback.kind} message={feedback.message} />
        </div>
      ) : null}
    </section>
  );
}
