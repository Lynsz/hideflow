"use client";

import { Check, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { deleteReminder, toggleReminder } from "@/features/reminders/actions";

export function ReminderCardActions({
  reminderId,
  completed,
  stayOnPage = false,
}: {
  reminderId: string;
  completed: boolean;
  stayOnPage?: boolean;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<
    "toggle" | "delete" | null
  >(null);
  const [error, setError] = useState("");

  async function toggle() {
    setError("");
    setPendingAction("toggle");
    const result = await toggleReminder(reminderId, !completed);
    setPendingAction(null);
    if (!result.success) {
      setError(result.message);
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Excluir este lembrete permanentemente?")) return;
    setError("");
    setPendingAction("delete");
    const result = await deleteReminder(reminderId);
    setPendingAction(null);
    if (!result.success) {
      setError(result.message);
      return;
    }
    if (!stayOnPage) router.replace(result.redirectTo!);
    router.refresh();
  }

  const disabled = pendingAction !== null;

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className={buttonStyles({ variant: "secondary", size: "sm" })}
          onClick={toggle}
          disabled={disabled}
        >
          {pendingAction === "toggle" ? (
            <LoaderCircle
              className="size-3.5 animate-spin"
              aria-hidden="true"
            />
          ) : completed ? (
            <RotateCcw className="size-3.5" aria-hidden="true" />
          ) : (
            <Check className="size-3.5" aria-hidden="true" />
          )}
          {completed ? "Reabrir" : "Concluir"}
        </button>
        <button
          type="button"
          className={buttonStyles({ variant: "ghost", size: "sm" })}
          onClick={remove}
          disabled={disabled}
        >
          {pendingAction === "delete" ? (
            <LoaderCircle
              className="size-3.5 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Trash2 className="size-3.5" aria-hidden="true" />
          )}
          Excluir
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
