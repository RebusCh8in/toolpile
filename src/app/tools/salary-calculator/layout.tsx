import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salary Calculator - Free Online Tool",
  description: "Convert between annual salary and hourly wage. See monthly, biweekly, weekly, and daily breakdown with estimated federal tax.",
  alternates: {
    canonical: "https://toolpile.app/tools/salary-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
