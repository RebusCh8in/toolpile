import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Transform Generator - Free Online Tool",
  description: "Build CSS transforms visually. Translate, rotate, scale, and skew with live preview.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-transform-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
