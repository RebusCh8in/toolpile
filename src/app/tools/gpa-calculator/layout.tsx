import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPA Calculator - Free Online Tool",
  description: "Calculate your semester and cumulative GPA. Add courses with grades and credit hours for instant results.",
  alternates: {
    canonical: "https://toolpile.app/tools/gpa-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
