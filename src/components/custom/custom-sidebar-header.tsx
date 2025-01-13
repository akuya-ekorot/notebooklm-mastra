import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { SidebarHeader, SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";

export const CustomSidebarHeader = ({ sessionId }: { sessionId: string }) => {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-4 list-none">
          <Button variant="link" className="w-full justify-start">
            <Link
              href={`/?sessionId=${sessionId}`}
              className="flex items-center truncate gap-3"
            >
              <ArrowLeft />
              <span className="truncate">Go home</span>
            </Link>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};
