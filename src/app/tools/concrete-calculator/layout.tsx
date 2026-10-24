import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concrete Calculator - Free Online Tool",
  description: "Calculate how much concrete you need for slabs, columns, walls, and stairs. Get cubic yards, bags needed, waste factors, and cost estimates for any project.",
  alternates: {
    canonical: "https://toolpile.app/tools/concrete-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
