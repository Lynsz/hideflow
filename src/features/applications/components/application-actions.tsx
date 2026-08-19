"use client";

import { Archive, ArchiveRestore, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { buttonStyles } from "@/components/ui/button";
import {
  changeApplicationArchive,
  deleteApplication,
} from "@/features/applications/actions";

export function ArchiveApplicationButton({
  applicationId,
  jobTitle,
  archived,
}: {
  applicationId: string;
  jobTitle: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleArchive = () => {
    if (
      !archived &&
      !window.confirm(
        `Arquivar a candidatura “${jobTitle}”? Ela sairá da lista ativa e do Kanban, mas nenhum dado será excluído.`,
      )
    ) {
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await changeApplicationArchive({
        applicationId,
        archived: !archived,
      });
      if (!result.success) {
        setError(result.message);
        return;
      }

      if (result.redirectTo) router.replace(result.redirectTo);
      router.refresh();
    });
  };

  const Icon = archived ? ArchiveRestore : Archive;
  return (
    <div>
      <button
        type="button"
        className={buttonStyles({ variant: "secondary" })}
        disabled={isPending}
        onClick={handleArchive}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Icon className="size-4" aria-hidden="true" />
        )}
        {archived ? "Restaurar" : "Arquivar"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

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
