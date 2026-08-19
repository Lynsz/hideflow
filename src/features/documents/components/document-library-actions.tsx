"use client";

import {
  Check,
  Download,
  Eye,
  LoaderCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/form-styles";
import {
  deleteDocument,
  getDocumentAccessUrl,
  renameDocument,
} from "@/features/documents/actions";

type Feedback = { kind: "success" | "error"; message: string } | null;

export function DocumentLibraryActions({
  documentId,
  documentName,
}: {
  documentId: string;
  documentName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(documentName);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function openDocument(intent: "preview" | "download") {
    const newWindow = window.open("", "_blank");
    if (newWindow) newWindow.opener = null;
    setFeedback(null);
    startTransition(async () => {
      const result = await getDocumentAccessUrl(documentId, intent);
      if (!result.success || !result.url) {
        newWindow?.close();
        setFeedback({ kind: "error", message: result.message });
        return;
      }
      if (newWindow) newWindow.location.href = result.url;
      else window.location.href = result.url;
    });
  }

  function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await renameDocument(documentId, name);
      setFeedback({
        kind: result.success ? "success" : "error",
        message: result.message,
      });
      if (!result.success) return;
      setEditing(false);
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm(`Excluir o documento “${documentName}”?`)) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteDocument(documentId);
      setFeedback({
        kind: result.success ? "success" : "error",
        message: result.message,
      });
      if (result.success) router.refresh();
    });
  }

  if (editing) {
    return (
      <div>
        <form
          onSubmit={submitRename}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <label className="sr-only" htmlFor={`library-name-${documentId}`}>
            Novo nome do documento
          </label>
          <input
            id={`library-name-${documentId}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            disabled={isPending}
            autoFocus
            className={`${inputStyles} min-w-0 flex-1`}
          />
          <div className="flex gap-2">
            <button
              disabled={isPending || !name.trim()}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
              aria-label="Salvar novo nome"
            >
              {isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setName(documentName);
                setEditing(false);
              }}
              className={buttonStyles({ variant: "ghost", size: "sm" })}
              aria-label="Cancelar renomeação"
            >
              <X className="size-4" />
            </button>
          </div>
        </form>
        {feedback ? (
          <p
            className={`mt-2 text-xs ${feedback.kind === "error" ? "text-red-300" : "text-accent"}`}
            role="status"
          >
            {feedback.message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => openDocument("preview")}
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Eye className="size-4" />
          )}
          Visualizar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => openDocument("download")}
          className={buttonStyles({ variant: "ghost", size: "sm" })}
        >
          <Download className="size-4" />
          Baixar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setFeedback(null);
            setEditing(true);
          }}
          className={buttonStyles({ variant: "ghost", size: "sm" })}
        >
          <Pencil className="size-4" />
          Renomear
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={remove}
          className={buttonStyles({
            variant: "ghost",
            size: "sm",
            className: "hover:text-red-300",
          })}
        >
          <Trash2 className="size-4" />
          Excluir
        </button>
      </div>
      {feedback ? (
        <p
          className={`mt-2 text-xs ${feedback.kind === "error" ? "text-red-300" : "text-accent"}`}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
