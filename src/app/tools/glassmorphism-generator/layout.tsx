import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glassmorphism Generator - Free Online Tool",
  description: "Create frosted glass CSS effects with a live visual editor. Adjust blur, transparency, and borders. Copy the CSS with one click.",
  alternates: {
    canonical: "https://toolpile.app/tools/glassmorphism-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
