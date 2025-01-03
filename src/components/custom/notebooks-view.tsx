"use client";

import { useNewNotebook } from "@/hooks/use-new-notebook";
import { formatDate } from "@/lib/utils";
import { Plus, Loader } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Notebook } from "@/db/queries/notebooks";
import Link from "next/link";

interface NotebooksViewProps {
  notebooks: Notebook[];
}

export const NotebooksView: React.FC<NotebooksViewProps> = ({ notebooks }) => {
  const { execute, status } = useNewNotebook();

  return (
    <div className="bg-background w-full rounded-3xl p-12 space-y-8">
      <div className="space-y-6 border-b pb-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
          Welcome to Mastra&apos;s NotebookLM
        </h1>
        <h2 className="text-2xl">My notebooks</h2>
      </div>
      <div className="space-y-8">
        <Button className="rounded-full min-w-36 " onClick={() => execute({})}>
          {status === "executing" ? (
            <Loader className="animate-spin" />
          ) : (
            <>
              <Plus />
              <span>Create new</span>
            </>
          )}
        </Button>
        <div className="grow flex flex-wrap content-start gap-8 w-full">
          {notebooks.map((notebook) => (
            <Link key={notebook.id} href={`/notebook/${notebook.id}`}>
              <Card className="size-64">
                <CardHeader>
                  <CardTitle className="truncate">{notebook.name}</CardTitle>
                  <CardDescription>
                    {formatDate(new Date(notebook.createdAt))}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
