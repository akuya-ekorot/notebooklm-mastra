import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { notebooks } from "./notebooks";
import { timestamps } from "./helpers";
import { relations } from "drizzle-orm";

export const parsingStatus = pgEnum("parsing_status", [
  "PENDING",
  "SUCCESS",
  "ERROR",
  "PARTIAL_SUCCESS",
]);

export const processingStatus = pgEnum("processing_status", [
  "queued",
  "parsed",
  "summarized",
]);

export type SourceProcessingStatus =
  (typeof processingStatus.enumValues)[number];

export const sources = pgTable("sources", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  notebookId: uuid("notebook_id")
    .references(() => notebooks.id, {
      onDelete: "cascade",
    })
    .notNull(),
  processingStatus: processingStatus("processing_status"), // will only have a processing_status if passed_validation
  passedValidation: boolean("passed_validation").notNull().default(false),
  validationFailureReason: text("validation_failure_reason"),
  ...timestamps,
});

export const sourcesRelations = relations(sources, (h) => ({
  notebook: h.one(notebooks, {
    fields: [sources.notebookId],
    references: [notebooks.id],
  }),
  parsingJobs: h.many(parsingJobs),
  sourceSummaries: h.many(sourceSummaries),
  sourceTopics: h.many(sourceTopics),
  sourceChunks: h.many(sourceChunks),
}));

export const parsingJobs = pgTable("parsing_jobs", {
  id: uuid().primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull(),
  sourceId: uuid("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  status: parsingStatus("status").notNull(),
});

export const parsingJobsRelations = relations(parsingJobs, (h) => ({
  source: h.one(sources, {
    fields: [parsingJobs.sourceId],
    references: [sources.id],
  }),
}));

export const sourceSummaries = pgTable(
  "source_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    summary: text("summary"),
    embedding: vector("summary_embedding", { dimensions: 1536 }),
    sourceId: uuid("source_id").references(() => sources.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [
    index("summary_embedding_index").using(
      "ivfflat",
      t.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export const sourceSummariesRelations = relations(sourceSummaries, (h) => ({
  source: h.one(sources, {
    fields: [sourceSummaries.sourceId],
    references: [sources.id],
  }),
}));

export const sourceTopics = pgTable("source_topics", {
  id: uuid().primaryKey().defaultRandom(),
  topic: text("topic"),
  sourceId: uuid("source_id")
    .references(() => sources.id, {
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const sourceTopicsRelations = relations(sourceTopics, (h) => ({
  source: h.one(sources, {
    fields: [sourceTopics.sourceId],
    references: [sources.id],
  }),
}));

export const sourceChunks = pgTable(
  "source_chunks",
  {
    id: uuid().primaryKey().defaultRandom(),
    content: text().notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    sourceId: uuid("source_id")
      .references(() => sources.id, {
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
  (t) => [
    index("chunk_embedding_index").using(
      "ivfflat",
      t.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export const sourceChunksRelations = relations(sourceChunks, (h) => ({
  source: h.one(sources, {
    fields: [sourceChunks.sourceId],
    references: [sources.id],
  }),
}));
