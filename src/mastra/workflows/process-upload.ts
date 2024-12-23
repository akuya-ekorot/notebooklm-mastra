import { Step, Workflow } from "@mastra/core";
import { z } from "zod";
import { parseAndChunkFile, saveSource } from "../tools";
import { generateSourceSummaryPrompt } from "../prompts/generate-source-summary";

const inputSchema = z.object({
  source: z.object({
    name: z.string(),
    content: z.string(),
  }),
});

const outputSchema = z.object({
  summary: z.string(),
  keyTopics: z.array(z.string()),
});

const generateSourceSummary = new Step({
  id: "generateSourceSummary",
  description:
    "Generate summary from a source. The summary includes an overview of what the source is about and a list of key topics from the source.",
  inputSchema,
  outputSchema,
  execute: async ({ context: c, mastra }) => {
    const knowledgeManager = mastra?.agents?.["knowledgeManager"];

    if (!knowledgeManager)
      throw new Error("knowledgeManager agent not available");

    const response = await knowledgeManager.generate(
      [
        { role: "system", content: generateSourceSummaryPrompt },
        { role: "user", content: c.source.content },
      ],
      { schema: outputSchema },
    );

    //NOTE: Object isn't inferred by typescript even though the schema is present
    return response.object as z.infer<typeof outputSchema>;
  },
});

export const processUpload = new Workflow({
  name: "processUpload",
  triggerSchema: z.object({
    buffer: z.instanceof(ArrayBuffer),
    fileName: z.string(),
    notebookId: z.string(),
  }),
})
  .step(parseAndChunkFile, {
    variables: {
      buffer: { step: "trigger", path: "buffer" },
      fileName: { step: "trigger", path: "fileName" },
      notebookId: { step: "trigger", path: "notebookId" },
    },
  })
  .after(parseAndChunkFile)
  .step(saveSource, {
    variables: {
      notebookId: { step: parseAndChunkFile, path: "notebookId" },
      source: { step: parseAndChunkFile, path: "source" },
    },
  })
  .step(generateSourceSummary, {
    variables: {
      source: { step: parseAndChunkFile, path: "source" },
    },
  })
  .commit();