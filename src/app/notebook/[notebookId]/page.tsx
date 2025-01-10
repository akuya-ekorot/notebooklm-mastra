import { NotebookSummarySection } from "@/components/custom/notebook-summary";
import { StatusCard } from "@/components/custom/example-card";
import { StudioPanel } from "@/components/custom/studio-panel";
import { fetchNotebookWithSources } from "@/db/queries/notebooks";

interface NotebookPageProps {
  params: Promise<{ notebookId: string }>;
}

export default async function NotebookPage({ params }: NotebookPageProps) {
  const notebookId = (await params).notebookId;
  const notebookWithSources = await fetchNotebookWithSources(notebookId);

  const sourcesStatus = notebookWithSources?.sources.map(
    (s) => s.processingStatus,
  );

  const allSourcesSummarized =
    sourcesStatus?.every((s) => s === "summarized") ?? false;

  return (
    <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-3rem)] gap-8">
      <>
        <NotebookSummarySection
          notebookSummary={notebookWithSources}
          sourcesSummarized={allSourcesSummarized}
        />

        {notebookWithSources?.notebookStatus !== "ready" && (
          <StatusCard
            sourcesStatus={sourcesStatus ?? []}
            notebookStatus={notebookWithSources?.notebookStatus}
          />
        )}

        <StudioPanel
          notebookId={notebookId}
          audioUrl={
            notebookWithSources?.notebookPodcast.find((p) => !!p.audioUrl)
              ?.audioUrl ?? undefined
          }
          notebookStatus={notebookWithSources?.notebookStatus}
        />
      </>
    </div>
  );
}
