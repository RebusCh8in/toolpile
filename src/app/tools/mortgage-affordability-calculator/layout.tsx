import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage Affordability Calculator - Free Online Tool",
  description: "Find out how much house you can afford based on income, debts, and down payment. Uses the 28/36 DTI rule.",
  alternates: {
    canonical: "https://toolpile.app/tools/mortgage-affordability-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
