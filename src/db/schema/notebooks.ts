import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers";
import { sources } from "./sources";
import { relations } from "drizzle-orm";

export const podcastStatus = pgEnum("podcast_status", [
  "not_started",
  "querying_sources",
  "generating_script",
  "polling_audio",
  "ready",
]);

export const notebookStatus = pgEnum("notebook_status", [
  "awaiting_source_summaries",
  "summarizing",
  "ready",
]);

export const notebooks = pgTable("notebooks", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().default("Untitled Notebook").notNull(),
  userId: text("user_id"),
  title: text(),
  summary: text(),
  emoji: text(),
  podcastStatus: podcastStatus("podcast_status").default("not_started"),
  notebookStatus: notebookStatus("notebook_status").default(
    "awaiting_source_summaries",
  ),
  ...timestamps,
});

export const notebooksRelations = relations(notebooks, (h) => ({
  sources: h.many(sources),
  notebookPodcast: h.many(notebookPodcast),
}));

export const notebookPodcast = pgTable("notebook_podcast", {
  id: uuid("id").primaryKey().defaultRandom(),
  audioUrl: text("audio_url"),
  podcastScript: text("podcast_script"),
  notebookId: uuid("notebook_id").references(() => notebooks.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

export const notebookPodcastRelations = relations(notebookPodcast, (h) => ({
  notebook: h.one(notebooks, {
    fields: [notebookPodcast.notebookId],
    references: [notebooks.id],
  }),
}));
