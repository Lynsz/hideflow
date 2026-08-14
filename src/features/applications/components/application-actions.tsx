"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { deleteApplication } from "@/features/applications/actions";

export function DeleteApplicationButton({
  applicationId,
  jobTitle,
  companyName,
}: {
  applicationId: string;
  jobTitle: string;
  companyName: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Excluir a candidatura “${jobTitle}” na empresa “${companyName}”?`,
      )
    ) {
      return;
    }

    setIsPending(true);
    setError("");
    const result = await deleteApplication(applicationId);
    setIsPending(false);
    if (!result.success) {
      setError(result.message);
      return;
    }

    router.replace(result.redirectTo ?? "/dashboard/candidaturas");
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        className={buttonStyles({ variant: "secondary" })}
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="size-4" aria-hidden="true" />
        )}
        Excluir
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
