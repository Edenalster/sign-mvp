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
      <div className="w-[700px] rounded-2xl bg-white p-6">
        <h2 className="text-xl font-semibold">Draw Signature</h2>

        <div className="mt-4 overflow-hidden rounded-xl border">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              width: 650,
              height: 250,
              className: "bg-white",
            }}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => sigRef.current?.clear()}
            className="rounded-lg border px-4 py-2 bg-gray-950"
          >
            Clear
          </button>

          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 bg-gray-600"
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
