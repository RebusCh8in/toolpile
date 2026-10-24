import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Square Footage Calculator - Free Online Tool",
  description: "Calculate square footage for any shape. Supports rectangles, circles, triangles, trapezoids, and L-shapes. Add multiple rooms, convert between units, and estimate project costs.",
  alternates: {
    canonical: "https://toolpile.app/tools/square-footage-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
