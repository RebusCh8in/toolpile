import Link from "next/link";

export interface BlogPost {
  title: string;
  slug: string;
  description: string;
  datePublished: string;
  dateModified: string;
  tags: string[];
  faqs: { question: string; answer: string }[];
  relatedTools: { name: string; href: string }[];
  relatedArticles?: { title: string; href: string }[];
}

function ArticleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `https://toolpile.app/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { "@type": "Person", name: "C.D. Wayne", url: "https://toolpile.app/about" },
    publisher: { "@type": "Organization", name: "ToolPile", url: "https://toolpile.app" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://toolpile.app/blog/${post.slug}` },
    keywords: post.tags.join(", "),
  };
}

function BreadcrumbSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://toolpile.app" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://toolpile.app/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://toolpile.app/blog/${post.slug}` },
    ],
  };
}

function FAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function ToolCTA({ name, href, description }: { name: string; href: string; description: string }) {
  return (
    <aside aria-label={`Try ${name}`} className="my-8 bg-blue-600/10 border border-blue-500/20 rounded-xl p-6 not-prose">
      <h3 className="!text-lg !font-semibold !text-blue-400 !mb-1 !mt-0">Try It Yourself</h3>
      <p className="!text-sm !text-zinc-400 !mb-3">{description}</p>
      <Link href={href} className="inline-block bg-blue-600 hover:bg-blue-500 !text-white !no-underline rounded-lg px-5 py-2 text-sm font-medium transition-colors">
        Open {name} &rarr;
      </Link>
    </aside>
  );
}

export default function BlogLayout({
  post,
  children,
}: {
  post: BlogPost;
  children: React.ReactNode;
}) {
  const schemas = [
    ArticleSchema(post),
    BreadcrumbSchema(post),
    ...(post.faqs.length > 0 ? [FAQSchema(post.faqs)] : []),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-zinc-500">
          <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
          <span className="mx-2 text-zinc-600">/</span>
          <Link href="/blog" className="hover:text-blue-500 transition-colors">Blog</Link>
          <span className="mx-2 text-zinc-600">/</span>
          <span className="text-zinc-300">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="font-display text-4xl sm:text-5xl text-zinc-100 mb-4 leading-tight">{post.title}</h1>
          <p className="text-lg text-zinc-400 mb-4">{post.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <Link href="/about" className="text-zinc-300 hover:text-blue-400 transition-colors font-medium" rel="author">C.D. Wayne</Link>
            <span className="text-zinc-700">|</span>
            <time dateTime={post.datePublished}>
              {new Date(post.datePublished).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </time>
            {post.dateModified !== post.datePublished && (
              <>
                <span className="text-zinc-700">|</span>
                <span>Updated: <time dateTime={post.dateModified}>{new Date(post.dateModified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span key={tag} className="bg-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </header>

        {/* Article body */}
        <div className="prose-custom space-y-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-zinc-300 [&_p]:leading-relaxed [&_ul]:text-zinc-300 [&_ol]:text-zinc-300 [&_li]:mb-2 [&_strong]:text-zinc-100 [&_a]:text-blue-400 [&_a:hover]:text-blue-300 [&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-blue-300 [&_table]:w-full [&_th]:text-left [&_th]:px-4 [&_th]:py-2 [&_th]:text-zinc-400 [&_th]:border-b [&_th]:border-zinc-800 [&_td]:px-4 [&_td]:py-2 [&_td]:text-zinc-300 [&_td]:border-b [&_td]:border-zinc-800">
          {children}
        </div>

        {/* FAQ section */}
        {post.faqs.length > 0 && (
          <section id="faq" className="mt-16">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {post.faqs.map((faq, i) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold text-zinc-200 mb-2">{faq.question}</h3>
                  <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related tools */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            {post.relatedTools.map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 hover:border-blue-400/40 hover:text-blue-400 transition-all"
              >
                {tool.name} &rarr;
              </Link>
            ))}
          </div>
        </section>

        {/* Related articles */}
        {post.relatedArticles && post.relatedArticles.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">Related Articles</h2>
            <div className="space-y-2">
              {post.relatedArticles.map(article => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="block bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 hover:border-blue-400/40 hover:text-blue-400 transition-all"
                >
                  {article.title} &rarr;
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
