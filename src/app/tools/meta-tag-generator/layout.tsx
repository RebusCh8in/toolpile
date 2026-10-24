import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meta Tag Generator - Free Online Tool",
  description: "Generate HTML meta tags for SEO, Open Graph, and Twitter Cards. Preview how your page appears in Google, Facebook, and Twitter.",
  alternates: {
    canonical: "https://toolpile.app/tools/meta-tag-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
