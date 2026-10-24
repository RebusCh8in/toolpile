import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Grid Generator - Free Online Tool",
  description: "Build CSS Grid layouts visually. Customize columns, rows, gaps, and alignment with a live preview.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-grid",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
