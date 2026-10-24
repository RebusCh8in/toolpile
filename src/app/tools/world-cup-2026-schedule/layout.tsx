import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 Schedule & Time Zone Converter | Toolpile",
  description:
    "Complete 2026 FIFA World Cup schedule with all 48 teams, 12 groups, 16 venues across USA, Mexico & Canada. Convert match times to your local time zone instantly.",
  alternates: {
    canonical: "https://toolpile.app/tools/world-cup-2026-schedule",
  },
  openGraph: {
    title: "FIFA World Cup 2026 Schedule & Time Zone Converter",
    description:
      "All 48 teams, 12 groups, 104 matches, 16 venues. Find every World Cup 2026 match time in your local time zone.",
    url: "https://toolpile.app/tools/world-cup-2026-schedule",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
