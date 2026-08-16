"use client";
import { LoaderCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/form-styles";
import { setApplicationContact } from "@/features/contacts/actions";
import type { Contact } from "@/features/contacts/types/contact";

type Item = Pick<Contact, "id" | "name" | "role" | "contact_type" | "email">;
export function ApplicationContactManager({
  applicationId,
  linked,
  available,
}: {
  applicationId: string;
  linked: Item[];
  available: Item[];
}) {
  const router = useRouter();
  const [contactId, setContactId] = useState(available[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function change(id: string, add: boolean) {
    setPending(true);
    setError("");
    const result = await setApplicationContact(
      { applicationId, contactId: id },
      add,
    );
    setPending(false);
    if (!result.success) return setError(result.message);
    router.refresh();
  }
  return (
    <div>
      {linked.length ? (
        <ul className="space-y-2">
          {linked.map((contact) => (
            <li
              key={contact.id}
              className="bg-muted/50 flex items-center justify-between gap-3 rounded-lg p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{contact.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {contact.role || contact.email || "Contato"}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Remover ${contact.name}`}
                disabled={pending}
                onClick={() => change(contact.id, false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nenhum contato associado.
        </p>
      )}
      {available.length ? (
        <div className="mt-4 flex gap-2">
          <select
            className={inputStyles}
            value={contactId}
            onChange={(event) => setContactId(event.target.value)}
            aria-label="Contato da empresa"
          >
            {available.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={buttonStyles({ variant: "secondary" })}
            disabled={pending || !contactId}
            onClick={() => change(contactId, true)}
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Associar
          </button>
        </div>
      ) : null}
      {error && (
        <p className="mt-2 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
