import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us - ToolPile",
  description: "Get in touch with the ToolPile team. Report bugs, suggest features, or ask questions.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-8 text-sm text-zinc-500">
        <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
        <span className="mx-2 text-zinc-600">/</span>
        <span className="text-zinc-300">Contact Us</span>
      </nav>

      <h1 className="mb-6 font-display text-4xl text-zinc-100">Contact Us</h1>

      <div className="prose-custom space-y-6">
        <p>
          We'd love to hear from you. Whether you've found a bug, have a feature suggestion, or just want to say hi — reach out using any of the methods below.
        </p>

        <h2>Email</h2>
        <p>
          For general inquiries, bug reports, or feature requests:
        </p>
        <p>
          <a href="mailto:hello@toolpile.app" className="text-blue-400 hover:text-blue-300 font-medium">hello@toolpile.app</a>
        </p>

        <h2>Bug Reports &amp; Feature Requests</h2>
        <p>
          Found something broken? Have an idea for a new tool? We appreciate detailed reports that help us improve. When reporting a bug, please include:
        </p>
        <ul>
          <li>Which tool you were using</li>
          <li>What you expected to happen</li>
          <li>What actually happened</li>
          <li>Your browser and device (e.g., Chrome on Windows, Safari on iPhone)</li>
        </ul>

        <h2>Advertising</h2>
        <p>
          For advertising inquiries, please email <a href="mailto:hello@toolpile.app" className="text-blue-400 hover:text-blue-300">hello@toolpile.app</a> with the subject line "Advertising."
        </p>

        <h2>Response Time</h2>
        <p>
          We're a small team and aim to respond to all messages within 48 hours. Bug reports affecting tool functionality are prioritized.
        </p>
      </div>
    </div>
  );
}
