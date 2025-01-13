import { SidebarMenuItem, SidebarMenuSkeleton } from "../ui/sidebar";
import { cn } from "@/lib/utils";
import { SourceItem } from "./sources/source-item";
import { db } from "@/db";

interface SidebarNotebooksProps {
  notebookId: string;
}
export const SidebarNotebooks: React.FC<SidebarNotebooksProps> = async ({
  notebookId,
}) => {
  const sources = await db.query.sources.findMany({
    where: (t, h) => h.eq(t.notebookId, notebookId),
  });

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs text-muted-foreground mt-2">Sources</span>
      {sources?.map((source) => (
        <SidebarMenuItem
          key={source.id}
          className={cn(
            "list-none",
            !(source.processingStatus === "summarized") && "animate-pulse",
          )}
        >
          <SourceItem {...source} notebookId={notebookId} />
        </SidebarMenuItem>
      ))}
    </div>
  );
};

export const SidebarNotebooksSkeleton: React.FC = async () => {
  return (
    <div>
      <p className="text-xs text-muted-foreground my-2">Sources</p>
      {Array.from({ length: 5 }).map((_, idx) => (
        <SidebarMenuItem key={idx}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </div>
  );
};
