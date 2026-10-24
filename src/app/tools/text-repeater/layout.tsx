import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Repeater - Free Online Tool",
  description: "Repeat any text multiple times with custom separators. Copy repeated text for pasting anywhere.",
  alternates: {
    canonical: "https://toolpile.app/tools/text-repeater",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
