import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retirement Calculator - Free Online Tool",
  description: "Calculate how much you need to retire. See projected savings growth, withdrawal income, and the impact of inflation on your retirement funds.",
  alternates: {
    canonical: "https://toolpile.app/tools/retirement-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
