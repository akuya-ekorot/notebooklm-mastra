import { fetchNavbarName } from "@/db/queries/notebooks";
import { NotebookNameForm } from "./notebook-name";

interface NotebookNameWrapperProps {
  sessionId: string;
  notebookId: string;
}
export const NotebookNameWrapper: React.FC<NotebookNameWrapperProps> = async ({
  notebookId,
  sessionId,
}) => {
  const notebookName = (await fetchNavbarName(notebookId, sessionId))[0].name;
  return <NotebookNameForm initialName={notebookName} />;
};
