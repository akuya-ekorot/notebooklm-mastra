"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { db } from "@/db";
import { notebooks } from "@/db/schema/notebooks";
import { revalidatePath } from "next/cache";
import { sources } from "@/db/schema/sources";

export const generateNotebookSummaries = actionClient
  .metadata({
    name: "generateNotebookSummaries",
  })
  .schema(
    z.object({
      notebookId: z.string(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const agent = ctx.mastra.getAgent("orchestrator");

    const summaries = await db.query.sources.findMany({
      where: ({ notebookId }, { eq }) => eq(notebookId, parsedInput.notebookId),
      columns: {},
      with: {
        sourceSummaries: {
          columns: {
            summary: true,
          },
        },
      },
    });

    const schema = z.object({
      emoji: z
        .string()
        .describe(
          "A single emoji that captures the general idea of the content in this notebook",
        ),
      title: z
        .string()
        .describe(
          "A title that would be fitting for this notebook based on the contents and summaries",
        ),
      summary: z
        .string()
        .describe("A 2-paragraph summary of the sources from this notebook"),
    });

    const res = await agent.generate(
      [
        {
          role: "system",
          content:
            "Explore the source summaries the user provides and generate a general summary of the notebook",
        },
        {
          role: "user",
          content: `Here are all the summaries for this notebook.\n\n ${summaries.map((s) => s.sourceSummaries.map((ss) => ss.summary))}`,
        },
      ],
      {
        schema,
      },
    );

    const parsedResult = schema.parse(res.object);

    await db.update(notebooks).set(parsedResult);
    db.update(sources).set({ processingStatus: "ready" }).execute();

    revalidatePath(`/notebook/${parsedInput.notebookId}`);
  });
