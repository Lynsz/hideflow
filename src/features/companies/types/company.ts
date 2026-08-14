import type { Database } from "@/types/database";

export type Company = Database["public"]["Tables"]["companies"]["Row"];

export type CompanyOption = Pick<Company, "id" | "name">;
