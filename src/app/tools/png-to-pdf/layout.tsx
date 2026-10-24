import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PNG to PDF Converter - Free Online Tool",
  description: "Convert PNG images to PDF for free. Combine multiple PNGs into a single PDF with custom page size, orientation, and margins. Everything runs in your browser — no uploads.",
  alternates: {
    canonical: "https://toolpile.app/tools/png-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
