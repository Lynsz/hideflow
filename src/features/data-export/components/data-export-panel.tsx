import { Database, FileJson, FileSpreadsheet, ShieldCheck } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";

const EXPORT_OPTIONS = [
  {
    format: "json",
    title: "Backup completo",
    description:
      "Perfil e registros das 17 tabelas privadas em um arquivo JSON versionado.",
    action: "Baixar JSON",
    icon: FileJson,
  },
  {
    format: "csv",
    title: "Candidaturas em planilha",
    description:
      "Resumo das candidaturas com empresas e tecnologias em CSV UTF-8.",
    action: "Baixar CSV",
    icon: FileSpreadsheet,
  },
] as const;

export function DataExportPanel() {
  return (
    <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="bg-accent/10 text-accent grid size-9 shrink-0 place-items-center rounded-lg">
          <Database className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-medium">Portabilidade dos dados</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Exporte uma cópia dos registros vinculados à sua conta.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {EXPORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <article
              key={option.format}
              className="border-border bg-background rounded-lg border p-4"
            >
              <Icon className="text-accent size-4" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-medium">{option.title}</h3>
              <p className="text-muted-foreground mt-1 min-h-10 text-xs leading-5">
                {option.description}
              </p>
              <a
                href={`/dashboard/configuracoes/exportar?format=${option.format}`}
                download
                className={buttonStyles({
                  variant: "secondary",
                  size: "sm",
                  className: "mt-4 w-full",
                })}
              >
                {option.action}
              </a>
            </article>
          );
        })}
      </div>

      <div className="text-muted-foreground mt-4 flex gap-2 text-xs leading-5">
        <ShieldCheck
          className="text-accent mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <p>
          Os arquivos são gerados sob demanda e não ficam armazenados. O backup
          inclui metadados dos documentos, mas não o conteúdo privado do
          Storage.
        </p>
      </div>
    </section>
  );
}
