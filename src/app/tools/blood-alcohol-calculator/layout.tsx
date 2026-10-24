import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blood Alcohol Calculator - Free Online Tool",
  description: "Estimate your Blood Alcohol Content (BAC) using the Widmark formula. Enter your weight, sex, drink details, and time to get an approximate BAC level with impairment descriptions.",
  alternates: {
    canonical: "https://toolpile.app/tools/blood-alcohol-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
