import { Dialog, DialogTrigger } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { File, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import {
  SourceItemContent,
  SourceProcessingWrapper,
} from "./source-item-content";

type SourceItemProps = Awaited<
  ReturnType<typeof db.query.sources.findMany>
>[number] & { notebookId: string };

export const SourceItem: React.FC<SourceItemProps> = ({
  id,
  name,
  processingStatus,
}) => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            disabled={!(processingStatus === "summarized")}
            variant="secondary"
            className={cn("w-full justify-start")}
          >
            {!(processingStatus === "summarized") ? (
              <Loader className="animate-spin" />
            ) : (
              <File />
            )}

            <span className="truncate">{name}</span>
          </Button>
        </DialogTrigger>
        <SourceItemContent sourceId={id} name={name} />
      </Dialog>
      <SourceProcessingWrapper sourceId={id} />
    </>
  );
};
