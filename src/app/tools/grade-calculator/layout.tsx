import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grade Calculator - Free Online Tool",
  description: "Calculate your class grade with weighted or points-based grading. Add assignments with scores and weights.",
  alternates: {
    canonical: "https://toolpile.app/tools/grade-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
