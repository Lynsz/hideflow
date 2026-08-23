import { z } from "zod";

import { MAX_PRODUCTIVITY_TARGET } from "@/features/goals/constants";

const targetSchema = z
  .number({ error: "Informe um número inteiro." })
  .int("Use apenas números inteiros.")
  .min(0, "A meta não pode ser negativa.")
  .max(
    MAX_PRODUCTIVITY_TARGET,
    `A meta deve ser de no máximo ${MAX_PRODUCTIVITY_TARGET}.`,
  );

export const productivityGoalSchema = z.object({
  applicationsTarget: targetSchema,
  followUpsTarget: targetSchema,
  outreachTarget: targetSchema,
});
