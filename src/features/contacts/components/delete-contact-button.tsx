"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { deleteContact } from "@/features/contacts/actions";

export function DeleteContactButton({
  contactId,
  name,
}: {
  contactId: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (
      !window.confirm(
        `Excluir o contato “${name}”? Entrevistas serão mantidas sem o vínculo ao contato.`,
      )
    )
      return;
    setPending(true);
    setError("");
    const result = await deleteContact(contactId);
    setPending(false);
    if (!result.success) return setError(result.message);
    router.replace(result.redirectTo!);
    router.refresh();
  }
  return (
    <div>
      <button
        type="button"
        className={buttonStyles({ variant: "secondary" })}
        disabled={pending}
        onClick={remove}
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Excluir
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
