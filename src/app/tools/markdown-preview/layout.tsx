import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Preview - Free Online Tool",
  description: "Write and preview Markdown with a live split-pane editor. Supports GFM (GitHub Flavored Markdown).",
  alternates: {
    canonical: "https://toolpile.app/tools/markdown-preview",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
