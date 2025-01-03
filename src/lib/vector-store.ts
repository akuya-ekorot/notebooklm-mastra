import { PgVector } from "@mastra/rag";

export const createVectorStore = (indexName: string) => {
  const vectorStore = new PgVector(process.env.DB_URL!);

  vectorStore.createIndex(indexName, 1536, "cosine");

  return vectorStore;
};
