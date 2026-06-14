"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);

  const router = useRouter();

  const handleContinue = async () => {
    if (files.length === 0) return;

    const formData = new FormData();

    formData.append("file", files[0]);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("UPLOAD RESULT", result);

    if (!response.ok || !result.url) {
      console.error("Upload failed", result);
      alert("Upload failed");
      return;
    }

    const documentResponse = await fetch("/api/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: files[0].name,
        pdfUrl: result.url,
      }),
    });

    console.log("DOCUMENT RESPONSE STATUS", documentResponse.status);

    const document = await documentResponse.json();

    console.log("DOCUMENT RESULT", document);

    if (!document._id) {
      console.error("Document creation failed", document);
      alert("Document creation failed");
      return;
    }

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
            multiple
            accept=".pdf"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <div className="space-y-2">
              {files.map((file) => (
                <p key={file.name} className="text-green-400">
                  {file.name}
                </p>
              ))}
            </div>

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
