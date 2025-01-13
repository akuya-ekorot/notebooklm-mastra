import {
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { Suspense } from "react";
import { Skeleton } from "../../ui/skeleton";
import { SourceProcessing } from "./source-processing";

interface SourceItemContentProps {
  sourceId: string;
  name: string;
}
export const SourceItemContent: React.FC<SourceItemContentProps> = ({
  sourceId,
  name,
}) => {
  return (
    <DialogContent>
      <DialogHeader className="space-y-4">
        <DialogTitle className="leading-normal tracking-normal">
          {name}
        </DialogTitle>
        <Suspense fallback={<Skeleton className="w-full h-40" />}>
          <SourceSummary sourceId={sourceId} />
        </Suspense>
      </DialogHeader>

      <hr />

      <Suspense fallback={<SourceTopicsSkeleton />}>
        <SourceTopics sourceId={sourceId} />
      </Suspense>
    </DialogContent>
  );
};

const SourceSummary = async ({ sourceId }: { sourceId: string }) => {
  const summary = await db.query.sourceSummaries.findFirst({
    where: (t, h) => h.eq(t.sourceId, sourceId),
  });

  return <DialogDescription>{summary?.summary}</DialogDescription>;
};

const SourceTopics = async ({ sourceId }: { sourceId: string }) => {
  const topics = await db.query.sourceTopics.findMany({
    where: (t, h) => h.eq(t.sourceId, sourceId),
  });

  return (
    <div className="flex gap-2 flex-wrap">
      {topics?.map((topic) => (
        <Badge variant="default" key={topic.id}>
          {topic.topic}
        </Badge>
      ))}
    </div>
  );
};

const SourceTopicsSkeleton = () => {
  return (
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-20" />
      ))}
    </div>
  );
};

export const SourceProcessingWrapper = async ({
  sourceId,
}: {
  sourceId: string;
}) => {
  const res = await db.query.parsingJobs.findFirst({
    where: (t, h) => h.eq(t.sourceId, sourceId),
    with: {
      source: {
        columns: {
          notebookId: true,
          name: true,
          processingStatus: true,
        },
      },
    },
  });

  if (!res) return null;

  const props = {
    jobId: res.jobId,
    notebookId: res.source.notebookId,
    sourceId,
    sourceName: res.source.name,
    processingStatus: res.source.processingStatus,
  };

  return <SourceProcessing {...props} />;
};
