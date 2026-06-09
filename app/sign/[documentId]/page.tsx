import SignClient from "../../../compnents/sign/SignClient";

type Props = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function SignPage({ params }: Props) {
  const { documentId } = await params;

  return (
    <main className="min-h-screen bg-slate-950">
      <SignClient documentId={documentId} />
    </main>
  );
}
