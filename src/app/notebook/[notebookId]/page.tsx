import { NotebookSummarySection } from "@/components/custom/notebook-summary";
import { StatusCard } from "@/components/custom/example-card";
import { StudioPanel } from "@/components/custom/studio-panel";
import { fetchNotebookWithSources } from "@/db/queries/notebooks";
import { CustomSidebar } from "@/components/custom/custom-sidebar";
import { Navbar } from "@/components/custom/navbar";

interface NotebookPageProps {
  params: Promise<{ notebookId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function NotebookPage({
  params,
  searchParams,
}: NotebookPageProps) {
  const notebookId = (await params).notebookId;
  const sessionId = (await searchParams).sessionId;

  if (!sessionId) throw new Error("User error. Missing sessionId");

  const notebookWithSources = await fetchNotebookWithSources(notebookId);
  const sourcesStatus = notebookWithSources?.sources.map(
    (s) => s.processingStatus,
  );
  const allSourcesSummarized =
    sourcesStatus?.every((s) => s === "summarized") ?? false;

  return (
    <>
      <CustomSidebar notebookId={notebookId} sessionId={sessionId} />
      <div className="w-full">
        <Navbar sessionId={sessionId} notebookId={notebookId} />
        <main>
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
        </main>
      </div>
    </>
  );
}
