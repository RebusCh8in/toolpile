import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF - Free Online Tool",
  description: "Compress PDF files online for free. Reduce file size by optimizing images and removing unused data. No upload to any server — everything runs privately in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/compress-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
