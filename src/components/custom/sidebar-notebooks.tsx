import { fetchNotebookSources } from "@/db/queries/sources";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "../ui/sidebar";
import { OptimisticNotebooks } from "./optimistic-notebooks";

interface SidebarNotebooksProps {
  notebookId: string;
}
export const SidebarNotebooks: React.FC<SidebarNotebooksProps> = async ({
  notebookId,
}) => {
  const notebookSources = await fetchNotebookSources(notebookId);

  return (
    <SidebarMenu>
      <OptimisticNotebooks notebookSources={notebookSources} />
    </SidebarMenu>
  );
};

export const SidebarNotebooksSkeleton: React.FC = async () => {
  return (
    <SidebarMenu>
      {Array.from({ length: 5 }).map((_, idx) => (
        <SidebarMenuItem key={idx}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
