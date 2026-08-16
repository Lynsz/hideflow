import { DOCX_MIME_TYPE, PDF_MIME_TYPE } from "@/features/documents/constants";

export async function hasValidDocumentSignature(file: File) {
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());

  if (file.type === PDF_MIME_TYPE) {
    return String.fromCharCode(...header) === "%PDF-";
  }

  if (file.type === DOCX_MIME_TYPE) {
    return (
      header[0] === 0x50 &&
      header[1] === 0x4b &&
      header[2] === 0x03 &&
      header[3] === 0x04
    );
  }

  return false;
}
