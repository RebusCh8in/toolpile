import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pregnancy Due Date Calculator - Free Online Tool",
  description: "Calculate your estimated due date based on your last menstrual period. See trimester, milestones, and conception date.",
  alternates: {
    canonical: "https://toolpile.app/tools/pregnancy-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
