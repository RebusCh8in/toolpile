import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - ToolPile",
  description: "Terms of service for ToolPile free online developer and design tools.",
};

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-8 text-sm text-zinc-500">
        <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
        <span className="mx-2 text-zinc-600">/</span>
        <span className="text-zinc-300">Terms of Service</span>
      </nav>

      <h1 className="mb-6 font-display text-4xl text-zinc-100">Terms of Service</h1>
      <p className="mb-8 text-sm text-zinc-500">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <div className="prose-custom space-y-6">
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using ToolPile (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
        </p>

        <h2>Description of Service</h2>
        <p>
          ToolPile provides a collection of free, browser-based developer and design tools. All tools run locally in your web browser. We do not process, store, or transmit your data to any server.
        </p>

        <h2>Use of the Service</h2>
        <p>You agree to use ToolPile only for lawful purposes. You may not:</p>
        <ul>
          <li>Use the tools to process content that you do not have the right to modify</li>
          <li>Attempt to disrupt or overload the Service</li>
          <li>Scrape, crawl, or otherwise extract data from the Service for commercial purposes without permission</li>
          <li>Use the Service in any way that violates applicable laws or regulations</li>
        </ul>

        <h2>Intellectual Property</h2>
        <p>
          The content you create or modify using ToolPile remains yours. We make no claim to any files, images, videos, text, or other content you process through our tools. The ToolPile website, branding, and tool source code are our intellectual property.
        </p>

        <h2>Disclaimer of Warranties</h2>
        <p>
          ToolPile is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that the tools will produce specific results, be error-free, or be available at all times.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, ToolPile and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. This includes but is not limited to loss of data, loss of profits, or damage to your device.
        </p>

        <h2>Watermark Removal Disclaimer</h2>
        <p>
          Our watermark removal tools are provided for legitimate use cases such as removing your own watermarks, cleaning up personal photos, or processing content you own or have permission to modify. <strong>You are solely responsible for ensuring you have the right to modify any content you process.</strong> We do not encourage or condone copyright infringement.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about these terms, you can reach us through the contact information on our website.
        </p>
      </div>
    </div>
  );
}
