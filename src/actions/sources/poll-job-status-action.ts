"use server";

import { z } from "zod";
import { actionClient } from "../safe-action";
import { pollJobStatus } from "@/lib/submit-parse-job";
import { parsingJobs, sources } from "@/db/schema/sources";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const pollJobStatusAction = actionClient
  .metadata({ name: "pollJobStatusAction" })
  .schema(
    z.object({
      jobId: z.string(),
      notebookId: z.string().uuid(),
      sourceId: z.string().uuid(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const response = await pollJobStatus(parsedInput.jobId);

    if (response.status === "SUCCESS") {
      ctx.db
        .update(parsingJobs)
        .set({ jobId: response.id, status: response.status })
        .where(eq(parsingJobs.jobId, response.id))
        .execute();

      await ctx.db
        .update(sources)
        .set({ processingStatus: "parsed" })
        .where(eq(sources.id, parsedInput.sourceId));

      revalidatePath(`/notebook/${parsedInput.notebookId}`, "layout");

      return response;
    }
  });
