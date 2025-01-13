import { db } from "@/db";
import { notebooks } from "@/db/schema/notebooks";
import { and, eq } from "drizzle-orm";

export type Notebook = Awaited<ReturnType<typeof fetchNotebooks>>[number];

export const fetchNotebooks = async (sessionId: string) => {
  return await db
    .select()
    .from(notebooks)
    .where(eq(notebooks.userId, sessionId));
};

export const fetchNavbarName = async (
  notebookId: string,
  sessionId: string,
) => {
  return await db
    .select({ name: notebooks.name })
    .from(notebooks)
    .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, sessionId)));
};

export type NotebookSummary = Awaited<
  ReturnType<typeof fetchNotebookWithSources>
>;

export const fetchNotebookWithSources = async (notebookId: string) => {
  return await db.query.notebooks.findFirst({
    where: (t, h) => h.eq(t.id, notebookId),
    columns: {
      id: true,
      name: true,
      emoji: true,
      title: true,
      summary: true,
      notebookStatus: true,
      podcastStatus: true,
    },
    with: {
      sources: {
        with: {
          sourceSummaries: true,
          sourceTopics: true,
          sourceChunks: true,
          parsingJobs: true,
        },
      },
      notebookPodcast: {
        columns: {
          audioUrl: true,
        },
      },
    },
  });
};

export const fetchNotebookSummary = async (notebookId: string) => {
  return await db.query.notebooks.findFirst({
    where: (t, h) => h.eq(t.id, notebookId),
    columns: {
      emoji: true,
      summary: true,
      title: true,
      notebookStatus: true,
    },
  });
};

export const fetchSourceSummariesStatus = async (notebookId: string) => {
  return await db.query.sources.findMany({
    where: (t, h) => h.eq(t.notebookId, notebookId),
    columns: {
      processingStatus: true,
    },
  });
};
