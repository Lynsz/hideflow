"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { inputStyles } from "@/components/ui/form-styles";
import { changeApplicationStatus } from "@/features/applications/actions";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
} from "@/features/applications/constants";
import type { ApplicationStatus } from "@/types/database";

export function StatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChange = async (nextStatus: ApplicationStatus) => {
    const previousStatus = status;
    setStatus(nextStatus);
    setIsPending(true);
    setFeedback("");

    try {
      const result = await changeApplicationStatus({
        applicationId,
        previousStatus,
        status: nextStatus,
      });

      if (!result.success) {
        setStatus(previousStatus);
        setFeedback(result.message);
        if (result.currentStatus) router.refresh();
        return;
      }

      setFeedback(result.message);
      router.refresh();
    } catch {
      setStatus(previousStatus);
      setFeedback(
        "A conexão falhou. O status anterior foi restaurado na tela.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <label
        className="text-muted-foreground text-xs"
        htmlFor="application-status"
      >
        Alterar status
      </label>
      <div className="mt-2 flex items-center gap-2">
        <select
          id="application-status"
          className={inputStyles}
          value={status}
          disabled={isPending}
          onChange={(event) =>
            handleChange(event.target.value as ApplicationStatus)
          }
        >
          {APPLICATION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {APPLICATION_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        {isPending ? (
          <LoaderCircle
            className="text-accent size-4 animate-spin"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {feedback ? (
        <p className="text-muted-foreground mt-2 text-xs" role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
