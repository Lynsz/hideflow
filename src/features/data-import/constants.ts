export const APPLICATION_IMPORT_MAX_FILE_SIZE_BYTES = 1024 * 1024;
export const APPLICATION_IMPORT_MAX_ROWS = 200;
export const APPLICATION_IMPORT_PREVIEW_ROWS = 8;
export const APPLICATION_IMPORT_MAX_TECHNOLOGIES = 20;

export const APPLICATION_IMPORT_HEADERS = [
  "id",
  "empresa",
  "vaga",
  "status",
  "modalidade",
  "contrato",
  "localizacao",
  "salario_minimo",
  "salario_maximo",
  "moeda",
  "data_candidatura",
  "fonte",
  "url",
  "tecnologias",
  "criada_em",
  "atualizada_em",
] as const;

export const APPLICATION_IMPORT_ACCEPTED_MIME_TYPES = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
] as const;
