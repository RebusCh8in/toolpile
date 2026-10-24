import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Validator - Free Online Tool",
  description: "Validate JSON syntax with detailed error messages and line numbers. Also prettify and minify valid JSON.",
  alternates: {
    canonical: "https://toolpile.app/tools/json-validator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
