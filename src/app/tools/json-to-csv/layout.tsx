import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to CSV Converter - Free Online Tool",
  description: "Convert between JSON and CSV formats. Bidirectional conversion with download support. Free and private.",
  alternates: {
    canonical: "https://toolpile.app/tools/json-to-csv",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
