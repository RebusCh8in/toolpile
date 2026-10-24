import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "Small Claims Court Limits, Fees & Rules in Every State (2026 Guide)",
  slug: "small-claims-court-guide",
  description: "Learn the small claims court dollar limits, filing fees, statute of limitations, attorney rules, and appeal procedures for all 50 states. Find out if your case qualifies.",
  datePublished: "2026-03-30",
  dateModified: "2026-03-30",
  tags: ["Small Claims Court", "Small Claims Limit", "Filing Fees", "Statute of Limitations", "Small Claims by State"],
  faqs: [
    { question: "How much can I sue for in small claims court?", answer: "It depends on your state. Tennessee and Delaware have the highest limit at $25,000. Texas and Utah allow up to $20,000. Kentucky has the lowest at $2,500. California allows $12,500 for individuals but only $6,250 for businesses. Most states fall in the $5,000-$10,000 range." },
    { question: "How much does it cost to file in small claims court?", answer: "Filing fees range from $5-$15 (DC, the cheapest) to $307-$381 (Cook County, Illinois, the most expensive). Most states charge $30-$100. Fees are often recoverable if you win — the judge can order the losing party to reimburse your filing costs." },
    { question: "Can I sue in small claims without a lawyer?", answer: "Yes, and in 13 states (including California, Colorado, Michigan, and Washington) attorneys are actually banned from representing parties in small claims court. The system is designed for self-representation. Even in states that allow lawyers, most people represent themselves." },
    { question: "What is the statute of limitations for small claims?", answer: "It varies by state and claim type. Written contracts range from 3 years (several states) to 15 years (Kentucky). Personal injury claims are typically 1-6 years. Once the statute of limitations expires, your case is barred regardless of its merit. Check your state and claim type using our calculator." },
  ],
  relatedTools: [
    { name: "Small Claims Court Calculator", href: "/tools/small-claims-calculator" },
    { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
    { name: "Invoice Generator", href: "/tools/invoice-generator" },
  ],
  relatedArticles: [
    { title: "How Personal Injury Settlements Are Calculated", href: "/blog/personal-injury-settlement-guide" },
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
      <nav aria-label="Table of contents" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">What We Cover</h2>
        <ol className="space-y-1.5 text-sm">
          <li><Link href="#limits" className="text-blue-400 hover:text-blue-300">1. Dollar Limits by State</Link></li>
          <li><Link href="#fees" className="text-blue-400 hover:text-blue-300">2. Filing Fees</Link></li>
          <li><Link href="#sol" className="text-blue-400 hover:text-blue-300">3. Statute of Limitations</Link></li>
          <li><Link href="#lawyers" className="text-blue-400 hover:text-blue-300">4. Attorney Rules</Link></li>
          <li><Link href="#appeals" className="text-blue-400 hover:text-blue-300">5. Appeals</Link></li>
          <li><Link href="#tips" className="text-blue-400 hover:text-blue-300">6. Tips for Winning</Link></li>
        </ol>
      </nav>

      {/* 1 */}
      <section id="limits" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. Dollar Limits by State</h2>
        <p className="text-zinc-300 mb-4">
          The maximum amount you can sue for in small claims varies dramatically — from $2,500 to $25,000:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-3">Highest Limits</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li><strong>Tennessee:</strong> $25,000</li>
              <li><strong>Delaware:</strong> $25,000</li>
              <li><strong>Texas:</strong> $20,000</li>
              <li><strong>Utah:</strong> $20,000 (→ $25,000 in 2030)</li>
              <li><strong>Georgia:</strong> $15,000</li>
              <li><strong>Minnesota:</strong> $15,000</li>
              <li><strong>North Dakota:</strong> $15,000</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-3">Lowest Limits</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li><strong>Kentucky:</strong> $2,500</li>
              <li><strong>Arizona:</strong> $3,500</li>
              <li><strong>Mississippi:</strong> $3,500</li>
              <li><strong>Nebraska:</strong> $3,900</li>
              <li><strong>Kansas:</strong> $4,000</li>
            </ul>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">Business vs. Individual Limits</h4>
          <p className="text-zinc-300 text-sm">
            California and Washington have lower limits for businesses: CA allows $12,500 for individuals but only $6,250 for corporations/LLCs. Washington allows $10,000 for individuals but $5,000 for businesses.
          </p>
        </div>
      </section>

      <ToolCTA name="Small Claims Court Calculator" href="/tools/small-claims-calculator" description="Check if your claim fits in small claims court for your state — with fees, SOL, and attorney rules." />

      {/* 2 */}
      <section id="fees" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. Filing Fees</h2>
        <p className="text-zinc-300 mb-4">Filing fees vary by state and often by claim amount within each state:</p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">State</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Fee Range</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                { s: "DC", fee: "$5-$15", note: "Cheapest in the nation" },
                { s: "North Dakota", fee: "$10-$50", note: "" },
                { s: "New York", fee: "$15-$25", note: "Plus postage" },
                { s: "California", fee: "$30-$75", note: "Fee waivers available" },
                { s: "New Jersey", fee: "$35", note: "Flat fee" },
                { s: "Texas", fee: "$54-$100", note: "Varies by county" },
                { s: "North Carolina", fee: "$96", note: "Flat fee" },
                { s: "Florida", fee: "$55-$300", note: "Varies by county and amount" },
                { s: "Utah", fee: "$60-$185", note: "" },
                { s: "Illinois (Cook Co.)", fee: "$307-$381", note: "Most expensive in nation" },
              ].map(r => (
                <tr key={r.s} className="border-b border-zinc-800/50">
                  <td className="py-2 font-medium">{r.s}</td>
                  <td className="py-2 text-right">{r.fee}</td>
                  <td className="py-2 text-zinc-400 text-xs">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-zinc-300 text-sm">Filing fees are usually recoverable — if you win, the judge can order the losing party to pay your filing costs.</p>
      </section>

      {/* 3 */}
      <section id="sol" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Statute of Limitations</h2>
        <p className="text-zinc-300 mb-4">
          The statute of limitations is your deadline to file. Miss it and your case is dead regardless of merit.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Written Contracts</h4>
            <p className="text-zinc-300 text-sm"><strong>Shortest:</strong> Alaska, Delaware, DC, Maryland, Mississippi, NH, NC, SC (3 years)</p>
            <p className="text-zinc-300 text-sm"><strong>Longest:</strong> Kentucky (15 years), Illinois, Indiana, Iowa, Louisiana, Missouri, RI, WV, Wyoming (10 years)</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Personal Injury</h4>
            <p className="text-zinc-300 text-sm"><strong>Shortest:</strong> Kentucky, Louisiana, Tennessee (1 year)</p>
            <p className="text-zinc-300 text-sm"><strong>Longest:</strong> Maine, Minnesota, North Dakota (6 years)</p>
          </div>
        </div>
      </section>

      {/* 4 */}
      <section id="lawyers" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Attorney Rules</h2>
        <p className="text-zinc-300 mb-4">
          <strong>13 states</strong> prohibit or restrict attorneys in small claims court:
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-zinc-300 text-sm">
            <strong>No attorneys:</strong> Arizona, California, Colorado, Hawaii, Kansas, Michigan, Minnesota (at trial), Montana, Nebraska, North Dakota, Oregon (without permission), Virginia (plaintiffs), Washington (without permission)
          </p>
          <p className="text-zinc-400 text-xs mt-2">
            In these states, you represent yourself. You can still consult a lawyer outside of court for advice — you just can&apos;t bring one to the hearing.
          </p>
        </div>
        <p className="text-zinc-300 text-sm">
          All other states allow attorneys, but most people in small claims represent themselves anyway. If one party shows up with a lawyer and you don&apos;t have one, some states (like Florida) automatically subject both parties to formal discovery rules.
        </p>
      </section>

      <ToolCTA name="Small Claims Court Calculator" href="/tools/small-claims-calculator" description="Compare small claims rules across all 50 states side by side." />

      {/* 5 */}
      <section id="appeals" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Appeals</h2>
        <p className="text-zinc-300 mb-4">Appeal rules vary significantly:</p>
        <div className="space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-200 font-semibold text-sm">No appeals at all</p>
            <p className="text-zinc-400 text-xs">Arizona (from small claims), Hawaii, Iowa, Connecticut (very limited)</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-200 font-semibold text-sm">Defendant only can appeal</p>
            <p className="text-zinc-400 text-xs">California, Massachusetts, Oregon (from Justice Court)</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-200 font-semibold text-sm">Either party — new trial (de novo)</p>
            <p className="text-zinc-400 text-xs">Most states, including TX, PA, NC, VA, CO, MO, NE, and many others. Typical deadline: 10-30 days.</p>
          </div>
        </div>
      </section>

      {/* 6 */}
      <section id="tips" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Tips for Winning in Small Claims</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Before Filing</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Send a formal demand letter first (required in some states)</li>
              <li>Check the statute of limitations for your claim type</li>
              <li>Verify the defendant&apos;s legal name and address</li>
              <li>Calculate if the filing fee is worth it relative to your claim</li>
              <li>Consider if the defendant can actually pay a judgment</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">At the Hearing</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Bring organized evidence: contracts, receipts, photos, texts, emails</li>
              <li>Bring witnesses if possible</li>
              <li>Prepare a brief, clear opening statement (2-3 minutes)</li>
              <li>Be respectful to the judge — they decide everything</li>
              <li>Dress professionally — first impressions matter</li>
              <li>Arrive early and observe other cases first</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          Small claims court is the most accessible part of the legal system — low fees, no lawyer required, and fast resolution. The key is knowing your state&apos;s specific rules: dollar limits, filing deadlines, and whether you can bring an attorney.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/small-claims-calculator" className="text-blue-400 hover:text-blue-300 font-medium">Small Claims Court Calculator</Link> to check if your case qualifies, see your filing fee, and compare rules across states.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This guide is informational only. Rules and fees vary by county within each state. Always verify with your local court clerk before filing.
        </p>
      </section>
    </BlogLayout>
  );
}
