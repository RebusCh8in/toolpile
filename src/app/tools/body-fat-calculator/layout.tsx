import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Body Fat Calculator - Free Online Tool",
  description: "Estimate your body fat percentage using the US Navy method. Enter measurements to see fat mass, lean mass, and fitness category.",
  alternates: {
    canonical: "https://toolpile.app/tools/body-fat-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
