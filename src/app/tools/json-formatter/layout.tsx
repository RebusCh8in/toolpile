import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter - Free Online Tool",
  description: "Prettify, minify, and validate JSON with syntax highlighting.",
  alternates: {
    canonical: "https://toolpile.app/tools/json-formatter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
