import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dog Age Calculator - Free Online Tool",
  description: "Convert your dog's age to human years using the modern science-based method. Accounts for breed size, life stage, and real aging rates \u2014 not the outdated multiply-by-7 myth.",
  alternates: {
    canonical: "https://toolpile.app/tools/dog-age-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
