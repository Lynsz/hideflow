import { z } from "zod";

import { normalizeTechnologyName } from "@/features/technologies/services/technology-normalizer";

const technologyNameSchema = z
  .string()
  .transform((value) => normalizeTechnologyName(value).name)
  .pipe(
    z
      .string()
      .min(1, "Informe uma tecnologia.")
      .max(60, "Use no máximo 60 caracteres."),
  );

export const addApplicationTechnologySchema = z.object({
  applicationId: z.uuid("Candidatura inválida."),
  name: technologyNameSchema,
});

export const removeApplicationTechnologySchema = z.object({
  applicationId: z.uuid("Candidatura inválida."),
  technologyId: z.uuid("Tecnologia inválida."),
});
