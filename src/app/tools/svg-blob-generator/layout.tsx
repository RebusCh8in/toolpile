import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG Blob Generator - Free Online Tool",
  description: "Generate organic SVG blob shapes with custom colors and complexity. Copy SVG code or download. Free online tool.",
  alternates: {
    canonical: "https://toolpile.app/tools/svg-blob-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
