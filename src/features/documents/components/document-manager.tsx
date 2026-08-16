"use client";

import {
  Check,
  Download,
  Eye,
  FileText,
  LoaderCircle,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { DragEvent, FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles, labelStyles } from "@/components/ui/form-styles";
import { LocalDateTime } from "@/components/ui/local-date-time";
import {
  deleteDocument,
  getDocumentAccessUrl,
  renameDocument,
  uploadDocument,
} from "@/features/documents/actions";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_TYPES,
  PDF_MIME_TYPE,
  formatDocumentType,
} from "@/features/documents/constants";
import { formatFileSize } from "@/features/documents/services/document-formatters";
import type { DocumentListItem } from "@/features/documents/types/document";

type Props = {
  applicationId: string;
  documents: DocumentListItem[];
};

type Feedback = { kind: "success" | "error"; message: string } | null;

export function DocumentManager({ applicationId, documents }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busyDocumentId, setBusyDocumentId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [isPending, startTransition] = useTransition();

  function setFile(file: File | undefined) {
    setSelectedFile(file ?? null);
    setFeedback(null);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    setFile(event.dataTransfer.files[0]);
  }

  function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setFeedback({ kind: "error", message: "Selecione um arquivo." });
      return;
    }
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    formData.set("file", selectedFile);
    startTransition(async () => {
      const result = await uploadDocument(applicationId, formData);
      setFeedback({
        kind: result.success ? "success" : "error",
        message: result.message,
      });
      if (!result.success) return;
      setSelectedFile(null);
      formElement.reset();
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    });
  }

  function openDocument(documentId: string, intent: "preview" | "download") {
    const newWindow = window.open("", "_blank");
    if (newWindow) newWindow.opener = null;
    setBusyDocumentId(documentId);
    setFeedback(null);
    startTransition(async () => {
      const result = await getDocumentAccessUrl(documentId, intent);
      setBusyDocumentId("");
      if (!result.success || !result.url) {
        newWindow?.close();
        setFeedback({ kind: "error", message: result.message });
        return;
      }
      if (newWindow) newWindow.location.href = result.url;
      else window.location.href = result.url;
    });
  }

  function handleRename(event: FormEvent<HTMLFormElement>, documentId: string) {
    event.preventDefault();
    setBusyDocumentId(documentId);
    setFeedback(null);
    startTransition(async () => {
      const result = await renameDocument(documentId, editingName);
      setBusyDocumentId("");
      setFeedback({
        kind: result.success ? "success" : "error",
        message: result.message,
      });
      if (!result.success) return;
      setEditingId("");
      setEditingName("");
      router.refresh();
    });
  }

  function handleDelete(document: DocumentListItem) {
    if (!window.confirm(`Excluir o documento “${document.name}”?`)) return;
    setBusyDocumentId(document.id);
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteDocument(document.id);
      setBusyDocumentId("");
      setFeedback({
        kind: result.success ? "success" : "error",
        message: result.message,
      });
      if (result.success) router.refresh();
    });
  }

  return (
    <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
      <div>
        <h2 className="font-medium">Documentos</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Arquivos privados em PDF ou DOCX, com até 10 MiB cada.
        </p>
      </div>

      <form className="mt-5" onSubmit={handleUpload} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelStyles}>
            Tipo do documento
            <select
              className={`${inputStyles} mt-2`}
              name="documentType"
              defaultValue="resume"
              disabled={isPending}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelStyles}>
            Nome de exibição (opcional)
            <input
              className={`${inputStyles} mt-2`}
              name="name"
              maxLength={255}
              disabled={isPending}
              placeholder="Ex.: Currículo adaptado para a vaga"
            />
          </label>
        </div>

        <label
          className={`focus-within:ring-accent/30 mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition focus-within:ring-2 ${
            dragging
              ? "border-accent bg-accent/5"
              : "border-border bg-background hover:border-accent/60"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="text-accent size-5" aria-hidden="true" />
          <span className="mt-2 text-sm font-medium">
            {selectedFile
              ? selectedFile.name
              : "Arraste um arquivo ou clique para selecionar"}
          </span>
          <span className="text-muted-foreground mt-1 text-xs">
            {selectedFile
              ? formatFileSize(selectedFile.size)
              : "PDF ou DOCX · máximo de 10 MiB"}
          </span>
          <input
            ref={fileInput}
            className="sr-only"
            type="file"
            name="file"
            accept={DOCUMENT_ACCEPT}
            disabled={isPending}
            onChange={(event) => setFile(event.target.files?.[0])}
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground max-w-xl text-xs">
            Para substituir, exclua o documento atual e envie o novo arquivo. O
            HireFlow não sobrescreve arquivos silenciosamente.
          </p>
          <button
            className={buttonStyles()}
            disabled={isPending || !selectedFile}
          >
            {isPending && !busyDocumentId ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Enviar documento
          </button>
        </div>
      </form>

      {feedback ? (
        <div className="mt-4">
          <FormFeedback kind={feedback.kind} message={feedback.message} />
        </div>
      ) : null}

      {documents.length ? (
        <ul className="border-border mt-6 divide-y border-t">
          {documents.map((document) => {
            const busy = isPending && busyDocumentId === document.id;
            const isEditing = editingId === document.id;
            return (
              <li
                key={document.id}
                className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <FileText className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    {isEditing ? (
                      <form
                        className="flex max-w-lg flex-wrap gap-2"
                        onSubmit={(event) => handleRename(event, document.id)}
                      >
                        <label
                          className="sr-only"
                          htmlFor={`name-${document.id}`}
                        >
                          Novo nome
                        </label>
                        <input
                          id={`name-${document.id}`}
                          className={`${inputStyles} min-w-40 flex-1`}
                          value={editingName}
                          maxLength={255}
                          disabled={isPending}
                          autoFocus
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                        />
                        <button
                          className={buttonStyles({
                            variant: "secondary",
                            size: "sm",
                          })}
                          disabled={isPending || !editingName.trim()}
                          aria-label="Salvar novo nome"
                        >
                          {busy ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          className={buttonStyles({
                            variant: "ghost",
                            size: "sm",
                          })}
                          disabled={isPending}
                          aria-label="Cancelar renomeação"
                          onClick={() => setEditingId("")}
                        >
                          <X className="size-4" />
                        </button>
                      </form>
                    ) : (
                      <p className="truncate text-sm font-medium">
                        {document.name}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatDocumentType(document.document_type)} ·{" "}
                      {formatFileSize(document.file_size)} ·{" "}
                      <LocalDateTime value={document.created_at} />
                    </p>
                    {document.name !== document.original_name ? (
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        Arquivo original: {document.original_name}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-1">
                  {document.mime_type === PDF_MIME_TYPE ? (
                    <button
                      type="button"
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                      disabled={isPending}
                      onClick={() => openDocument(document.id, "preview")}
                    >
                      <Eye className="size-4" />
                      Visualizar
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                    disabled={isPending}
                    onClick={() => openDocument(document.id, "download")}
                  >
                    <Download className="size-4" />
                    Baixar
                  </button>
                  <button
                    type="button"
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                    disabled={isPending || isEditing}
                    onClick={() => {
                      setEditingId(document.id);
                      setEditingName(document.name);
                    }}
                  >
                    <Pencil className="size-4" />
                    Renomear
                  </button>
                  <button
                    type="button"
                    className={buttonStyles({
                      variant: "ghost",
                      size: "sm",
                      className: "hover:text-red-300",
                    })}
                    disabled={isPending}
                    onClick={() => handleDelete(document)}
                  >
                    {busy ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-6 border-t pt-5 text-sm">
          Nenhum documento adicionado a esta candidatura.
        </p>
      )}
    </section>
  );
}
