import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to Text (OCR) - Free Online Tool",
  description: "Extract text from images for free using OCR. Supports PNG, JPG, screenshots, and scanned documents. Multi-language, no upload — runs in your browser.",
  alternates: { canonical: "https://toolpile.app/tools/image-to-text" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
