import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Slug Generator - Free Online Tool",
  description: "Convert text to URL-friendly slugs. Handles accented characters, special characters, and bulk conversion. Free SEO tool.",
  alternates: {
    canonical: "https://toolpile.app/tools/url-slug-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
