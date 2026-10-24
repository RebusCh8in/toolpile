import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Character Counter - Free Online Tool",
  description: "Count characters, words, sentences, paragraphs, and lines. Social media character limits and reading time.",
  alternates: {
    canonical: "https://toolpile.app/tools/character-counter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
