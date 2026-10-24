import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interest Calculator - Free Online Tool",
  description: "Calculate simple and compound interest on savings or investments. Compare growth over time with year-by-year breakdown.",
  alternates: {
    canonical: "https://toolpile.app/tools/interest-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
