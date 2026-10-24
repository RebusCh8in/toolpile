import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barcode Generator - Free Online Tool",
  description: "Generate Code 128 barcodes from any text. Download as PNG. Free, no upload — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/barcode-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
