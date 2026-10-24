import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Code Text Formatter - Clean Terminal Output",
  description: "Paste messy text from your terminal or Claude Code and get clean, plain output. Strips ANSI color codes, line-number gutters, and invisible control characters. Free, runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/claude-code-text-formatter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
