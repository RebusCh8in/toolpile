import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to Speech - Free Online Tool",
  description: "Convert text to natural speech in your browser. Multiple languages and voices, adjustable speed and pitch. Free and private.",
  alternates: {
    canonical: "https://toolpile.app/tools/text-to-speech",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
