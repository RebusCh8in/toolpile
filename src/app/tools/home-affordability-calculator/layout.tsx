import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Affordability Calculator - How Much House Can I Afford? (2026)",
  description: "Find out how much house you can afford based on your income, debts, down payment, and interest rate. See monthly payment breakdown with taxes and insurance.",
  alternates: {
    canonical: "https://toolpile.app/tools/home-affordability-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
