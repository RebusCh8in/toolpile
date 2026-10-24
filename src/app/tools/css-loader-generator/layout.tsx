import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Loader Generator - Free Online Tool",
  description: "Generate pure CSS loading spinners and animations. Customize color, size, and speed. Copy HTML + CSS with one click.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-loader-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
