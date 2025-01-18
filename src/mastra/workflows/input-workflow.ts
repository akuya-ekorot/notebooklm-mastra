import { PDFDocument } from "pdf-lib";
import { Step, Workflow } from "@mastra/core";
import { z } from "zod";

export const inputWorkflow = new Workflow({
  name: "inputWorkflow",
  triggerSchema: z.object({
    file: z.instanceof(File),
  }),
})
  .step(
    new Step({
      id: "fileValidation",
      description: "Validate file input",
      inputSchema: z.object({ file: z.instanceof(File) }),
      outputSchema: z.object({
        isEncrypted: z.boolean().nullish(),
        isValid: z.boolean(),
        reason: z.string().nullish(),
      }),
      execute: async ({ context }) => {
        if (context.file.type !== "application/pdf") {
          return {
            isEncrypted: null,
            isValid: false,
            reason: "Not a PDF file",
          };
        }

        const arrayBuffer = await context.file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, {
          updateMetadata: false,
        });

        return {
          isEncrypted: doc.isEncrypted,
          isValid: !doc.isEncrypted,
          reason: doc.isEncrypted
            ? "PDF is password protected or isEncrypted"
            : null,
        };
      },
    }),
    {
      variables: {
        file: { step: "trigger", path: "file" },
      },
    },
  )
  .commit();
