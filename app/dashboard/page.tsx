import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="mt-2 text-slate-400">
              Manage documents and send them for signature.
            </p>
          </div>

          <Link
            href="/upload"
            className="rounded-xl bg-white px-5 py-3 font-medium text-slate-950"
          >
            + New Document
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-400">
          No documents yet.
        </div>
      </div>
    </main>
  );
}
