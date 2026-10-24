import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Contrast Checker - Free Online Tool",
  description: "Check WCAG color contrast ratios between text and background colors. Verify AA and AAA accessibility compliance.",
  alternates: {
    canonical: "https://toolpile.app/tools/color-contrast-checker",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
