import EditorClient from "../../../compnents/editor/EditorClient";

type Props = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function EditorPage({ params }: Props) {
  const { documentId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Document Editor</h1>

        <EditorClient documentId={documentId} />
      </div>
    </main>
  );
}
