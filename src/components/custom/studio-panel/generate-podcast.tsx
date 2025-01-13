"use client";

import { Button } from "@/components/ui/button";
import { STEPS, useSteps } from "@/hooks/use-steps";
import { cn } from "@/lib/utils";
import { CheckCircle2, Headphones, Loader2 } from "lucide-react";
import { NotebookStatus } from "../status-card";

interface GeneratePodcastProps {
  audioUrl: string | undefined;
  notebookId: string;
  notebookStatus: NotebookStatus;
}

export const GeneratePodcast: React.FC<GeneratePodcastProps> = ({
  audioUrl,
  notebookId,
  notebookStatus,
}) => {
  const {
    completedSteps,
    currentStepIndex,
    isProcessing,
    status,
    handleGenerate,
  } = useSteps({ audioUrl, notebookId });

  return (
    <>
      <div className="flex items-start">
        {STEPS.map((step, index) => {
          const isComplete = completedSteps.has(step.id);
          const isCurrent = currentStepIndex === index;

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
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${
                      isComplete
                        ? "bg-green-100"
                        : isCurrent
                          ? "bg-blue-100"
                          : "bg-gray-100"
                    }
                    transition-colors duration-200`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <step.icon
                      className={`w-5 h-5 
                        ${isCurrent ? "text-blue-600 animate-pulse" : "text-gray-400"}`}
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
                  className={`font-medium text-[10px] ${
                    isComplete
                      ? "text-green-600"
                      : isCurrent
                        ? "text-blue-600"
                        : "text-gray-600"
                  }`}
                >
                  {step.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        onClick={handleGenerate}
        className="w-full"
        disabled={isProcessing || notebookStatus !== "ready"}
      >
        {status === "idle" ? (
          <>
            <Headphones className="mr-2" />
            <span>Generate podcast</span>
          </>
        ) : status === "hasSucceeded" && audioUrl ? (
          <>
            <CheckCircle2 className="mr-2" />
            <span>Podcast Generated</span>
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Failed podcast generation</span>
        )}
      </Button>
    </>
  );
};
