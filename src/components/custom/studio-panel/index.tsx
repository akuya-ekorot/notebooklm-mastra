import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { GeneratePodcast } from "./generate-podcast";

interface StudioPanelProps {
  notebookId: string;
}

export const StudioPanel: React.FC<StudioPanelProps> = async ({
  notebookId,
}) => {
  const studio = await db.query.notebooks.findFirst({
    where: (t, h) => h.eq(t.id, notebookId),
    columns: {
      notebookStatus: true,
    },
    with: {
      notebookPodcast: {
        columns: {
          audioUrl: true,
        },
      },
    },
  });

  const audioUrl = studio?.notebookPodcast.find((p) => !!p.audioUrl)?.audioUrl;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Studio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {audioUrl ? (
          <audio controls src={audioUrl} className="w-full">
            Your browser doesn&apos;t support the audio element
          </audio>
        ) : (
          <GeneratePodcast
            audioUrl={audioUrl ?? undefined}
            notebookId={notebookId}
            notebookStatus={
              studio?.notebookStatus ?? "awaiting_source_summaries"
            }
          />
        )}
      </CardContent>
    </Card>
  );
};

export const StudioPanelSkeleton: React.FC = () => {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Studio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <GeneratePodcast
          audioUrl={undefined}
          notebookId={""}
          notebookStatus={"awaiting_source_summaries"}
        />
      </CardContent>
    </Card>
  );
};
