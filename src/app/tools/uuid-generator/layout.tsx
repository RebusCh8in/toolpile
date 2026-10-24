import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID Generator - Free Online Tool",
  description: "Generate random UUID v4 identifiers. Single or bulk generation with formatting options.",
  alternates: {
    canonical: "https://toolpile.app/tools/uuid-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
