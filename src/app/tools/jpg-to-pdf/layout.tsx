import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF Converter - Free Online Tool",
  description: "Convert JPG and JPEG images to PDF for free. Combine multiple images into one PDF with custom page size, orientation, and margins. Everything runs in your browser — no upload required.",
  alternates: {
    canonical: "https://toolpile.app/tools/jpg-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
