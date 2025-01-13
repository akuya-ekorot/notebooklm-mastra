"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookCard } from "./notebook-card";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface NotebookContentProps {
  notebooks: Pick<
    Awaited<ReturnType<typeof db.query.notebooks.findMany>>[number],
    "id" | "name" | "title" | "emoji" | "summary"
  >[];
}
export const NotebookContent: React.FC<NotebookContentProps> = ({
  notebooks,
}) => {
  const [expanded, setExpanded] = useState(false);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) return null;

  return (
    <div className="flex flex-col gap-2">
      <ScrollArea
        className={cn(
          "w-full p-4 rounded-lg transition-all",
          expanded ? "h-[432px]" : "h-[232px]",
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notebooks.map((notebook) => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              sessionId={sessionId}
            />
          ))}
        </div>
      </ScrollArea>
      {notebooks.length > 3 && (
        <Button
          variant="ghost"
          className=""
          onClick={() => setExpanded((prev) => !prev)}
        >
          <ChevronDown
            className={`h-4 w-4 transform transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
};
