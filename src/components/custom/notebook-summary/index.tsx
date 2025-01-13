import {
  fetchNotebookSummary,
  fetchSourceSummariesStatus,
} from "@/db/queries/notebooks";
import { Skeleton } from "@/components/ui/skeleton";
import { GenerateNotebookSummary } from "./generate-notebook-summary";
import StatusCard from "../status-card";

interface NotebookSummaryProps {
  notebookId: string;
}

export const NotebookSummary: React.FC<NotebookSummaryProps> = async ({
  notebookId,
}) => {
  const notebookSummary = await fetchNotebookSummary(notebookId);
  const sourceSummariesStatus = await fetchSourceSummariesStatus(notebookId);

  if (!notebookSummary) return null;

  if (Object.values(notebookSummary).some((s) => !s)) {
    return (
      <>
        <StatusCard
          sourcesStatus={sourceSummariesStatus.map((s) => s.processingStatus)}
          notebookStatus={notebookSummary?.notebookStatus}
        />
        {sourceSummariesStatus.every(
          (s) => s.processingStatus === "summarized",
        ) && (
          <>
            <GenerateNotebookSummary notebookId={notebookId} />
          </>
        )}
        <NotebookSummarySkeleton />
      </>
    );
  }

  if (notebookSummary) {
    return (
      <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
        <div className="text-4xl">{notebookSummary.emoji}</div>
        <h1 className="text-3xl font-semibold">{notebookSummary.title}</h1>
        <p className="text-sm">{notebookSummary.summary}</p>
      </div>
    );
  }

  return null;
};

export const NotebookSummarySkeleton = () => {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-3">
      <Skeleton className="h-10 w-10" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
};
