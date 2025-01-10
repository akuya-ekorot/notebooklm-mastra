"use client";

import { NotebookSummary } from "@/db/queries/notebooks";
import { useAction } from "next-safe-action/hooks";
import { generateNotebookSummaries } from "@/actions/generate-notebook-summaries";
import { useEffect } from "react";

interface NotebookSummaryProps {
  notebookSummary: NotebookSummary;
  sourcesSummarized: boolean;
}

export const NotebookSummarySection: React.FC<NotebookSummaryProps> = ({
  notebookSummary,
  sourcesSummarized,
}) => {
  const { execute } = useAction(generateNotebookSummaries);

  useEffect(() => {
    if (sourcesSummarized && !notebookSummary?.summary && notebookSummary?.id) {
      execute({ notebookId: notebookSummary?.id });
    }
  }, [
    execute,
    notebookSummary?.id,
    notebookSummary?.summary,
    sourcesSummarized,
  ]);

  if (sourcesSummarized && !!notebookSummary?.summary) {
    return (
      <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
        <div className="text-4xl">{notebookSummary?.emoji}</div>
        <h1 className="text-3xl font-semibold">{notebookSummary?.title}</h1>
        <p className="text-sm">{notebookSummary?.summary}</p>
      </div>
    );
  }

  return null;
};
