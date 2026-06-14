"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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

export default function SignClient({ documentId }: Props) {
  const [isReady, setIsReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedSidebarField, setSelectedSidebarField] = useState<
    string | null
  >(null);
  const [documentCompleted, setDocumentCompleted] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfSize, setPdfSize] = useState({ width: 800, height: 1131 });
  useEffect(() => {
    console.log("PDF SIZE UPDATED", pdfSize);
  }, [pdfSize]);
  type MongoField = {
    _id: string;
    page: number;
    xPercent: number;
    yPercent: number;
    signedImage?: string | null;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const documentResponse = await fetch(`/api/documents/${documentId}`);

        const document = await documentResponse.json();

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
            signedImage: field.signedImage ?? undefined,
            type: "signature",
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsReady(true);
      }
    };

    loadData();
  }, [documentId]);

  const saveSignature = async (image: string) => {
    if (!selectedFieldId) return;

    const updatedFields = fields.map((field) =>
      field.id === selectedFieldId
        ? {
            ...field,
            signedImage: image,
          }
        : field
    );

    setFields(updatedFields);

    await fetch(`/api/signature-fields/${selectedFieldId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signedImage: image,
      }),
    });
    const response = await fetch(
      `/api/signature-fields/update/${selectedFieldId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signedImage: image,
        }),
      }
    );

    const result = await response.json();

    console.log("PATCH RESULT", result);

    const allSigned =
      updatedFields.length > 0 &&
      updatedFields.every((field) => field.signedImage);

    if (allSigned) {
      setDocumentCompleted(true);
    }

    setIsModalOpen(false);
    setSelectedFieldId(null);
  };

  const signedCount = fields.filter((field) => field.signedImage).length;

  const sendSignedDocument = async () => {
    try {
      setSendingEmail(true);

      const response = await fetch("/api/send-signed-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          name: signerName,
          email: signerEmail,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (documentCompleted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-green-500/20 bg-green-500/10 p-8 text-center">
          <div className="text-6xl">✅</div>

          <h1 className="mt-6 text-3xl font-bold">Document Signed</h1>

          <p className="mt-3 text-slate-400">
            Please provide your details and send the signed document.
          </p>

          {emailSent ? (
            <div className="mt-6 rounded-xl bg-green-600 p-4 text-white">
              Signed document sent successfully.
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Your Name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="mt-6 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />

              <input
                type="email"
                placeholder="Your Email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />

              <button
                disabled={!signerName || !signerEmail || sendingEmail}
                onClick={sendSignedDocument}
                className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 disabled:opacity-50"
              >
                {sendingEmail ? "Sending..." : "Send Signed Document"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Debug logs before rendering the main document UI
  console.log("FIELDS", fields);
  console.log("PDF SIZE", pdfSize);
  return (
    <>
      <div className="mt-10 flex flex-col gap-6 px-4 lg:flex-row lg:px-10">
        <div className="relative flex-1 overflow-x-auto rounded-2xl bg-white p-2 lg:p-4">
          {pdfUrl ? (
            <>
              <div className="relative mx-auto w-fit">
                <button
                  disabled={currentPage === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((p) => p - 1);
                  }}
                  className="absolute -left-4 lg:-left-16 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 text-2xl text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ‹
                </button>

                <PdfViewer
                  fileUrl={pdfUrl}
                  currentPage={currentPage}
                  onLoadSuccess={setNumPages}
                  onPageRendered={() => {
                    const page = document.querySelector(
                      ".react-pdf__Page"
                    ) as HTMLElement | null;

                    if (!page) {
                      console.log("PAGE NOT FOUND");
                      return;
                    }

                    const rect = page.getBoundingClientRect();

                    console.log("REAL PDF SIZE", rect.width, rect.height);

                    setPdfSize({
                      width: rect.width,
                      height: rect.height,
                    });
                  }}
                />

                <button
                  disabled={currentPage === numPages}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((p) => p + 1);
                  }}
                  className="absolute -right-4 lg:-right-16 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 text-2xl text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ›
                </button>

                {fields
                  .filter((field) => field.page === currentPage)
                  .map((field) => {
                    // Debug log for each field's position
                    console.log("FIELD POSITION", {
                      id: field.id,
                      xPercent: field.xPercent,
                      yPercent: field.yPercent,
                    });
                    if (field.signedImage) {
                      return (
                        <img
                          key={field.id}
                          src={field.signedImage}
                          alt="signature"
                          className="absolute z-50 object-contain"
                          style={{
                            left: `${field.xPercent * 100}%`,
                            top: `${field.yPercent * 100}%`,
                            width: window.innerWidth < 768 ? 80 : 180,
                            height: window.innerWidth < 768 ? 32 : 60,
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      );
                    }

                    return (
                      <div
                        key={field.id}
                        onClick={() => {
                          setSelectedFieldId(field.id);
                          setSelectedSidebarField(field.id);
                          setIsModalOpen(true);
                        }}
                        className={`absolute z-50 flex h-[32px] w-[80px] md:h-[60px] md:w-[180px] cursor-pointer items-center justify-center border-2 text-xs font-semibold shadow-md transition-all ${
                          selectedSidebarField === field.id
                            ? "border-amber-500 bg-amber-100 text-amber-800"
                            : "border-emerald-500 bg-emerald-100 text-emerald-800"
                        }`}
                        style={{
                          left: `${field.xPercent * 100}%`,
                          top: `${field.yPercent * 100}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <span className="text-[10px] md:text-xs">
                          SIGN HERE
                        </span>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 text-center text-sm font-medium text-slate-700">
                Page {currentPage} of {numPages}
              </div>
            </>
          ) : (
            <div className="flex h-[600px] items-center justify-center text-gray-500">
              PDF not found
            </div>
          )}
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 lg:w-80">
          <h2 className="font-semibold text-white">Required Signatures</h2>

          <div className="mt-2 text-sm text-slate-400">
            {signedCount} / {fields.length} Signed
          </div>

          <div className="mt-6 space-y-3">
            {fields.length === 0 ? (
              <p className="text-sm text-slate-400">No signatures required</p>
            ) : (
              fields.map((field, index) => (
                <button
                  key={field.id}
                  onClick={() => {
                    setCurrentPage(field.page);
                    setSelectedSidebarField(field.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                    selectedSidebarField === field.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div>
                    <div className="text-white">Signature #{index + 1}</div>
                    <div className="text-xs text-slate-400">
                      Page {field.page}
                    </div>
                  </div>

                  {field.signedImage ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-yellow-400">○</span>
                  )}
                </button>
              ))
            )}
          </div>
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
