import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life Insurance Calculator - How Much Do You Need? (2026)",
  description: "Calculate exactly how much life insurance you need based on your income, debts, dependents, and goals. Free, instant results — no email required.",
  alternates: {
    canonical: "https://toolpile.app/tools/life-insurance-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
