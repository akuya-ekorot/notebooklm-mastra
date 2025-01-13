import { generatePodcastAction } from "@/actions/generate-podcast-action";
import { pollPodcastAudio } from "@/actions/poll-podcast-audio";
import { submitAudioGenerationAction } from "@/actions/submit-audio-generation-action";
import { TextStreamPart } from "ai";
import {
  FileSearch,
  FileText,
  ListTodo,
  Pencil,
  Save,
  Radio,
  Headphones,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const STEPS = [
  {
    id: "validateSourcesAvailability",
    title: "Validate Sources",
    description: "Checking source availability",
    icon: FileSearch,
  },
  {
    id: "querySourceSummaryAndChunks",
    title: "Query Sources",
    description: "Analyzing source content",
    icon: FileText,
  },
  {
    id: "generatePodcastOutline",
    title: "Generate Outline",
    description: "Creating podcast structure",
    icon: ListTodo,
  },
  {
    id: "generatePodcastScript",
    title: "Generate Script",
    description: "Writing podcast script",
    icon: Pencil,
  },
  {
    id: "savePodcastDetails",
    title: "Save Details",
    description: "Saving podcast information",
    icon: Save,
  },
  {
    id: "audioGeneration",
    title: "Generate Audio",
    description: "Converting to audio",
    icon: Radio,
  },
  {
    id: "complete",
    title: "Ready for Playback",
    description: "Your podcast is ready to play",
    icon: Headphones,
  },
];

export const useSteps = ({
  audioUrl,
  notebookId,
}: {
  audioUrl: string | undefined;
  notebookId: string;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [res, setRes] = useState<TextStreamPart<any>[]>([]);
  const [pollUrl, setPollUrl] = useState<string>();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState(new Set<string>());

  useEffect(() => {
    const processEvents = () => {
      const newCompletedSteps = new Set(completedSteps);
      let latestStepIndex = currentStepIndex;

      res.forEach((event) => {
        if (event.type === "tool-call") {
          const stepIndex = STEPS.findIndex(
            (step) => step.id === event.toolName,
          );
          if (stepIndex > -1) {
            latestStepIndex = stepIndex;
          }
        } else if (event.type === "tool-result") {
          const stepIndex = STEPS.findIndex(
            (step) => step.id === event.toolName,
          );
          if (stepIndex > -1) {
            newCompletedSteps.add(event.toolName);
          }
        }
      });

      if (pollUrl && !audioUrl) {
        latestStepIndex = STEPS.findIndex(
          (step) => step.id === "audioGeneration",
        );
      }

      if (audioUrl) {
        latestStepIndex = STEPS.findIndex((step) => step.id === "complete");
        newCompletedSteps.add("audioGeneration");
        newCompletedSteps.add("complete");
      }

      setCurrentStepIndex(latestStepIndex);
      setCompletedSteps(newCompletedSteps);
    };

    processEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, pollUrl, audioUrl]);

  const { execute: executePolling, status: pollingStatus } = useAction(
    pollPodcastAudio,
    {
      onError: () => toast.error("Error polling podcast"),
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
        const reader = data.output.getReader();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          setRes((prev) => [...prev, value.part]);

          if (
            value.part.type === "tool-result" &&
            value.part.toolName === "savePodcastDetails" &&
            !!value.part.result[0]?.podcastScript
          ) {
            submitForAudioProduction({
              script: value.part.result[0].podcastScript,
            });
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

  return {
    completedSteps,
    currentStepIndex,
    isProcessing,
    status,
    handleGenerate,
  };
};
