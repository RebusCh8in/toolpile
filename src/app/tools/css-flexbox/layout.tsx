import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Flexbox Generator - Free Online Tool",
  description: "Build CSS Flexbox layouts visually. Adjust direction, alignment, wrapping, and gap with a live preview.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-flexbox",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
