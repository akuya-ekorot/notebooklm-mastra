import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";

interface NotebookCardProps {
  notebook: any;
  sessionId: string;
}
export const NotebookCard: React.FC<NotebookCardProps> = ({
  notebook,
  sessionId,
}) => (
  <Link href={`/notebook/${notebook.id}?sessionId=${sessionId}`}>
    <Card className="h-48">
      <CardHeader className="p-4 items-start truncate">
        <CardTitle>{notebook.emoji}</CardTitle>
        <CardDescription className="font-semibold w-full truncate">
          {notebook.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground line-clamp-5 text-start">
          {notebook.summary}
        </p>
      </CardContent>
    </Card>
  </Link>
);
