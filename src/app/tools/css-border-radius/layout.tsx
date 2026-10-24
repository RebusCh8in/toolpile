import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Border Radius Generator - Free Online Tool",
  description: "Create fancy border-radius shapes with the 8-value syntax. Generate organic blobs, leaves, and asymmetric corners visually.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-border-radius",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
