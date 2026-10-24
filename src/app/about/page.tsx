import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ToolPile - Free Browser-Based Tools",
  description: "ToolPile is a collection of 180+ free browser-based tools for developers, designers, and everyday users. No signup, no data stored, ever.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-8 text-sm text-zinc-500">
        <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
        <span className="mx-2 text-zinc-600">/</span>
        <span className="text-zinc-300">About Us</span>
      </nav>

      <h1 className="mb-6 font-display text-4xl text-zinc-100">About ToolPile</h1>

      <div className="prose-custom space-y-6">
        <h2>Who&apos;s Behind ToolPile?</h2>
        <p>
          ToolPile is built and maintained by C.D. Wayne, a writer, researcher, and builder passionate about marketing, health, and personal finance. Every tool on this site is designed to solve a real problem — fast, free, and without compromising your privacy.
        </p>

        <h2>What is ToolPile?</h2>
        <p>
          ToolPile is a collection of free, browser-based tools for developers, designers, and everyday users. Every tool runs entirely in your browser — your files, images, and text never leave your device.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe useful tools should be free, private, and instant. No signups, no uploads to servers, no hidden fees. Just open a tool and use it.
        </p>
        <p>
          Too many "free" tool sites upload your data to their servers, require accounts, or paywall basic features. ToolPile is different — everything runs client-side using modern browser APIs. Your data stays on your device, period.
        </p>

        <h2>How We Make Money</h2>
        <p>
          ToolPile is supported by non-intrusive advertising through Google AdSense. This allows us to keep every tool completely free with no premium tiers or feature gates. We will never sell user data because we don't collect any.
        </p>

        <h2>What We Offer</h2>
        <ul>
          <li><strong>Image Tools</strong> — compress, resize, convert, remove backgrounds, pick colors, upscale, and remove watermarks</li>
          <li><strong>PDF Tools</strong> — merge, split, compress PDFs and convert images to PDF</li>
          <li><strong>Finance Calculators</strong> — mortgage, compound interest, tax, retirement, investment, loan, insurance, and budgeting calculators</li>
          <li><strong>Health Calculators</strong> — BMI, TDEE, calorie, macro, body fat, sleep, and fitness calculators</li>
          <li><strong>Developer Tools</strong> — JSON formatter, regex tester, diff checker, minifiers, hash generators, JWT decoder, and more</li>
          <li><strong>CSS Generators</strong> — gradients, shadows, glassmorphism, clip paths, loaders, and blob shapes</li>
          <li><strong>Text Tools</strong> — word counter, case converter, fancy text generator, lorem ipsum, and markdown preview</li>
          <li><strong>Converters</strong> — 20+ image format conversions, URL encoding, base64, timestamps, and unit conversion</li>
          <li><strong>Utilities</strong> — QR codes, passwords, favicons, resume builder, cron expressions, and more</li>
        </ul>

        <h2>Privacy First</h2>
        <p>
          Every tool processes your data locally in your browser. We use no server-side processing, no file uploads, and no user tracking beyond anonymous analytics. Read our full <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link> for details.
        </p>

        <h2>Contact</h2>
        <p>
          Have a question, suggestion, or found a bug? Reach out on our <Link href="/contact" className="text-blue-400 hover:text-blue-300">Contact page</Link>.
        </p>
      </div>
    </div>
  );
}
