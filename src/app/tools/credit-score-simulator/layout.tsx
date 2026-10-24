import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Score Simulator - See How Actions Affect Your Score (2026)",
  description: "Simulate how paying off debt, opening new accounts, or missing payments affects your credit score. Free interactive credit score estimator.",
  alternates: {
    canonical: "https://toolpile.app/tools/credit-score-simulator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
