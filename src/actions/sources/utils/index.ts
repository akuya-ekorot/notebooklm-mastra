import { PDFDocument } from "pdf-lib";
import type { FileValidityResult } from "../validate-sources";

export const MAX_FILE_SIZE = 32 * 1024 * 1024;
export const MAX_PAGES = 100;

export const validateFile = async (file: File): Promise<FileValidityResult> => {
  if (file.type !== "application/pdf") {
    return {
      isValid: false,
      reason: "File is not PDF",
      file,
      fileName: file.name,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      reason: `File size exceeds maximum limit of 32MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      file,
      fileName: file.name,
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer, {
    updateMetadata: false,
  });

  if (doc.isEncrypted) {
    return {
      isValid: false,
      reason: "File is password protected or encrypted",
      file,
      fileName: file.name,
    };
  }

  const pageCount = doc.getPageCount();

  if (pageCount > MAX_PAGES) {
    return {
      isValid: false,
      reason: `File exceeds maximum page limit of ${MAX_PAGES} pages (current: ${pageCount} pages)`,
      file,
      fileName: file.name,
    };
  }

  return {
    file,
    isValid: true,
    isEncrypted: false,
    size: file.size,
    pageCount,
    fileName: file.name,
  };
};
