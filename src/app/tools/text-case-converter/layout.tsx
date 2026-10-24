import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Case Converter - Free Online Tool",
  description: "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and more. Free and instant.",
  alternates: {
    canonical: "https://toolpile.app/tools/text-case-converter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
