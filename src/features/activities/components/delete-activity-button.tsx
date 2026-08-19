"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { buttonStyles } from "@/components/ui/button";
import { deleteActivity } from "@/features/activities/actions";

export function DeleteActivityButton({
  activityId,
  applicationId,
  title,
}: {
  activityId: string;
  applicationId: string;
  title: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    if (!window.confirm(`Excluir a interação “${title}”?`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteActivity({ activityId, applicationId });
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label={`Excluir interação: ${title}`}
        className={buttonStyles({
          variant: "ghost",
          size: "sm",
          className: "h-7 px-2 text-xs",
        })}
      >
        {isPending ? (
          <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="size-3" aria-hidden="true" />
        )}
        Excluir
      </button>
      {error ? (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
