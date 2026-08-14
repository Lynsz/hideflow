import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectId = process.env.SUPABASE_PROJECT_ID;
const supabaseCli = resolve("node_modules", "supabase", "dist", "supabase.js");
const args = [
  supabaseCli,
  "gen",
  "types",
  "typescript",
  ...(projectId ? ["--project-id", projectId] : ["--local"]),
];

const result = spawnSync(process.execPath, args, {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (result.status !== 0 || !result.stdout) {
  process.stderr.write(
    result.stderr ||
      result.stdout ||
      result.error?.message ||
      "Não foi possível gerar os tipos do Supabase.\n",
  );
  process.exit(1);
}

const outputPath = resolve("src/types/database.ts");
writeFileSync(outputPath, result.stdout, "utf8");
process.stdout.write(`Tipos atualizados em ${outputPath}\n`);
