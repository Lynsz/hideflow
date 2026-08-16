function basename(value: string) {
  return value.replaceAll("\\", "/").split("/").pop() ?? "";
}

export function sanitizeDocumentFilename(value: string) {
  const safeBasename = basename(value);
  const extension = safeBasename.split(".").pop()?.toLowerCase() ?? "";
  const rawStem = safeBasename.slice(0, -(extension.length + 1));
  const stem = rawStem
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  return `${stem || "documento"}.${extension}`;
}

export function buildDocumentStoragePath(
  userId: string,
  applicationId: string,
  originalName: string,
  objectId = crypto.randomUUID(),
) {
  return `${userId}/${applicationId}/${objectId}-${sanitizeDocumentFilename(originalName)}`;
}
