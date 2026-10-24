import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Table Generator - Free Online Tool",
  description: "Create HTML, Markdown, and CSV tables with a spreadsheet-like editor. Paste from Excel, customize, and copy the output.",
  alternates: {
    canonical: "https://toolpile.app/tools/html-table-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
