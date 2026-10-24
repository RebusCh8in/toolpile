import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bionic Reading Converter - Free Online Tool",
  description: "Convert text to Bionic Reading format. Bold the beginning of each word to guide your eyes for faster, more focused reading.",
  alternates: {
    canonical: "https://toolpile.app/tools/bionic-reading",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
