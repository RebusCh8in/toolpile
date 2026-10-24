import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Random Number Generator - Free Online Tool",
  description: "Generate random numbers within a range. Single or multiple numbers, with or without duplicates.",
  alternates: {
    canonical: "https://toolpile.app/tools/random-number-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
