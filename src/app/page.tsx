import { NotebooksSkeleton } from "@/components/custom/home-page/notebook-skeleton";
import { NotebooksGrid } from "@/components/custom/home-page/notebooks-grid";
import { UploadSources } from "@/components/custom/uploads/upload-sources";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Code, FileText, Upload } from "lucide-react";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const sessionId = (await searchParams).sessionId;
  if (!sessionId) return null;

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-100 opacity-50 blur-3xl" />
        <div className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-teal-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-purple-100 opacity-50 blur-3xl" />
        <div className="absolute top-[0%] -right-[0%] w-[50%] h-[70%] rounded-full bg-red-100 opacity-50 blur-3xl" />
        <div className="absolute bottom-[0%] -left-[0%] w-[50%] h-[70%] rounded-full bg-orange-100 opacity-50 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative min-h-screen flex items-center">
        <div className="text-center max-w-4xl mx-auto w-full">
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
            Welcome to NotebookLM
          </h1>

          <Card className="rounded-3xl py-8 w-full">
            <CardHeader>
              <h2 className="text-3xl font-semibold">
                Create a podcast from your documents
              </h2>
              <p className="text-muted-foreground">
                NotebookLM is an AI-powered assistant that creates podcasts from
                the sources you upload
              </p>
            </CardHeader>

            <CardContent>
              <Suspense fallback={<NotebooksSkeleton />}>
                <NotebooksGrid sessionId={sessionId} />
              </Suspense>
            </CardContent>

            <CardFooter className="justify-center">
              <div className="flex flex-col items-center gap-4">
                <UploadSources variant="welcome" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
