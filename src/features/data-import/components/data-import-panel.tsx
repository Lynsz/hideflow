"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles, labelStyles } from "@/components/ui/form-styles";
import {
  importApplicationsCsv,
  previewApplicationsCsv,
} from "@/features/data-import/actions";
import { APPLICATION_IMPORT_MAX_ROWS } from "@/features/data-import/constants";
import type {
  ApplicationImportActionResult,
  ApplicationImportPreview,
  ApplicationImportSummary,
} from "@/features/data-import/types/data-import";
import { APPLICATION_STATUS_LABELS } from "@/features/applications/constants";

type PendingAction = "preview" | "import" | null;

function createFileFormData(file: File) {
  const formData = new FormData();
  formData.set("file", file);
  return formData;
}

export function DataImportPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [feedback, setFeedback] =
    useState<ApplicationImportActionResult | null>(null);
  const [preview, setPreview] = useState<ApplicationImportPreview | null>(null);
  const [summary, setSummary] = useState<ApplicationImportSummary | null>(null);
  const busy = isPending || pendingAction !== null;

  function generatePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setFeedback({ success: false, message: "Selecione um arquivo CSV." });
      return;
    }

    setPendingAction("preview");
    setFeedback(null);
    setSummary(null);
    startTransition(async () => {
      try {
        const result = await previewApplicationsCsv(createFileFormData(file));
        setFeedback(result);
        setPreview(result.preview ?? null);
      } catch {
        setFeedback({
          success: false,
          message: "Não foi possível analisar o arquivo. Tente novamente.",
        });
        setPreview(null);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function confirmImport() {
    if (!file || !preview || preview.errorCount > 0) return;
    setPendingAction("import");
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await importApplicationsCsv(createFileFormData(file));
        setFeedback(result);

        if (!result.success || !result.summary) {
          setPreview(result.preview ?? preview);
          return;
        }

        setSummary(result.summary);
        setPreview(null);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } catch {
        setFeedback({
          success: false,
          message:
            "Não foi possível confirmar o resultado. Atualize a lista antes de tentar novamente.",
        });
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="bg-accent/10 text-accent grid size-9 shrink-0 place-items-center rounded-lg">
          <Upload className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-medium">Importar candidaturas</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Revise uma planilha do HireFlow antes de gravar novos registros.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={generatePreview}>
        <label className={labelStyles} htmlFor="applications-csv">
          Arquivo CSV
          <input
            ref={inputRef}
            id="applications-csv"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            disabled={busy}
            aria-describedby="applications-csv-help"
            className={`${inputStyles} file:text-foreground mt-2 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-transparent file:text-sm file:font-medium`}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setPreview(null);
              setSummary(null);
              setFeedback(null);
            }}
          />
          <span
            id="applications-csv-help"
            className="text-muted-foreground mt-1.5 block text-xs leading-5"
          >
            Use o CSV exportado nesta página. Limite de 1 MiB e até{" "}
            {APPLICATION_IMPORT_MAX_ROWS} candidaturas.
          </span>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy || !file}
            className={buttonStyles({ variant: "secondary" })}
          >
            {pendingAction === "preview" ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <FileSearch className="size-4" aria-hidden="true" />
            )}
            {pendingAction === "preview" ? "Analisando…" : "Gerar prévia"}
          </button>
        </div>
      </form>

      {feedback ? (
        <div className="mt-4">
          <FormFeedback
            kind={feedback.success ? "success" : "error"}
            message={feedback.message}
          />
        </div>
      ) : null}

      {preview ? (
        <div className="border-border bg-background mt-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Prévia da importação</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {preview.totalRows} linha(s) encontrada(s)
              </p>
            </div>
            <FileSpreadsheet
              className="text-accent size-5"
              aria-hidden="true"
            />
          </div>

          {preview.rows.length ? (
            <div className="border-border mt-4 overflow-x-auto rounded-lg border">
              <table className="w-full min-w-xl text-left text-xs">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Linha</th>
                    <th className="px-3 py-2 font-medium">Empresa</th>
                    <th className="px-3 py-2 font-medium">Vaga</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Tecnologias
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {preview.rows.map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="text-muted-foreground px-3 py-2">
                        {row.rowNumber}
                      </td>
                      <td className="max-w-44 truncate px-3 py-2">
                        {row.companyName}
                      </td>
                      <td className="max-w-56 truncate px-3 py-2">
                        {row.jobTitle}
                      </td>
                      <td className="px-3 py-2">
                        {APPLICATION_STATUS_LABELS[row.status]}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.technologyCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {preview.errors.length ? (
            <div className="mt-4">
              <p className="flex items-center gap-2 text-xs font-medium text-red-300">
                <AlertTriangle className="size-4" aria-hidden="true" />
                {preview.errorCount} problema(s) encontrado(s)
              </p>
              <ul className="text-muted-foreground mt-2 space-y-1 text-xs">
                {preview.errors.map((error, index) => (
                  <li key={`${error.rowNumber ?? "file"}-${index}`}>
                    {error.rowNumber ? `Linha ${error.rowNumber}: ` : ""}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <CheckCircle2
                  className="text-accent size-4"
                  aria-hidden="true"
                />
                Duplicatas de empresa, vaga e data serão ignoradas.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={confirmImport}
                className={buttonStyles()}
              >
                {pendingAction === "import" ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Upload className="size-4" aria-hidden="true" />
                )}
                {pendingAction === "import"
                  ? "Importando…"
                  : "Confirmar importação"}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {summary ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ["Importadas", summary.imported],
            ["Duplicadas", summary.skipped],
            ["Empresas criadas", summary.companiesCreated],
            ["Tecnologias vinculadas", summary.technologiesLinked],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-border bg-background rounded-lg border p-3"
            >
              <dt className="text-muted-foreground text-[10px] uppercase">
                {label}
              </dt>
              <dd className="mt-1 text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
