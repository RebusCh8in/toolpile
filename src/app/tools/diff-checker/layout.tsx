import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diff Checker - Free Online Tool",
  description: "Compare two blocks of text and see the differences highlighted. Free online diff tool — no upload, runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/diff-checker",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
