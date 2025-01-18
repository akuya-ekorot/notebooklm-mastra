"use server";

import { z } from "zod";
import { actionClient } from "../safe-action";
import { sources } from "@/db/schema/sources";
import { notebooks } from "@/db/schema/notebooks";

const inputSchema = z.object({
  sessionId: z.string().uuid(),
  sources: z.array(
    z.union([
      z.object({
        isValid: z.literal(true),
        isEncrypted: z.literal(false),
        size: z.number().int(),
        pageCount: z.number().int(),
        file: z.instanceof(File),
        fileName: z.string(),
      }),
      z.object({
        isValid: z.literal(false),
        reason: z.string(),
        file: z.instanceof(File),
        fileName: z.string(),
      }),
    ]),
  ),
});
export const submitSourcesAction = actionClient
  .metadata({ name: "submitSourcesAction" })
  .schema(inputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const newNotebookResponse = await ctx.db
      .insert(notebooks)
      .values({
        userId: parsedInput.sessionId,
      })
      .returning({ newNotebookId: notebooks.id });

    const newSources = await Promise.allSettled(
      parsedInput.sources.map((validationResult) => {
        if (validationResult.isValid) {
          return ctx.db
            .insert(sources)
            .values({
              notebookId: newNotebookResponse[0].newNotebookId,
              name: validationResult.fileName,
              processingStatus: "queued",
              passedValidation: true,
            })
            .returning()
            .execute();
        } else {
          return ctx.db
            .insert(sources)
            .values({
              notebookId: newNotebookResponse[0].newNotebookId,
              name: validationResult.fileName,
              passedValidation: false,
              validationFailureReason: validationResult.reason,
            })
            .returning()
            .execute();
        }
      }),
    );

    return newSources;

    // const jobs: {
    //   jobId: string;
    //   status: (typeof parsingStatus.enumValues)[number];
    //   fileName: string;
    //   sourceId: string;
    // }[] = [];
    //
    // for (const file of parsedInput.files) {
    //   const { id: jobId, status } = await submitParseJob(file);
    //
    //   jobs.push({
    //     jobId,
    //     status,
    //     fileName: file.name,
    //     sourceId: randomUUID(),
    //   });
    // }
    //
    // let notebookId: string;
    //
    // if (!parsedInput.sidebar) {
    //   const insertedNotebooks = await ctx.db
    //     .insert(notebooks)
    //     .values({ name: "Untitled Notebook", userId: parsedInput.sessionId })
    //     .returning({ notebookId: notebooks.id });
    //
    //   notebookId = insertedNotebooks[0].notebookId;
    // } else {
    //   notebookId = parsedInput.notebookId;
    // }
    //
    // await ctx.db.insert(sources).values(
    //   jobs.map((j) => ({
    //     name: j.fileName,
    //     notebookId,
    //     id: j.sourceId,
    //     processingStatus: "queued" as const,
    //   })),
    // );
    //
    // await ctx.db.insert(parsingJobs).values(
    //   jobs.map((j) => ({
    //     sourceId: j.sourceId,
    //     status: j.status,
    //     jobId: j.jobId,
    //   })),
    // );
    //
    // if (!parsedInput.sidebar)
    //   redirect(`/notebook/${notebookId}?sessionId=${parsedInput.sessionId}`);
    // else revalidatePath(`/notebook/${notebookId}`);
  });
