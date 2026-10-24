import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mean, Median, Mode Calculator - Free Online Tool",
  description: "Calculate mean, median, mode, range, standard deviation, and more from any dataset.",
  alternates: {
    canonical: "https://toolpile.app/tools/mean-median-mode-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
