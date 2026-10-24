import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF - Free Online Tool",
  description: "Combine multiple PDF files into one document for free. Reorder pages, preview file details, and download the merged result. No upload — everything runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/merge-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
