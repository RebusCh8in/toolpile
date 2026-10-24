import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hourly to Salary Calculator - Free Online Tool",
  description: "Convert hourly wage to annual salary and vice versa. Accounts for hours worked and vacation time.",
  alternates: {
    canonical: "https://toolpile.app/tools/hourly-to-salary-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
