import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Minifier - Free Online Tool",
  description: "Minify CSS code online for free. Remove whitespace and comments to reduce file size. No upload — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-minifier",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
