import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ToolLayout from "@/components/ToolLayout";
import { getToolContent } from "@/lib/toolContent";
import TipCalculator from "./TipCalculator";

const SLUG = "tip-calculator";

export function generateMetadata(): Metadata {
  const c = getToolContent(SLUG);
  return {
    // distinct <title> per tool (from frontmatter) — root layout appends " | ToolPile"
    title: c.seoTitle,
    description: c.description,
    keywords: c.keywords,
    alternates: { canonical: `https://toolpile.app/tools/${SLUG}` },
  };
}

export default function Page() {
  const c = getToolContent(SLUG);
  return (
    <ToolLayout
      title={c.title}
      description={c.description}
      slug={SLUG}
      category={c.category}
      keywords={c.keywords}
      faqs={c.faqs}
      relatedTools={c.relatedTools}
      guide={<ReactMarkdown remarkPlugins={[remarkGfm]}>{c.body}</ReactMarkdown>}
    >
      <TipCalculator />
    </ToolLayout>
  );
}
