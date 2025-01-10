import { Step, Workflow } from "@mastra/core";
import { z } from "zod";
import { generateSourceSummaryPrompt } from "../prompts/generate-source-summary";
import { db } from "@/db";
import {
  sourceChunks,
  sources,
  sourceSummaries,
  sourceTopics,
} from "@/db/schema/sources";
import { eq } from "drizzle-orm";
import { embed, MDocument } from "@mastra/rag";
import { EmbedManyResult } from "ai";

export const summarizeSource = new Workflow({
  name: "summarizeSource",
  triggerSchema: z.object({
    markdown: z.string(),
    sourceId: z.string(),
  }),
})
  .step(
    new Step({
      id: "generateSourceSummary",
      description: "Generate a summary of the source",
      inputSchema: z.object({
        markdown: z.string(),
        sourceId: z.string(),
      }),
      execute: async ({ context: c, mastra: m }) => {
        const logger = m?.logger;
        const agent = m?.agents?.["orchestrator"];

        if (!agent) throw new Error("agent not availbale");
        if (!logger) throw new Error("logger not available");

        const response = await agent.generate(
          [
            { role: "system", content: generateSourceSummaryPrompt },
            { role: "user", content: c.markdown },
          ],
          {
            schema: z.object({
              summary: z.string(),
              keyTopics: z.array(z.string()),
            }),
          },
        );

        const { summary, keyTopics } = response.object as {
          summary: string;
          keyTopics: string[];
        };

        const summaryDocs = await MDocument.fromText(summary).chunk({
          strategy: "markdown",
          size: 512,
          overlap: 50,
        });

        const summaryEmbeddings = (await embed(summaryDocs, {
          provider: "OPEN_AI",
          model: "text-embedding-ada-002",
          maxRetries: 5,
        })) as EmbedManyResult<string>;

        const summaryInserts = summaryEmbeddings.values.reduce(
          (pv, cv, idx) => {
            return [
              ...pv,
              {
                summary: cv,
                embedding: summaryEmbeddings.embeddings[idx],
                sourceId: c.sourceId,
              },
            ];
          },
          [] as { summary: string; embedding: number[]; sourceId: string }[],
        );

        const contentDocs = await MDocument.fromText(c.markdown).chunk({
          strategy: "markdown",
          size: 512,
          overlap: 50,
        });

        const contentEmbeddings = (await embed(contentDocs, {
          provider: "OPEN_AI",
          model: "text-embedding-ada-002",
          maxRetries: 5,
        })) as EmbedManyResult<string>;

        const chunkInserts = contentEmbeddings.values.reduce(
          (pv, cv, idx) => {
            return [
              ...pv,
              {
                content: cv,
                embedding: contentEmbeddings.embeddings[idx],
                sourceId: c.sourceId,
                createdAt: new Date(),
              },
            ];
          },
          [] as {
            content: string;
            sourceId: string;
            embedding: number[];
            createdAt: Date;
          }[],
        );

        const topicInserts = keyTopics.map((topic) => ({
          topic,
          sourceId: c.sourceId,
        }));

        db.insert(sourceTopics).values(topicInserts).execute();
        db.insert(sourceSummaries).values(summaryInserts).execute();
        db.insert(sourceChunks).values(chunkInserts).execute();

        await db
          .update(sources)
          .set({ processingStatus: "summarized" })
          .where(eq(sources.id, c.sourceId));

        return {
          summary,
          keyTopics,
          sourceId: c.sourceId,
        };
      },
    }),
    {
      variables: {
        markdown: { step: "trigger", path: "markdown" },
        sourceId: { step: "trigger", path: "sourceId" },
      },
    },
  )
  .commit();
