"use client";

import { generateNotebookSummaries } from "@/actions/generate-notebook-summaries";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";

interface GenerateNotebookSummaryProps {
  notebookId: string;
}

export const GenerateNotebookSummary: React.FC<
  GenerateNotebookSummaryProps
> = ({ notebookId }) => {
  const { execute } = useAction(generateNotebookSummaries, {});

  useEffect(() => {
    execute({ notebookId });
  }, [execute, notebookId]);

  return null;
};
