"use server";

import { z } from "zod";
import { actionClient } from "../safe-action";
import { validateFile } from "./utils";

export type FileValidityResult = ValidFile | InvalidFile;

type ValidFile = {
  isValid: true;
  isEncrypted: false;
  size: number;
  pageCount: number;
  fileName: string;
  file: File;
};

type InvalidFile = {
  isValid: false;
  reason: string;
  fileName: string;
  file: File;
};

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
    // Validate individual sources
    const validityResults = await Promise.allSettled(
      parsedInput.files.map((f) => validateFile(f)),
    );

    const { pages, size } = (
      validityResults
        .filter((r) => r.status === "fulfilled")
        .filter(
          (r) => r.value.isValid === true,
        ) as PromiseFulfilledResult<ValidFile>[]
    ).reduce(
      (pv, cv) => ({
        pages: pv.pages + cv.value.pageCount,
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

    // Returns list of sources that both passed and failed validation.
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
