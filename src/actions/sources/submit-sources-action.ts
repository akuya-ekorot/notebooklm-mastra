"use server";

import { z } from "zod";
import { actionClient } from "../safe-action";
import { submitParseJob } from "@/lib/submit-parse-job";
import { parsingJobs, parsingStatus, sources } from "@/db/schema/sources";
import { notebooks } from "@/db/schema/notebooks";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const schema = z
  .object({
    files: z.array(z.instanceof(File)),
    sidebar: z.literal(true),
    notebookId: z.string().uuid(),
  })
  .or(
    z.object({
      files: z.array(z.instanceof(File)),
      sidebar: z.literal(false),
      sessionId: z.string().uuid(),
    }),
  );

export const submitSourcesForParsing = actionClient
  .metadata({ name: "parseAndChunkFileAction" })
  .schema(schema)
  .action(async ({ ctx, parsedInput }) => {
    const jobs: {
      jobId: string;
      status: (typeof parsingStatus.enumValues)[number];
      fileName: string;
      sourceId: string;
    }[] = [];

    for (const file of parsedInput.files) {
      const { id: jobId, status } = await submitParseJob(file);

      jobs.push({
        jobId,
        status,
        fileName: file.name,
        sourceId: randomUUID(),
      });
    }

    let notebookId: string;

    if (!parsedInput.sidebar) {
      const insertedNotebooks = await ctx.db
        .insert(notebooks)
        .values({ name: "Untitled Notebook", userId: parsedInput.sessionId })
        .returning({ notebookId: notebooks.id });

      notebookId = insertedNotebooks[0].notebookId;
    } else {
      notebookId = parsedInput.notebookId;
    }

    await ctx.db.insert(sources).values(
      jobs.map((j) => ({
        name: j.fileName,
        notebookId,
        id: j.sourceId,
        processingStatus: "queued" as const,
      })),
    );

    await ctx.db.insert(parsingJobs).values(
      jobs.map((j) => ({
        sourceId: j.sourceId,
        status: j.status,
        jobId: j.jobId,
      })),
    );

    if (!parsedInput.sidebar)
      redirect(`/notebook/${notebookId}?sessionId=${parsedInput.sessionId}`);
    else revalidatePath(`/notebook/${notebookId}`);
  });
