import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder - Free Online Tool",
  description: "Build a professional resume for free. Multiple templates, live preview, and PDF download. No signup, no data stored — runs entirely in your browser.",
  alternates: { canonical: "https://toolpile.app/tools/resume-builder" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
