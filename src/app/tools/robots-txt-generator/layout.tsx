import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robots.txt Generator - Free Online Tool",
  description: "Generate a robots.txt file for your website. Control search engine and AI bot access with an easy visual builder.",
  alternates: {
    canonical: "https://toolpile.app/tools/robots-txt-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
