"use client";

import { useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

type Props = {
  fileUrl: string;
  currentPage: number;
  onLoadSuccess: (numPages: number) => void;
  onPageRendered?: () => void;
};

export default function PdfViewer({
  fileUrl,
  currentPage,
  onLoadSuccess,
  onPageRendered,
}: Props) {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  const isMobile = window.innerWidth <= 768;

  return (
    <Document
      file={fileUrl}
      onLoadSuccess={(pdf) => onLoadSuccess(pdf.numPages)}
    >
      <Page
        pageNumber={currentPage}
        width={isMobile ? window.innerWidth - 40 : 800}
        onRenderSuccess={() => {
          onPageRendered?.();
        }}
      />
    </Document>
  );
}
