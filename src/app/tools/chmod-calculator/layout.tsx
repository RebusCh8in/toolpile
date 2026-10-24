import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chmod Calculator - Free Online Tool",
  description: "Calculate Unix file permissions visually. Convert between octal and symbolic chmod notation. Free online tool.",
  alternates: {
    canonical: "https://toolpile.app/tools/chmod-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
