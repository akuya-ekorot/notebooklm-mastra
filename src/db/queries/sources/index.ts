import { db } from "@/db";
import {
  parsingJobs,
  parsingStatus,
  sourceChunks,
  sources,
  sourceTopics,
} from "@/db/schema/sources";
import { eq, sql } from "drizzle-orm";

export type FetchedNotebookSource = Awaited<
  ReturnType<typeof fetchNotebookSources>
>[number];

export const fetchNotebookSources = async (notebookId: string) => {
  const chunks = sql<
    { content: string }[]
  >`array_agg(distinct jsonb_build_object('content', ${sourceChunks.content})) filter (where ${sourceChunks.content} is not null)`.as(
    "chunks",
  );
  const topics = sql<
    string[]
  >`array_agg(distinct ${sourceTopics.topic}) filter (where ${sourceTopics.topic} is not null)`.as(
    "topics",
  );

  const jobs = sql<
    Array<{ status: (typeof parsingStatus.enumValues)[number]; jobId: string }>
  >`array_agg(distinct jsonb_build_object('status', ${parsingJobs.status}, 'jobId', ${parsingJobs.jobId})) filter (where ${parsingJobs.jobId} is not null)`.as(
    "jobs",
  );

  return await db
    .select({
      sourceId: sources.id,
      sourceName: sources.name,
      sourceSummary: sources.summary,
      notebookId: sources.notebookId,
      sourceTopics: topics,
      sourceChunks: chunks,
      parsingJobs: jobs,
    })
    .from(sources)
    .where(eq(sources.notebookId, notebookId))
    .leftJoin(sourceTopics, eq(sources.id, sourceTopics.sourceId))
    .leftJoin(sourceChunks, eq(sourceChunks.sourceId, sources.id))
    .leftJoin(parsingJobs, eq(parsingJobs.sourceId, sources.id))
    .groupBy(sources.id, sources.name, sources.summary, sources.notebookId);
};
