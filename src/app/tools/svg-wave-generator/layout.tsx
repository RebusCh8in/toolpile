import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG Wave Generator - Free Online Tool",
  description: "Generate SVG wave section dividers with custom colors, layers, and complexity. Copy SVG or download. Free online tool.",
  alternates: {
    canonical: "https://toolpile.app/tools/svg-wave-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
