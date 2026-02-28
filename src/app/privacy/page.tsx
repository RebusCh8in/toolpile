import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - ToolPile",
  description: "Privacy policy for ToolPile. Learn how we handle your data (spoiler: we don't collect any).",
};

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-8 text-sm text-zinc-500">
        <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
        <span className="mx-2 text-zinc-600">/</span>
        <span className="text-zinc-300">Privacy Policy</span>
      </nav>

      <h1 className="mb-6 font-display text-4xl text-zinc-100">Privacy Policy</h1>
      <p className="mb-8 text-sm text-zinc-500">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <div className="prose-custom space-y-6">
        <h2>The Short Version</h2>
        <p>
          ToolPile is a collection of free browser-based tools. <strong>We do not collect, store, or transmit your personal data.</strong> All tools run entirely in your browser. Your files, text, images, and videos never leave your device.
        </p>

        <h2>What Data We Collect</h2>
        <h3>Analytics</h3>
        <p>
          We may use privacy-friendly analytics (such as Google Analytics or a similar service) to understand how visitors use our site. This data is aggregated and anonymous — we cannot identify individual users. Analytics may collect:
        </p>
        <ul>
          <li>Pages visited and time spent</li>
          <li>Referral source (how you found us)</li>
          <li>General location (country/region level)</li>
          <li>Browser type and device category</li>
        </ul>

        <h3>Advertising</h3>
        <p>
          We may display advertisements through Google AdSense or similar networks. These services may use cookies to serve ads based on your browsing history. You can opt out of personalized advertising at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
        </p>

        <h3>Your Files and Input</h3>
        <p>
          All tools on ToolPile process data <strong>locally in your browser</strong>. When you upload an image, video, or enter text into any tool:
        </p>
        <ul>
          <li>The data stays on your device</li>
          <li>Nothing is uploaded to our servers</li>
          <li>Nothing is stored after you close the tab</li>
          <li>We have no access to your files or input</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We may use cookies for analytics and advertising purposes. You can control cookie behavior through your browser settings. Our tools themselves do not require cookies to function.
        </p>

        <h2>Third-Party Services</h2>
        <p>We may use the following third-party services:</p>
        <ul>
          <li><strong>Google AdSense</strong> — for displaying advertisements</li>
          <li><strong>Google Analytics</strong> — for anonymous usage statistics</li>
          <li><strong>CDN providers</strong> — for loading open-source libraries (e.g., FFmpeg WASM)</li>
        </ul>
        <p>Each of these services has its own privacy policy governing how they handle data.</p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          ToolPile is not directed at children under 13. We do not knowingly collect personal information from children.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Changes will be reflected on this page with an updated date.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this privacy policy, you can reach us through the contact information on our website.
        </p>
      </div>
    </div>
  );
}
