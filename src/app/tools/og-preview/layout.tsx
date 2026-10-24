import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Graph Preview - Free Online Tool",
  description: "Preview how your page looks when shared on Google, Facebook, Twitter, LinkedIn, Slack, and Discord. Check OG tags before publishing.",
  alternates: {
    canonical: "https://toolpile.app/tools/og-preview",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
