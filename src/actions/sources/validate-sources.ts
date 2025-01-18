"use server";

import { z } from "zod";
import { actionClient } from "../safe-action";
import { PDFDocument } from "pdf-lib";

export const validateSourcesAction = actionClient
  .metadata({ name: "validateSourcesAction" })
  .schema(
    z.object({
      files: z
        .array(z.instanceof(File))
        .max(5, "Can process maximum of 5 files at once"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const validityResults = await Promise.allSettled(
      parsedInput.files.map((f) => processFile(f)),
    );

    const { pages, size } = (
      validityResults
        .filter((r) => r.status === "fulfilled")
        .filter(
          (r) => r.value.isValid === true,
        ) as PromiseFulfilledResult<ValidFile>[]
    ).reduce(
      (pv, cv) => ({
        pages: pv.pages + cv.value.pages,
        size: pv.size + cv.value.size,
      }),
      {} as { pages: number; size: number },
    );

    if (pages > 100) {
      return {
        ok: false,
        reason: "Exceeded 100 pages, which is the maximum per request",
      };
    }

    if (size > 32 * 1000 * 1000) {
      return {
        ok: false,
        reason: "Exceeded 32MB, which is maximum per request",
      };
    }

    return {
      ok: true,
      successful: validityResults.filter(
        (r) => r.status === "fulfilled" && r.value.isValid,
      ),
      failed: validityResults.filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && !r.value.isValid),
      ),
    };
  });

type FileValidityResult = ValidFile | InvalidFile;
type ValidFile = {
  isValid: true;
  isEncrypted: false;
  size: number;
  pages: number;
};
type InvalidFile = {
  isValid: false;
  reason: string;
};

const MAX_FILE_SIZE = 32 * 1024 * 1024;
const MAX_PAGES = 100;

const processFile = async (file: File): Promise<FileValidityResult> => {
  if (file.type !== "application/pdf") {
    return {
      isValid: false,
      reason: "File is not PDF",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      reason: `File size exceeds maximum limit of 32MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
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
    };
  }

  const pageCount = doc.getPageCount();

  if (pageCount > MAX_PAGES) {
    return {
      isValid: false,
      reason: `File exceeds maximum page limit of ${MAX_PAGES} pages (current: ${pageCount} pages)`,
    };
  }

  return {
    isValid: true,
    isEncrypted: false,
    size: file.size,
    pages: pageCount,
  };
};
