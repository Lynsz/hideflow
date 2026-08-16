import "server-only";

import {
  DOCUMENT_BUCKET,
  SIGNED_URL_TTL_SECONDS,
} from "@/features/documents/constants";
import { createClient } from "@/lib/supabase/server";

export async function uploadDocumentObject(
  storagePath: string,
  file: File,
  mimeType: string,
) {
  const supabase = await createClient();
  return supabase.storage.from(DOCUMENT_BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: mimeType,
    upsert: false,
  });
}

export async function removeDocumentObjects(storagePaths: string[]) {
  if (!storagePaths.length) return { data: [], error: null };
  const supabase = await createClient();
  return supabase.storage.from(DOCUMENT_BUCKET).remove(storagePaths);
}

export async function createDocumentSignedUrl(
  storagePath: string,
  downloadName?: string,
) {
  const supabase = await createClient();
  return supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(
      storagePath,
      SIGNED_URL_TTL_SECONDS,
      downloadName ? { download: downloadName } : undefined,
    );
}
