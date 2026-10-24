import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JavaScript Minifier - Free Online Tool",
  description: "Minify JavaScript code online for free. Remove whitespace and comments to reduce file size. No upload — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/js-minifier",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
