import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Loan Calculator - Free Online Tool",
  description: "Calculate monthly student loan payments and total interest. Compare standard vs extra payment plans.",
  alternates: {
    canonical: "https://toolpile.app/tools/student-loan-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
