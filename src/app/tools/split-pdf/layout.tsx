import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF - Free Online Tool",
  description: "Split PDF files online for free. Extract pages, split into chunks, divide into equal parts, or separate every page. No upload — everything runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/split-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
