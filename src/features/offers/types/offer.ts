import type { Database } from "@/types/database";

export type ApplicationOffer =
  Database["public"]["Tables"]["application_offers"]["Row"];

export type OfferWithApplication = ApplicationOffer & {
  application: {
    id: string;
    job_title: string;
    status: Database["public"]["Tables"]["applications"]["Row"]["status"];
    archived_at: string | null;
    company: { id: string; name: string };
  };
};
