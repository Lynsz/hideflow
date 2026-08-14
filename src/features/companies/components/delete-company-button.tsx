"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { deleteCompany } from "@/features/companies/actions";

export function DeleteCompanyButton({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Excluir a empresa “${companyName}”? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setIsPending(true);
    setError("");
    const result = await deleteCompany(companyId);
    setIsPending(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        className={buttonStyles({ variant: "ghost", size: "sm" })}
        disabled={isPending}
        onClick={handleDelete}
        aria-label={`Excluir ${companyName}`}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="size-4" aria-hidden="true" />
        )}
        Excluir
      </button>
      {error ? (
        <p className="mt-2 max-w-xs text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
