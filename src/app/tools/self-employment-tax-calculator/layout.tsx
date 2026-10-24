import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Self-Employment Tax Calculator - 1099 & Freelance Taxes (2026)",
  description: "Calculate self-employment tax, estimated quarterly payments, and total tax burden for freelancers and 1099 workers. Includes federal, SE tax, and state.",
  alternates: {
    canonical: "https://toolpile.app/tools/self-employment-tax-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
