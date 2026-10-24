import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waist-to-Hip Ratio Calculator - Free Online Tool",
  description: "Calculate your waist-to-hip ratio (WHR) to assess health risk. Based on WHO guidelines for men and women.",
  alternates: {
    canonical: "https://toolpile.app/tools/waist-to-hip-ratio-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
