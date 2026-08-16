import "server-only";

import type {
  DocumentFileMetadata,
  DocumentMetadata,
} from "@/features/documents/schemas/document-schema";
import { createClient } from "@/lib/supabase/server";

const DOCUMENT_SELECT =
  "id, user_id, application_id, name, original_name, storage_path, document_type, mime_type, file_size, created_at, updated_at" as const;

export async function getOwnedApplication(
  userId: string,
  applicationId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function getOwnedDocument(userId: string, documentId: string) {
  const supabase = await createClient();
  return supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function insertDocument(
  userId: string,
  applicationId: string,
  metadata: DocumentMetadata,
  file: DocumentFileMetadata,
  storagePath: string,
) {
  const supabase = await createClient();
  return supabase
    .from("documents")
    .insert({
      user_id: userId,
      application_id: applicationId,
      name: metadata.name || file.name,
      original_name: file.name,
      storage_path: storagePath,
      document_type: metadata.documentType,
      mime_type: file.type,
      file_size: file.size,
    })
    .select(DOCUMENT_SELECT)
    .single();
}

export async function renameDocumentRecord(
  userId: string,
  documentId: string,
  name: string,
) {
  const supabase = await createClient();
  return supabase
    .from("documents")
    .update({ name })
    .eq("id", documentId)
    .eq("user_id", userId)
    .select("id, application_id")
    .maybeSingle();
}

export async function deleteDocumentRecord(userId: string, documentId: string) {
  const supabase = await createClient();
  return supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
}

export async function getApplicationDocumentPaths(
  userId: string,
  applicationId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("documents")
    .select("storage_path")
    .eq("application_id", applicationId)
    .eq("user_id", userId);
}
