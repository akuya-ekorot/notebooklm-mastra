"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpenCheck,
  FileText,
  BookText,
  Files,
  CircleCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SourceStatus = "queued" | "parsed" | "summarized";
export type NotebookStatus =
  | "ready"
  | "awaiting_source_summaries"
  | "summarizing"
  | null
  | undefined;

interface StatusCardProps {
  sourcesStatus: SourceStatus[];
  notebookStatus: NotebookStatus;
}

const STEPS = [
  {
    id: "sourcesParsing",
    title: "Parse Sources",
    icon: FileText,
    completionCheck: (sourcesStatus: SourceStatus[]) =>
      sourcesStatus.every((status) => status !== "queued"),
  },
  {
    id: "sourcesSummarizing",
    title: "Summarize Sources",
    icon: Files,
    completionCheck: (sourcesStatus: SourceStatus[]) =>
      sourcesStatus.every((status) => status === "summarized"),
  },
  {
    id: "notebookSummarizing",
    title: "Generate Summary",
    icon: BookText,
    completionCheck: (
      sourcesStatus: SourceStatus[],
      notebookStatus: NotebookStatus,
    ) =>
      sourcesStatus.every((status) => status === "summarized") &&
      notebookStatus === "ready",
  },
  {
    id: "notebookReady",
    title: "Notebook Ready",
    icon: BookOpenCheck,
    completionCheck: (
      sourcesStatus: SourceStatus[],
      notebookStatus: NotebookStatus,
    ) =>
      sourcesStatus.every((status) => status === "summarized") &&
      notebookStatus === "ready",
  },
];

export const StatusCard: React.FC<StatusCardProps> = ({
  sourcesStatus,
  notebookStatus,
}) => {
  const [completedSteps, setCompletedSteps] = useState(new Set<string>());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const newCompletedSteps = new Set<string>();
    let foundCurrentStep = false;

    // Handle cases where notebookStatus is null/undefined
    const effectiveNotebookStatus =
      notebookStatus || "awaiting_source_summaries";

    STEPS.forEach((step, index) => {
      if (step.completionCheck(sourcesStatus, effectiveNotebookStatus)) {
        newCompletedSteps.add(step.id);
      } else if (!foundCurrentStep) {
        setCurrentStepIndex(index);
        foundCurrentStep = true;
      }
    });

    setCompletedSteps(newCompletedSteps);
  }, [sourcesStatus, notebookStatus]);

  const getStepProgress = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Parsing
        return {
          current: sourcesStatus.filter(
            (s) => s === "parsed" || s === "summarized",
          ).length,
          total: sourcesStatus.length,
        };
      case 1: // Summarizing
        return {
          current: sourcesStatus.filter((s) => s === "summarized").length,
          total: sourcesStatus.length,
        };
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Notebook Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start">
          {STEPS.map((step, index) => {
            const isComplete = completedSteps.has(step.id);
            const isCurrent = currentStepIndex === index;
            const progress = getStepProgress(index);

            return (
              <div key={step.id} className="flex flex-col gap-2 relative grow">
                <div className="flex items-center justify-center">
                  <div
                    className={cn(
                      "h-0.5 grow",
                      index > 0 && isComplete
                        ? "bg-green-200"
                        : index > 0
                          ? "bg-gray-200"
                          : "",
                      "transition-colors duration-200",
                    )}
                  />
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isComplete
                        ? "bg-green-100"
                        : isCurrent
                          ? "bg-blue-100"
                          : "bg-gray-100",
                      "transition-colors duration-200",
                    )}
                  >
                    {isComplete ? (
                      <CircleCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <step.icon
                        className={cn(
                          "w-5 h-5",
                          isCurrent
                            ? "text-blue-600 animate-pulse"
                            : "text-gray-400",
                        )}
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      "h-0.5 grow",
                      index < STEPS.length - 1 && isComplete
                        ? "bg-green-200"
                        : index < STEPS.length - 1
                          ? "bg-gray-200"
                          : "",
                      "transition-colors duration-200",
                    )}
                  />
                </div>
                <div className="text-center">
                  <h3
                    className={cn(
                      "font-medium text-[10px]",
                      isComplete
                        ? "text-green-600"
                        : isCurrent
                          ? "text-blue-600"
                          : "text-gray-600",
                    )}
                  >
                    {step.title}
                  </h3>
                  {isCurrent && progress && (
                    <p className="text-[10px] text-gray-500">
                      {progress.current}/{progress.total} complete
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
