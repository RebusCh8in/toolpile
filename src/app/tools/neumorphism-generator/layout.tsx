import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neumorphism Generator - Free Online Tool",
  description: "Generate soft UI / neumorphic CSS effects. Customize shadow depth, blur, shape, and color with a live preview.",
  alternates: {
    canonical: "https://toolpile.app/tools/neumorphism-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
