import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Gradient Generator - Free Online Tool",
  description: "Build linear, radial, and conic CSS gradients with a visual editor.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-gradient-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
