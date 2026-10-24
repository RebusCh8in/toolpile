import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator - Free Online Tool",
  description: "Generate placeholder text in paragraphs, sentences, or words.",
  alternates: {
    canonical: "https://toolpile.app/tools/lorem-ipsum-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
