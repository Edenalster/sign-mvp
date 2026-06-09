"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import SignatureField from "./SignatureField";
import SignatureModal from "../signature/SignatureModal";

const PdfViewer = dynamic(() => import("../pdf/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center text-gray-500">
      Loading PDF...
    </div>
  ),
});

type Props = {
  documentId: string;
};

type Field = {
  id: string;
  page: number;
  xPercent: number;
  yPercent: number;
  type: "signature";
  signedImage?: string;
};

export default function EditorClient({ documentId }: Props) {
  const [hydrated, setHydrated] = useState(false);

  const [placingSignature, setPlacingSignature] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const [saved, setSaved] = useState(false);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [fields, setFields] = useState<Field[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [numPages, setNumPages] = useState(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  type MongoField = {
    _id: string;
    page: number;
    xPercent: number;
    yPercent: number;
    signedImage?: string | null;
  };

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);

        const document = await response.json();

        setPdfUrl(document.pdfUrl ?? null);
        const fieldsResponse = await fetch(
          `/api/signature-fields/${documentId}`
        );

        const fields = await fieldsResponse.json();

        setFields(
          fields.map((field: MongoField) => ({
            id: field._id,
            page: field.page,
            xPercent: field.xPercent,
            yPercent: field.yPercent,
            signedImage: field.signedImage,
            type: "signature",
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setHydrated(true);
      }
    });
  }, [documentId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/signature-fields/${documentId}`);

        const mongoFields = await response.json();

        setFields(
          mongoFields.map((field: MongoField) => ({
            id: field._id,
            page: field.page,
            xPercent: field.xPercent,
            yPercent: field.yPercent,
            signedImage: field.signedImage ?? undefined,
            type: "signature",
          }))
        );
      } catch (error) {
        console.error(error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [documentId]);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(`fields-${documentId}`, JSON.stringify(fields));
  }, [fields, documentId, hydrated]);

  const handlePdfClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingSignature) return;

    const container = pdfContainerRef.current;

    if (!container) return;

    const rect = container.getBoundingClientRect();

    const xPercent = (e.clientX - rect.left) / rect.width;
    const yPercent = (e.clientY - rect.top) / rect.height;

    const response = await fetch("/api/signature-fields", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
        page: currentPage,
        xPercent,
        yPercent,
      }),
    });

    const newField = await response.json();

    setFields((prev) => [
      ...prev,
      {
        id: newField._id,
        page: newField.page,
        xPercent: newField.xPercent,
        yPercent: newField.yPercent,
        signedImage: newField.signedImage,
        type: "signature",
      },
    ]);

    setPlacingSignature(false);
  };
  useEffect(() => {
    console.log("FIELDS", fields);
  }, [fields]);

  useEffect(() => {
    const loadFields = () => {
      try {
        const fieldsRaw = localStorage.getItem(`fields-${documentId}`);

        if (fieldsRaw) {
          setFields(JSON.parse(fieldsRaw));
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === `fields-${documentId}`) {
        loadFields();
      }
    };

    window.addEventListener("storage", handleStorage);

    const interval = setInterval(loadFields, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [documentId]);

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const moveField = (id: string, xPercent: number, yPercent: number) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? {
              ...field,
              xPercent,
              yPercent,
            }
          : field
      )
    );
  };

  const openSignatureModal = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setIsModalOpen(true);
  };

  const saveSignature = (image: string) => {
    if (!selectedFieldId) return;

    setFields((prev) =>
      prev.map((field) =>
        field.id === selectedFieldId
          ? {
              ...field,
              signedImage: image,
            }
          : field
      )
    );

    setSelectedFieldId(null);
    setIsModalOpen(false);
  };

  const signingLink = hydrated
    ? `${window.location.origin}/sign/${documentId}`
    : "";

  const copySigningLink = async () => {
    try {
      await navigator.clipboard.writeText(signingLink);

      alert("Signing link copied");
    } catch (error) {
      console.error(error);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  console.log({
    currentPage,
    numPages,
  });

  const allSigned =
    fields.length > 0 && fields.every((field) => field.signedImage);

  return (
    <>
      <div className="mt-10 flex gap-6">
        <div
          className={`relative flex-1 overflow-auto rounded-2xl bg-white p-4 ${
            placingSignature ? "cursor-crosshair" : ""
          }`}
        >
          {pdfUrl ? (
            <>
              <div
                ref={pdfContainerRef}
                className="relative mx-auto w-fit"
                onClick={handlePdfClick}
              >
                <button
                  disabled={currentPage === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((p) => p - 1);
                  }}
                  className="absolute -left-16 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 text-2xl text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ‹
                </button>

                <PdfViewer
                  fileUrl={pdfUrl}
                  currentPage={currentPage}
                  onLoadSuccess={setNumPages}
                />

                {fields
                  .filter((field) => field.page === currentPage)
                  .map((field) => (
                    <SignatureField
                      key={field.id}
                      id={field.id}
                      xPercent={field.xPercent}
                      yPercent={field.yPercent}
                      signedImage={field.signedImage}
                      onMove={moveField}
                      onDelete={removeField}
                      onClick={() => {}}
                    />
                  ))}

                <button
                  disabled={currentPage === numPages}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((p) => p + 1);
                  }}
                  className="absolute -right-16 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 text-2xl text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ›
                </button>
              </div>

              <div className="mt-4 text-center text-sm font-medium text-slate-700">
                Page {currentPage} of {numPages}
              </div>

              {placingSignature && (
                <div className="absolute left-4 top-4 z-50 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
                  Click anywhere on the PDF
                </div>
              )}
            </>
          ) : (
            <div className="flex h-[600px] items-center justify-center text-gray-500">
              PDF not found
            </div>
          )}
        </div>

        <div className="w-80 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold text-white">Actions</h2>

          <button
            onClick={() => setPlacingSignature(true)}
            className="mt-4 w-full rounded-xl bg-white px-4 py-3 font-medium text-slate-950"
          >
            Add Signature Field
          </button>

          {saved && (
            <div className="mt-3 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
              Document Saved
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/10 p-4">
            <div className="text-sm font-medium text-white">Signing Link</div>

            <div className="mt-2 break-all text-xs text-slate-400">
              {signingLink}
            </div>

            <button
              onClick={copySigningLink}
              className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
            >
              Copy Link
            </button>
          </div>
          {allSigned && (
            <a
              href={`/api/documents/${documentId}/download`}
              target="_blank"
              className="mt-4 block w-full rounded-xl bg-green-600 px-4 py-3 text-center font-medium text-white"
            >
              Download Signed PDF
            </a>
          )}
        </div>
      </div>

      <SignatureModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFieldId(null);
        }}
        onSave={saveSignature}
      />
    </>
  );
}
