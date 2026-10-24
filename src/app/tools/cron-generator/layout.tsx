import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Generator - Free Online Tool",
  description: "Build and understand cron expressions with a visual editor. See human-readable descriptions and next run times. Free online tool.",
  alternates: {
    canonical: "https://toolpile.app/tools/cron-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
