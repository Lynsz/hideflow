import type { Database } from "@/types/database";

export type Technology = Database["public"]["Tables"]["technologies"]["Row"];
export type TechnologyOption = Pick<Technology, "id" | "name">;
