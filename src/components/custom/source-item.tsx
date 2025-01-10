"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { File, Loader } from "lucide-react";
import { Badge } from "../ui/badge";
import { fetchNotebookSources } from "@/db/queries/sources";
import { cn } from "@/lib/utils";
import { useProcessSource } from "@/hooks/source-processing-hooks";

type SourceItemProps = Awaited<
  ReturnType<typeof fetchNotebookSources>
>[number] & { notebookId: string };

export const SourceItem: React.FC<SourceItemProps> = ({
  id,
  name,
  sourceSummaries,
  sourceTopics,
  parsingJobs,
  processingStatus,
  notebookId,
}) => {
  useProcessSource({
    jobId: parsingJobs?.[0]?.jobId,
    notebookId,
    processingStatus,
    sourceId: id,
    sourceName: name,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={!(processingStatus === "summarized")}
          variant="secondary"
          className={cn("w-full justify-start")}
        >
          <File />
          <span className="truncate">{name}</span>
          {!(processingStatus === "summarized") && (
            <Loader className="animate-spin" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="leading-normal tracking-normal">
            {name}
          </DialogTitle>
          <DialogDescription>
            {sourceSummaries.map((s) => s.summary).join("")}
          </DialogDescription>
        </DialogHeader>

        <hr />

        <div className="flex gap-2 flex-wrap">
          {sourceTopics?.map((topic) => (
            <Badge variant="default" key={topic.id}>
              {topic.topic}
            </Badge>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
