"use client";

import { motion } from "framer-motion";

type Props = {
  id: string;
  xPercent: number;
  yPercent: number;
  signedImage?: string;
  onMove: (id: string, xPercent: number, yPercent: number) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
};

export default function SignatureField({
  id,
  xPercent,
  yPercent,
  signedImage,
  onMove,
  onDelete,
  onClick,
}: Props) {
  return (
    <motion.div
      drag={!signedImage}
      dragMomentum={false}
      onClick={() => onClick(id)}
      onDragEnd={(_, info) => {
        const parent = document
          .querySelector("[data-pdf-container]")
          ?.getBoundingClientRect();

        if (!parent) return;

        const newXPercent = (info.point.x - parent.left) / parent.width;

        const newYPercent = (info.point.y - parent.top) / parent.height;

        onMove(id, newXPercent, newYPercent);
      }}
      className={`absolute z-50 flex h-[45px] w-[100px] md:h-[60px] md:w-[180px] items-center justify-center transition-all duration-200 ${
        signedImage
          ? ""
          : "cursor-grab border-2 border-blue-500 bg-blue-100 text-xs font-semibold text-blue-700 shadow-md hover:scale-[1.02] hover:shadow-xl active:cursor-grabbing"
      }`}
      style={{
        left: `${xPercent * 100}%`,
        top: `${yPercent * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {signedImage ? (
        <img
          src={signedImage}
          alt="signature"
          className="h-full w-full object-contain"
        />
      ) : (
        "SIGN HERE"
      )}

      {!signedImage && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}
