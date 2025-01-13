import { Skeleton } from "@/components/ui/skeleton";

export const NotebooksSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-14 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-48 w-full">
        <Skeleton className="h-full w-full" />
      </div>
    ))}
  </div>
);
