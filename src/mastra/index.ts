import { Mastra, createLogger } from "@mastra/core";
import { PostgresEngine } from "@mastra/engine";
import { summarizeSource } from "./workflows";
import { orchestrator } from "./agents/orchestrator";
import { PgMemory } from "@mastra/memory";
import { inputWorkflow } from "./workflows/input-workflow";

const engine = new PostgresEngine({
  url: process.env.DB_URL!,
});

//NOTE: Seems like the method shown in docs has changed. PgMemory vs PostgresMemory, pool vs connectionString
const memory = new PgMemory({
  connectionString: process.env.DB_URL!,
});

const logger = createLogger({
  type: "CONSOLE",
  level: process.env.NODE_ENV === "development" ? "DEBUG" : "ERROR",
});

export const mastra = new Mastra({
  agents: { orchestrator },
  workflows: { summarizeSource, inputWorkflow },
  memory,
  logger,
  engine,
});
