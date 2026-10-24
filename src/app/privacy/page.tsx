import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - ToolPile",
  description: "Privacy policy for ToolPile. Learn how we handle your data, cookies, and third-party advertising.",
  alternates: { canonical: "https://toolpile.app/privacy" },
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
      <p className="mb-8 text-sm text-zinc-500">Last updated: March 12, 2026</p>

      <div className="prose-custom space-y-6">
        <h2>The Short Version</h2>
        <p>
          ToolPile (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a collection of free browser-based tools operated by C.D. Wayne. <strong>We do not collect, store, or transmit your personal data through our tools.</strong> All tools run entirely in your browser. Your files, text, images, and videos never leave your device.
        </p>
        <p>
          However, this site does use third-party services for analytics and advertising that may collect certain information as described below.
        </p>

        <h2>Information We Collect</h2>

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

        <h3>Automatically Collected Information</h3>
        <p>
          When you visit ToolPile, our third-party analytics and advertising partners may automatically collect certain information, including:
        </p>
        <ul>
          <li>IP address (anonymized where possible)</li>
          <li>Browser type and version</li>
          <li>Operating system and device type</li>
          <li>Pages visited and time spent on each page</li>
          <li>Referral source (how you found us)</li>
          <li>General geographic location (country/region level)</li>
          <li>Screen resolution and language preference</li>
        </ul>
        <p>This information is collected through cookies and similar technologies as described below.</p>

        <h2>Google AdSense and Advertising</h2>
        <p>
          We use Google AdSense to display advertisements on this site. Google AdSense is a third-party advertising service provided by Google LLC.
        </p>
        <p>
          Google, as a third-party vendor, uses cookies to serve ads on ToolPile. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites on the Internet. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to ToolPile and/or other sites on the Internet.
        </p>
        <p>You may opt out of personalized advertising by visiting:</p>
        <ul>
          <li><a href="https://myadcenter.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google My Ad Center</a> — to manage your Google ad preferences</li>
          <li><a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Network Advertising Initiative (NAI) Opt-Out</a> — to opt out of interest-based advertising from NAI member companies</li>
          <li><a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Digital Advertising Alliance (DAA) Opt-Out</a> — to opt out of targeted advertising from DAA participating companies</li>
        </ul>
        <p>
          For more information about how Google collects and uses data, please visit <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google&apos;s Privacy Policy</a> and <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">How Google Uses Information from Sites That Use Our Services</a>.
        </p>

        <h2>Google Analytics</h2>
        <p>
          We use Google Analytics to understand how visitors use our site. Google Analytics collects information such as how often users visit the site, what pages they visit, and what other sites they visited prior to coming to ToolPile.
        </p>
        <p>
          Google Analytics collects only the IP address assigned to you on the date you visit this site, rather than your name or other identifying information. We do not combine the information collected through Google Analytics with personally identifiable information.
        </p>
        <p>
          Google&apos;s ability to use and share information collected by Google Analytics about your visits to this site is restricted by the <a href="https://marketingplatform.google.com/about/analytics/terms/us/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Analytics Terms of Service</a> and the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Privacy Policy</a>.
        </p>
        <p>
          You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Analytics Opt-Out Browser Add-On</a>.
        </p>

        <h2>Cookies</h2>
        <p>
          Cookies are small text files stored on your device by your web browser. ToolPile and its third-party partners use cookies for the following purposes:
        </p>
        <ul>
          <li><strong>Advertising cookies (Google AdSense):</strong> Used by Google and its advertising partners to serve relevant ads and measure ad performance. These include the DoubleClick DART cookie and other advertising cookies (such as NID, IDE, and ANID).</li>
          <li><strong>Analytics cookies (Google Analytics):</strong> Used to collect anonymous statistics about site usage, including pages visited, session duration, and traffic sources. These include cookies such as _ga, _gid, and _gat.</li>
        </ul>
        <p>
          Our tools themselves do not require cookies to function. You can control or delete cookies through your browser settings. Note that disabling cookies may affect the display of advertisements but will not impact the functionality of any tool on this site.
        </p>
        <p>
          Most web browsers allow you to manage cookie preferences. You can set your browser to refuse cookies or to alert you when cookies are being sent. Refer to your browser&apos;s help section for instructions on how to manage cookies.
        </p>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services, each governed by their own privacy policies:</p>
        <ul>
          <li><strong>Google AdSense</strong> (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>) — for displaying advertisements</li>
          <li><strong>Google Analytics</strong> (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>) — for anonymous usage statistics</li>
          <li><strong>Netlify</strong> (<a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>) — for website hosting</li>
          <li><strong>CDN providers</strong> — for loading open-source libraries (e.g., FFmpeg WASM, Tesseract.js)</li>
        </ul>
        <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties listed above who assist us in operating our website, so long as those parties agree to keep this information confidential.</p>

        <h2>Data Retention</h2>
        <p>
          Because ToolPile tools process everything locally in your browser, we do not retain any user-submitted data (files, text, images, videos). Once you close your browser tab, all data processed by our tools is gone.
        </p>
        <p>
          Analytics and advertising data collected by Google Analytics and Google AdSense is retained according to Google&apos;s data retention policies. Google Analytics data retention is set to either 2 or 14 months depending on configuration, after which it is automatically deleted.
        </p>

        <h2>Your Rights (GDPR / CCPA)</h2>
        <p>
          Depending on your location, you may have certain rights regarding your personal information:
        </p>
        <h3>For European Economic Area (EEA) Residents (GDPR)</h3>
        <ul>
          <li><strong>Right to access:</strong> You can request a copy of the data we hold about you.</li>
          <li><strong>Right to rectification:</strong> You can request correction of inaccurate data.</li>
          <li><strong>Right to erasure:</strong> You can request deletion of your data.</li>
          <li><strong>Right to restrict processing:</strong> You can request that we limit how we use your data.</li>
          <li><strong>Right to data portability:</strong> You can request your data in a machine-readable format.</li>
          <li><strong>Right to object:</strong> You can object to our processing of your data.</li>
        </ul>

        <h3>For California Residents (CCPA)</h3>
        <ul>
          <li><strong>Right to know:</strong> You can request what personal information we collect, use, and disclose.</li>
          <li><strong>Right to delete:</strong> You can request deletion of your personal information.</li>
          <li><strong>Right to opt out:</strong> You can opt out of the sale of your personal information. Note: We do not sell personal information.</li>
          <li><strong>Right to non-discrimination:</strong> We will not discriminate against you for exercising your privacy rights.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at <a href="mailto:hello@toolpile.app" className="text-blue-400 hover:underline">hello@toolpile.app</a>. Since our tools do not collect personal data, most of these rights pertain to data collected by third-party services (Google Analytics and Google AdSense), which can be managed through the opt-out links provided above.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          ToolPile is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:hello@toolpile.app" className="text-blue-400 hover:underline">hello@toolpile.app</a> and we will take steps to remove that information.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. When we make changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page. We encourage you to review this policy periodically to stay informed about how we are protecting your information.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this privacy policy or our data practices, you can reach us at:
        </p>
        <ul>
          <li>Email: <a href="mailto:hello@toolpile.app" className="text-blue-400 hover:underline">hello@toolpile.app</a></li>
          <li>Contact page: <Link href="/contact" className="text-blue-400 hover:underline">toolpile.app/contact</Link></li>
        </ul>
      </div>
    </div>
  );
}
