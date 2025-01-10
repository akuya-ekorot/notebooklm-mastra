"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { notebookPodcast } from "@/db/schema/notebooks";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const savePodcastAction = actionClient
  .metadata({ name: "savePodcastAction" })
  .schema(
    z.object({
      audioUrl: z.string().url(),
      notebookId: z.string().uuid(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const res = await ctx.db
      .update(notebookPodcast)
      .set({ audioUrl: parsedInput.audioUrl })
      .where(eq(notebookPodcast.notebookId, parsedInput.notebookId))
      .returning();

    revalidatePath(`/notebook/${parsedInput.notebookId}`);

    return res;
  });
