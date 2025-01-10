"use client";

import { submitSourcesForParsing } from "@/actions/sources/submit-sources-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSidebar } from "@/components/ui/sidebar";
import { Loader, Plus } from "lucide-react";
import { type HookActionStatus, useAction } from "next-safe-action/hooks";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";
import { toast } from "sonner";
import { FileUploader } from "../file-uploader";

type UploadSourcesProps =
  | {
      variant: "welcome" | "default";
    }
  | { variant: "sidebar"; notebookId: string };

export const UploadSources: React.FC<UploadSourcesProps> = (props) => {
  const [open, setOpen] = useState(false);

  const { execute, status } = useAction(submitSourcesForParsing, {
    onError: () => toast.error("Upload failed"),
  });

  const handleUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) throw new Error("Upload at least one file");

      if (props.variant === "sidebar") {
        execute({ files, sidebar: true, notebookId: props.notebookId });
      } else {
        execute({ files, sidebar: false });
      }

      setOpen(false);
    },
    [execute, props],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.variant === "sidebar" ? (
          <UploadSourcesSidebarTrigger onOpenChange={setOpen} />
        ) : (
          <UploadSourcesHomeTrigger
            status={status}
            variant={props.variant}
            onOpenChange={setOpen}
          />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add sources</DialogTitle>
          <DialogDescription>Upload a source to the notebook</DialogDescription>
        </DialogHeader>
        <form>
          <FileUploader onUpload={handleUpload} />
        </form>
      </DialogContent>
    </Dialog>
  );
};

const UploadSourcesHomeTrigger: React.FC<{
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  status: HookActionStatus;
  variant: "default" | "welcome";
}> = (props) => {
  return (
    <Button
      size="lg"
      className="px-8 rounded-full w-36"
      onClick={() => props.onOpenChange((prev) => !prev)}
    >
      {props.status === "executing" ? (
        <Loader className="animate-spin" />
      ) : (
        <>
          {props.variant === "default" && <Plus />}
          <span>
            {props.variant === "welcome" ? "Get started" : "Create new"}
          </span>
        </>
      )}
    </Button>
  );
};

const UploadSourcesSidebarTrigger: React.FC<{
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}> = ({ onOpenChange }) => {
  const { open } = useSidebar();

  return (
    <Button
      variant={open ? "outline" : "ghost"}
      onClick={() => onOpenChange((prev) => !prev)}
    >
      <Plus />
      <span className={open ? "" : "sr-only"}>Add source</span>
    </Button>
  );
};
