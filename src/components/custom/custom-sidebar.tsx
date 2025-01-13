import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar";
import { PropsWithChildren, Suspense } from "react";
import {
  SidebarNotebooks,
  SidebarNotebooksSkeleton,
} from "./sidebar-notebooks";
import { CustomSidebarHeader } from "./custom-sidebar-header";
import { UploadSources } from "./uploads/upload-sources";

interface CustomSidebarProps {
  notebookId: string;
  sessionId: string;
}

export const CustomSidebar: React.FC<PropsWithChildren<CustomSidebarProps>> = ({
  notebookId,
  sessionId,
}) => {
  return (
    <Sidebar collapsible="icon">
      <CustomSidebarHeader sessionId={sessionId} />

      <hr />

      <SidebarContent className="p-2">
        <SidebarMenu className="">
          <SidebarMenuItem>
            <UploadSources variant="sidebar" notebookId={notebookId} />
          </SidebarMenuItem>
        </SidebarMenu>

        <hr />

        <SidebarMenu>
          <Suspense fallback={<SidebarNotebooksSkeleton />}>
            <SidebarNotebooks notebookId={notebookId} />
          </Suspense>
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
