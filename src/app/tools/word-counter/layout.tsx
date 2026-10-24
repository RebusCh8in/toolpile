import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter - Free Online Tool",
  description: "Count words, characters, sentences, and paragraphs. Analyze reading time and word frequency.",
  alternates: {
    canonical: "https://toolpile.app/tools/word-counter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
