import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Shades Generator - Free Online Tool",
  description: "Generate a Tailwind-style color palette from any color. Get 11 shades from light to dark. Free and instant.",
  alternates: {
    canonical: "https://toolpile.app/tools/color-shades-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
