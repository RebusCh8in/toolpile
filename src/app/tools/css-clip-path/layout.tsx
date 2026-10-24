import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Clip Path Generator - Free Online Tool",
  description: "Create CSS clip-path shapes visually. Pick from preset shapes or enter custom paths. Copy the CSS with one click.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-clip-path",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
