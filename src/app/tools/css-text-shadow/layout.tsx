import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Text Shadow Generator - Free Online Tool",
  description: "Create CSS text-shadow effects with a live visual editor. Multiple layers, presets for neon glow, 3D, fire, and more.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-text-shadow",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
