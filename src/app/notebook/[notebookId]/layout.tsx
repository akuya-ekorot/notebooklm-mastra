import { SidebarProvider } from "@/components/ui/sidebar";
import { CSSProperties, PropsWithChildren } from "react";

const sidebarWidths = {
  "--sidebar-width": "20rem",
  "--sidebar-width-mobile": "20rem",
  "--sidebar-width-icon": "4rem",
} as CSSProperties;

const NotebookPageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
      {children}
    </SidebarProvider>
  );
};

export default NotebookPageLayout;
