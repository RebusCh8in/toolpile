import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter - Free Online Tool",
  description: "Convert Unix timestamps to human-readable dates and vice versa. Live current timestamp display. Free online tool.",
  alternates: {
    canonical: "https://toolpile.app/tools/timestamp-converter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
