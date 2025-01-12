import { NotebookNameSkeleton } from "./notebook-name/notebook-name";
import { NotebookNameWrapper } from "./notebook-name/notebook-name-wrapper";

import { SidebarTrigger } from "../ui/sidebar";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  sessionId: string;
  notebookId: string;
}

export const Navbar: React.FC<NavbarProps> = async ({
  sessionId,
  notebookId,
}) => {
  return (
    <nav
      className={cn(
        "border-b h-12 flex items-center gap-4 transition-all sticky top-0 w-full",
      )}
    >
      <SidebarTrigger />
      <Suspense fallback={<NotebookNameSkeleton />}>
        <NotebookNameWrapper sessionId={sessionId} notebookId={notebookId} />
      </Suspense>
    </nav>
  );
};
