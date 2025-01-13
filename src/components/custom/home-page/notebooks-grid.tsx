import { db } from "@/db";
import { Feature, FEATURES } from "./feature";
import { NotebookContent } from "./notebook-content";

interface NotebooksGridProps {
  sessionId: string;
}

export const NotebooksGrid: React.FC<NotebooksGridProps> = async ({
  sessionId,
}) => {
  const notebooks = await db.query.notebooks.findMany({
    where: (t, h) => h.eq(t.userId, sessionId),
    columns: {
      id: true,
      name: true,
      title: true,
      emoji: true,
      summary: true,
    },
  });

  const hasNotebooks = notebooks.length > 0;

  if (!hasNotebooks) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mb-14">
        {FEATURES.map((feat) => (
          <Feature key={feat.text} {...feat} />
        ))}
      </div>
    );
  }

  return <NotebookContent notebooks={notebooks} />;
};
