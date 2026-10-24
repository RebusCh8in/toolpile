import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SAVE vs RAP Calculator — Compare Your Student Loan Payments | ToolPile",
  description:
    "The SAVE plan is dead. Compare your monthly student loan payments under the new RAP plan, IBR, and standard repayment. See how much more you'll pay and plan ahead.",
  alternates: {
    canonical: "https://toolpile.app/tools/save-vs-rap-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
