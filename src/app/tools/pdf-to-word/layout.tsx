import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Word Converter - Free Online Tool",
  description: "Convert PDF to Word document for free. Extract text from any PDF and download as .doc file. No upload, no signup — runs entirely in your browser.",
  alternates: { canonical: "https://toolpile.app/tools/pdf-to-word" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
