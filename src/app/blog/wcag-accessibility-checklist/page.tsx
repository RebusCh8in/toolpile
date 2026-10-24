import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How to Make Your Website WCAG Accessible: A Practical Checklist",
  slug: "wcag-accessibility-checklist",
  description: "A practical checklist for meeting WCAG 2.2 AA standards. Covers color contrast, alt text, keyboard navigation, and free testing tools.",
  datePublished: "2026-03-02",
  dateModified: "2026-03-02",
  tags: ["Accessibility", "WCAG", "Web Development", "Color Contrast"],
  faqs: [
    { question: "What is WCAG?", answer: "WCAG (Web Content Accessibility Guidelines) is a set of international standards for making web content accessible to people with disabilities. WCAG 2.2 is the current version, published by the W3C. Most legal requirements reference WCAG 2.1 AA as the minimum standard." },
    { question: "Is WCAG compliance legally required?", answer: "In many countries, yes. In the US, the ADA has been interpreted by courts to apply to websites. The EU's European Accessibility Act requires compliance by June 2025. Many government, education, and e-commerce sites face legal requirements or risk lawsuits." },
    { question: "What is the minimum color contrast ratio?", answer: "WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text (under 18pt) and 3:1 for large text (18pt+ or 14pt+ bold). WCAG AAA requires 7:1 for normal text and 4.5:1 for large text." },
    { question: "How do I test my website for accessibility?", answer: "Use a combination of automated tools (Lighthouse, axe DevTools, WAVE) and manual testing (keyboard navigation, screen reader testing). No automated tool catches all issues — manual testing is essential for things like logical reading order and meaningful alt text." },
    { question: "What are the most common accessibility failures?", answer: "The most common WCAG failures are: low color contrast (86% of homepages), missing alt text on images (58%), missing form labels (54%), empty links (49%), and missing document language (28%), according to the WebAIM Million report." },
  ],
  relatedTools: [
    { name: "Color Contrast Checker", href: "/tools/color-contrast-checker" },
    { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
    { name: "Color Shades Generator", href: "/tools/color-shades-generator" },
  ],
  relatedArticles: [
    { title: "How to Optimize Images for Shopify", href: "/blog/optimize-images-shopify" },
    { title: "How to Convert HEIC to JPG on Any Device", href: "/blog/convert-heic-to-jpg" },
  ],
};

export const metadata: Metadata = {
  title: `${post.title} — ToolPile`,
  description: post.description,
  alternates: { canonical: `https://toolpile.app/blog/${post.slug}` },
  openGraph: { title: post.title, description: post.description, url: `https://toolpile.app/blog/${post.slug}`, siteName: "ToolPile", type: "article", publishedTime: post.datePublished, modifiedTime: post.dateModified, tags: post.tags },
  twitter: { card: "summary_large_image", title: post.title, description: post.description },
};

export default function Page() {
  return (
    <BlogLayout post={post}>
      <aside aria-label="Summary" className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-8">
        <p><strong>TL;DR:</strong> The most common accessibility failures are low color contrast (86% of sites), missing alt text, and missing form labels. Start by checking your color contrast ratios against WCAG AA standards (4.5:1 for normal text), add alt text to every meaningful image, and ensure all forms have visible labels. These three fixes alone address the majority of accessibility issues.</p>
      </aside>

      <nav aria-label="Table of contents" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">Table of Contents</h2>
        <ol className="space-y-1.5 text-sm">
          <li><Link href="#what-is-wcag" className="text-blue-400 hover:text-blue-300">What Is WCAG?</Link></li>
          <li><Link href="#color-contrast" className="text-blue-400 hover:text-blue-300">Color Contrast Requirements</Link></li>
          <li><Link href="#images-alt-text" className="text-blue-400 hover:text-blue-300">Images and Alt Text</Link></li>
          <li><Link href="#keyboard" className="text-blue-400 hover:text-blue-300">Keyboard Navigation</Link></li>
          <li><Link href="#forms" className="text-blue-400 hover:text-blue-300">Accessible Forms</Link></li>
          <li><Link href="#checklist" className="text-blue-400 hover:text-blue-300">Quick Checklist</Link></li>
          <li><Link href="#key-takeaways" className="text-blue-400 hover:text-blue-300">Key Takeaways</Link></li>
          <li><Link href="#faq" className="text-blue-400 hover:text-blue-300">FAQ</Link></li>
        </ol>
      </nav>

      <section id="what-is-wcag">
        <h2>What Is WCAG?</h2>
        <p>
          <strong>WCAG (Web Content Accessibility Guidelines) is the international standard for web accessibility.</strong> Published by the W3C, it defines how to make web content usable by people with visual, auditory, motor, and cognitive disabilities.
        </p>
        <p>
          WCAG has three conformance levels: A (minimum), AA (standard), and AAA (enhanced). Most legal requirements and industry standards reference WCAG 2.1 AA as the target. The latest version, WCAG 2.2, was published in October 2023 and adds criteria for mobile and cognitive accessibility.
        </p>
        <p>
          According to the WebAIM Million study, 96.3% of the top million homepages have detectable WCAG failures. The most common issues are surprisingly simple to fix — starting with color contrast.
        </p>
      </section>

      <section id="color-contrast">
        <h2>Color Contrast Requirements</h2>
        <p>
          <strong>Low color contrast is the #1 accessibility failure, affecting 86% of homepages.</strong> WCAG defines minimum contrast ratios between text and its background to ensure readability.
        </p>
        <table>
          <thead>
            <tr><th>WCAG Level</th><th>Normal Text</th><th>Large Text (18pt+)</th><th>UI Components</th></tr>
          </thead>
          <tbody>
            <tr><td>AA</td><td>4.5:1</td><td>3:1</td><td>3:1</td></tr>
            <tr><td>AAA</td><td>7:1</td><td>4.5:1</td><td>4.5:1</td></tr>
          </tbody>
        </table>
        <p>
          Common offenders include light gray text on white backgrounds, placeholder text in form fields, and disabled button states. These all need to meet the minimum 4.5:1 ratio for normal-sized text.
        </p>
      </section>

      <ToolCTA
        name="Color Contrast Checker"
        href="/tools/color-contrast-checker"
        description="Check any foreground/background color combination against WCAG AA and AAA standards. See your contrast ratio instantly with pass/fail indicators for normal text, large text, and UI components."
      />

      <section id="images-alt-text">
        <h2>Images and Alt Text</h2>
        <p>
          <strong>Every meaningful image must have descriptive alt text.</strong> Screen readers announce alt text to visually impaired users. Search engines also use it to understand image content.
        </p>
        <h3>Alt Text Guidelines</h3>
        <ul>
          <li><strong>Be specific:</strong> &quot;Red Nike running shoes, side view&quot; not &quot;shoes&quot;</li>
          <li><strong>Be concise:</strong> Under 125 characters. Don&apos;t start with &quot;Image of&quot; or &quot;Picture of&quot;</li>
          <li><strong>Describe function:</strong> For linked images, describe where the link goes, not the image</li>
          <li><strong>Decorative images:</strong> Use empty alt (<code>alt=&quot;&quot;</code>) for purely decorative images so screen readers skip them</li>
          <li><strong>Complex images:</strong> Charts and infographics need longer descriptions via <code>aria-describedby</code> or adjacent text</li>
        </ul>
      </section>

      <section id="keyboard">
        <h2>Keyboard Navigation</h2>
        <p>
          <strong>Every interactive element must be operable with a keyboard alone.</strong> Many users with motor disabilities cannot use a mouse. Others prefer keyboard navigation for speed.
        </p>
        <ul>
          <li><strong>Tab order:</strong> Tab key must move through interactive elements in a logical order</li>
          <li><strong>Focus indicators:</strong> Every focused element must have a visible outline or highlight</li>
          <li><strong>No keyboard traps:</strong> Users must be able to tab away from any element</li>
          <li><strong>Skip links:</strong> Provide a &quot;Skip to main content&quot; link at the top of each page</li>
          <li><strong>Custom components:</strong> Modals, dropdowns, and accordions need proper ARIA roles and keyboard handlers</li>
        </ul>
      </section>

      <section id="forms">
        <h2>Accessible Forms</h2>
        <p>
          <strong>Missing form labels are the third most common accessibility failure, affecting 54% of homepages.</strong> Every form input needs a programmatically associated label.
        </p>
        <ul>
          <li>Use <code>&lt;label for=&quot;id&quot;&gt;</code> elements for every input</li>
          <li>Mark required fields with both visual indicators and <code>aria-required=&quot;true&quot;</code></li>
          <li>Display error messages inline near the field, not just at the top of the form</li>
          <li>Use <code>aria-describedby</code> to associate error messages with their fields</li>
          <li>Don&apos;t rely on placeholder text as the only label — it disappears on focus</li>
        </ul>
      </section>

      <section id="checklist">
        <h2>Quick WCAG AA Checklist</h2>
        <ol>
          <li>All text has at least 4.5:1 contrast ratio (3:1 for large text)</li>
          <li>All meaningful images have descriptive alt text</li>
          <li>All form inputs have associated labels</li>
          <li>All interactive elements are keyboard accessible</li>
          <li>Focus indicators are visible on all interactive elements</li>
          <li>Page has a logical heading hierarchy (h1 &rarr; h2 &rarr; h3)</li>
          <li>Page language is declared (<code>&lt;html lang=&quot;en&quot;&gt;</code>)</li>
          <li>Links have descriptive text (not &quot;click here&quot;)</li>
          <li>Videos have captions</li>
          <li>Content is readable at 200% zoom</li>
        </ol>
      </section>

      <section id="key-takeaways">
        <h2>Key Takeaways</h2>
        <ul>
          <li>96% of top websites fail basic accessibility checks — fixing the fundamentals puts you ahead</li>
          <li>Color contrast, alt text, and form labels are the three most common failures and the easiest to fix</li>
          <li>WCAG AA (4.5:1 contrast for normal text) is the standard most legal requirements reference</li>
          <li>Test with both automated tools and manual keyboard navigation</li>
          <li>Accessibility improves SEO, conversion rates, and legal compliance simultaneously</li>
        </ul>
      </section>
    </BlogLayout>
  );
}
