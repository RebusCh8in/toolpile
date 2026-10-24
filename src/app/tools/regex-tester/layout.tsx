import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester - Free Online Tool",
  description: "Test regular expressions with live highlighting, match info, and replace mode.",
  alternates: {
    canonical: "https://toolpile.app/tools/regex-tester",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
