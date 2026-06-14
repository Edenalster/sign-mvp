"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
};

export default function SignatureModal({ open, onClose, onSave }: Props) {
  const sigRef = useRef<SignatureCanvas>(null);

  if (!open) return null;

  const handleSave = () => {
    if (!sigRef.current) return;

    const signature = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    onSave(signature);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-auto rounded-2xl bg-white p-4 md:p-6">
        <h2 className="text-xl font-semibold">Draw Signature</h2>

        <div className="mt-4 overflow-hidden rounded-xl border">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              width:
                typeof window !== "undefined"
                  ? Math.min(window.innerWidth - 60, 650)
                  : 650,
              height: 250,
              className: "bg-white w-full",
            }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={() => sigRef.current?.clear()}
            className="rounded-lg border px-4 py-2 bg-gray-950"
          >
            Clear
          </button>

          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 bg-red-600 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
