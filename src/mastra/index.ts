import { Mastra, createLogger } from "@mastra/core";
import { PostgresEngine } from "@mastra/engine";
import { knowledgeManager, podcastGenerator } from "./agents";
import { generatePodcast } from "./workflows";

export const mastra = new Mastra({
  agents: { knowledgeManager, podcastGenerator },
  workflows: { generatePodcast },
  engine: new PostgresEngine({
    url: process.env.DB_URL!,
  }),
  logger: createLogger({
    type: "CONSOLE",
    level: process.env.NODE_ENV === "development" ? "DEBUG" : "INFO",
  }),
});
