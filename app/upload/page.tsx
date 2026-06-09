"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  const handleContinue = async () => {
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    const documentResponse = await fetch("/api/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: file.name,
        pdfUrl: result.url,
      }),
    });

    const document = await documentResponse.json();

    router.push(`/editor/${document._id}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Upload Document</h1>

        <p className="mt-2 text-slate-400">
          Upload a PDF and place signature fields.
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-white/20 p-10">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {file && (
          <div className="mt-6">
            <p className="text-green-400">{file.name}</p>

            <button
              onClick={handleContinue}
              className="mt-4 rounded-xl bg-white px-5 py-3 text-slate-950 font-medium"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
