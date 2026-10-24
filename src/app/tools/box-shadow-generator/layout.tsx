import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Box Shadow Generator - Free Online Tool",
  description: "Design CSS box shadows with a live visual editor. Add multiple shadows, adjust offsets, blur, and spread.",
  alternates: {
    canonical: "https://toolpile.app/tools/box-shadow-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
