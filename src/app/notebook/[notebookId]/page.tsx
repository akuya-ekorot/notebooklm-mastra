import { CustomSidebar } from "@/components/custom/custom-sidebar";
import { Navbar } from "@/components/custom/navbar";
import { Suspense } from "react";
import {
  NotebookSummary,
  NotebookSummarySkeleton,
} from "@/components/custom/notebook-summary/index";
import {
  StudioPanel,
  StudioPanelSkeleton,
} from "@/components/custom/studio-panel";

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

  if (!sessionId) return null;

  return (
    <>
      <CustomSidebar notebookId={notebookId} sessionId={sessionId} />
      <div className="w-full">
        <Navbar sessionId={sessionId} notebookId={notebookId} />
        <main>
          <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-3rem)] gap-8">
            <>
              <Suspense fallback={<NotebookSummarySkeleton />}>
                <NotebookSummary notebookId={notebookId} />
              </Suspense>

              <Suspense fallback={<StudioPanelSkeleton />}>
                <StudioPanel notebookId={notebookId} />
              </Suspense>
            </>
          </div>
        </main>
      </div>
    </>
  );
}
