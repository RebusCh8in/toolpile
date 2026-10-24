import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Remover - Free Online Tool",
  description: "Remove image backgrounds with AI or by color. 100% free, no upload to any server. Runs entirely in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/background-remover",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
