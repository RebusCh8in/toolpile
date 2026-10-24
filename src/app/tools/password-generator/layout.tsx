import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Generator - Free Online Tool",
  description: "Generate strong, secure passwords with customizable options including length, character types, and bulk generation.",
  alternates: {
    canonical: "https://toolpile.app/tools/password-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
