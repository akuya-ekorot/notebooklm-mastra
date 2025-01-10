"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { revalidatePath } from "next/cache";

export const pollPodcastAudio = actionClient
  .metadata({ name: "pollPodcastAudio" })
  .schema(
    z.object({
      pollUrl: z.string().url(),
      notebookId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const headers = {
      "X-USER-ID": process.env.PLAYDIALOG_USER_ID!,
      Authorization: `Bearer ${process.env.PLAYDIALOG_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const statusResponse = await fetch(parsedInput.pollUrl, { headers });

    if (!statusResponse.ok) {
      throw new Error(`Failed to check status: ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();
    const status = statusData.output?.status;

    if (status === "COMPLETED") {
      const audioUrl = statusData.output?.url as string | undefined;

      if (!audioUrl) {
        throw new Error("Completed status but no audio URL provided");
      }

      revalidatePath(`/notebook/${parsedInput.notebookId}`);
      return { status: "completed", audioUrl };
    }

    if (status === "FAILED") {
      throw new Error("Job processing failed");
    }

    return { status: "not completed", audioUrl: null };
  });
