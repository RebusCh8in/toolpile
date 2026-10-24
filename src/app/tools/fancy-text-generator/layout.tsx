import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fancy Text Generator - Free Online Tool",
  description: "Convert text into stylish Unicode fonts for Instagram, TikTok, Twitter, and more. Just type, click to copy, and paste anywhere.",
  alternates: {
    canonical: "https://toolpile.app/tools/fancy-text-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
