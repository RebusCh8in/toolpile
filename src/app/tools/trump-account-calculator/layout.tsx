import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trump Account Calculator — How Much Will Your Child's Account Be Worth? | ToolPile",
  description: "Free Trump Account (Section 530A) growth calculator. See how the $1,000 government seed deposit and $5,000 annual contributions could grow for your child. Includes tax basis tracking and comparison to 529 plans.",
  alternates: {
    canonical: "https://toolpile.app/tools/trump-account-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
