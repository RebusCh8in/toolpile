import Link from "next/link";
import Script from "next/script";

export interface FAQ {
  question: string;
  answer: string;
}

export interface RelatedTool {
  name: string;
  href: string;
}

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  slug: string;
  children: React.ReactNode;
  guide?: React.ReactNode;
  faqs?: FAQ[];
  relatedTools?: RelatedTool[];
  keywords?: string[];
}

export default function ToolLayout({
  title,
  description,
  category,
  slug,
  children,
  guide,
  faqs,
  relatedTools,
  keywords,
}: ToolLayoutProps) {
  const url = `https://toolpile.app/tools/${slug}`;

  // SoftwareApplication schema
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description,
    url,
    applicationCategory: "BrowserApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: undefined as undefined | object,
  };

  // FAQ schema
  const faqSchema = faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://toolpile.app" },
      { "@type": "ListItem", position: 2, name: category, item: `https://toolpile.app/#${category.toLowerCase()}` },
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };

  return (
    <>
      {/* Structured data */}
      <Script
        id={`schema-app-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      {faqSchema && (
        <Script
          id={`schema-faq-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Script
        id={`schema-breadcrumb-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Home
          </Link>
          <span className="mx-2 text-zinc-600">/</span>
          <span className="text-zinc-500">{category}</span>
          <span className="mx-2 text-zinc-600">/</span>
          <span className="text-zinc-300">{title}</span>
        </nav>

        {/* Header */}
        <h1 className="mb-2 font-display text-4xl text-zinc-100">{title}</h1>
        <p className="mb-8 text-zinc-400 text-lg leading-relaxed max-w-2xl">{description}</p>

        {/* Tool */}
        <div className="mb-12">{children}</div>

        {/* Guide content */}
        {guide && (
          <article className="mb-12 prose-custom">
            {guide}
          </article>
        )}

        {/* FAQ section */}
        {faqs && faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl text-zinc-100 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-zinc-900 border border-zinc-800 rounded-xl"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-zinc-200 font-medium text-sm select-none">
                    {faq.question}
                    <span className="ml-4 text-zinc-500 group-open:rotate-45 transition-transform text-lg">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related tools */}
        {relatedTools && relatedTools.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-xl text-zinc-100 mb-4">Related Tools</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO keyword footer — hidden visually but indexable */}
        {keywords && (
          <footer className="mt-8 text-xs text-zinc-600 leading-relaxed">
            <p>
              {title} — free online {keywords.join(", ")}. No signup required. Works in your browser.
            </p>
          </footer>
        )}
      </div>
    </>
  );
}
