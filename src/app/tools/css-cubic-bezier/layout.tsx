import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Cubic Bezier Generator - Free Online Tool",
  description: "Create custom CSS animation easing curves visually. Drag control points, preview animations, and copy the cubic-bezier() value.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-cubic-bezier",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
