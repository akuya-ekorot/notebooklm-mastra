"use client";

import { generatePodcastAction } from "@/actions/generate-podcast-action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { CheckCircle2, Headphones, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TextStreamPart } from "ai";
import { pollPodcastAudio } from "@/actions/poll-podcast-audio";
import { submitAudioGenerationAction } from "@/actions/submit-audio-generation-action";
import { cn } from "@/lib/utils";
import { savePodcastAction } from "@/actions/save-podcast-action";
import { STEPS, useSteps } from "@/hooks/use-steps";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { NotebookStatus } from "./example-card";

interface StudioPanelProps {
  notebookId: string;
  audioUrl?: string;
  notebookStatus: NotebookStatus;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({
  notebookId,
  audioUrl,
  notebookStatus,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [res, setRes] = useState<TextStreamPart<any>[]>([]);
  const [pollUrl, setPollUrl] = useState<string>();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState(new Set<string>());

  const { execute: savePodcastUrl } = useAction(savePodcastAction);

  useSteps({
    audioUrl,
    completedSteps,
    currentStepIndex,
    pollUrl,
    res,
    setCompletedSteps,
    setCurrentStepIndex,
  });

  const { execute: executePolling, status: pollingStatus } = useAction(
    pollPodcastAudio,
    {
      onError: () => toast.error("Error polling podcast"),
      onSuccess: ({ data }) => {
        if (data?.audioUrl) {
          savePodcastUrl({ notebookId, audioUrl: data.audioUrl });
        }
      },
    },
  );

  const { execute: submitForAudioProduction } = useAction(
    submitAudioGenerationAction,
    {
      onSuccess: ({ data }) => {
        if (data?.pollUrl) {
          setPollUrl(data.pollUrl);
        }
      },
    },
  );

  const { execute, status } = useAction(generatePodcastAction, {
    onError: () => {
      toast.error("Error generating podcast");
    },
    onSuccess: async ({ data }) => {
      if (data) {
        for await (const event of data.output) {
          setRes((prev) => [...prev, event]);

          if (
            event.type === "tool-result" &&
            event.toolName === "savePodcastDetails" &&
            !!event.result[0].podcastScript
          ) {
            submitForAudioProduction({ script: event.result[0].podcastScript });
          }
        }
      }
    },
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (pollUrl && !audioUrl) {
      intervalId = setInterval(() => {
        executePolling({ pollUrl, notebookId });
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollUrl, audioUrl, executePolling, notebookId]);

  const handleGenerate = () =>
    execute({
      triggerData: { notebookId },
      pathToRevalidate: `/notebook/${notebookId}`,
    });

  const isProcessing =
    status === "executing" ||
    pollingStatus === "executing" ||
    !(status === "idle" && !audioUrl);

  return (
    <div className="space-y-6 w-full max-w-3xl">
      {notebookStatus === "ready" && (
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Studio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!audioUrl ? (
              <>
                <div className="flex items-start">
                  {STEPS.map((step, index) => {
                    const isComplete = completedSteps.has(step.id);
                    const isCurrent = currentStepIndex === index;

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col gap-2 relative grow"
                      >
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
            ) : (
              <audio controls={!!audioUrl} className="w-full" src={audioUrl}>
                Your browser does not support the audio element.
              </audio>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
