"use client";

import { type SourceProcessingStatus } from "@/db/schema/sources";
import { useProcessSource } from "@/hooks/source-processing-hooks";

interface SourceProcessingProps {
  jobId: string;
  notebookId: string;
  processingStatus: SourceProcessingStatus;
  sourceId: string;
  sourceName: string;
}

export const SourceProcessing: React.FC<SourceProcessingProps> = (props) => {
  useProcessSource(props);
  return null;
};
