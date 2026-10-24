import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "The True Cost of a DUI in Every State (2026 Guide)",
  slug: "dui-cost-calculator-guide",
  description: "Learn the real cost of a DUI in all 50 states. Fines, insurance increases, IID costs, attorney fees, jail time, and license suspension — broken down with actual numbers.",
  datePublished: "2026-03-27",
  dateModified: "2026-03-27",
  tags: ["DUI", "DWI", "DUI Cost", "DUI Penalties", "DUI by State", "Insurance After DUI"],
  faqs: [
    { question: "What is the average total cost of a DUI?", answer: "A first-offense DUI typically costs $10,000-$25,000 when you factor in fines, court costs, insurance increases, IID rental, DUI school, attorney fees, towing, and bail. The insurance increase alone (averaging 88% nationally) accounts for $5,000-$15,000 of that total over 3-5 years." },
    { question: "Which state has the highest DUI penalties?", answer: "Arizona is widely considered the strictest: even a standard first offense requires 1 day jail (up to 10 with suspensions), $1,250+ in fines, 6-12 months IID, and 90-day license suspension. For 'Extreme DUI' (0.15+ BAC): 30 days mandatory jail. 'Super Extreme' (0.20+): 45 days mandatory jail. North Carolina has the highest insurance increase at 300-400%." },
    { question: "How long does a DUI affect my insurance?", answer: "Insurance rates stay elevated for 3-5 years after a DUI in most states. The DUI remains on your motor vehicle record for 5-10 years in most states, and some insurers check records going back 7-10 years. The SR-22 filing requirement (proof of insurance) lasts 3 years in most states, 4 years in Virginia, and 5 years in Alaska." },
    { question: "Is it worth hiring a DUI lawyer?", answer: "For most people, yes. DUI attorneys cost $2,500-$10,000 but can often negotiate reduced charges (e.g., 'wet reckless'), alternative sentencing, shorter license suspensions, or dismissal. Studies show represented defendants get better outcomes 70-80% of the time. For straightforward first offenses with low BAC, some people handle it without an attorney." },
  ],
  relatedTools: [
    { name: "DUI Cost Calculator", href: "/tools/dui-cost-calculator" },
    { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
    { name: "Budget Calculator", href: "/tools/budget-calculator" },
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
          <li><Link href="#total-cost" className="text-blue-400 hover:text-blue-300">1. The True Total Cost</Link></li>
          <li><Link href="#fines" className="text-blue-400 hover:text-blue-300">2. Fines and Court Costs by State</Link></li>
          <li><Link href="#insurance" className="text-blue-400 hover:text-blue-300">3. Insurance Increases by State</Link></li>
          <li><Link href="#criminal" className="text-blue-400 hover:text-blue-300">4. Jail Time and Criminal Penalties</Link></li>
          <li><Link href="#iid" className="text-blue-400 hover:text-blue-300">5. Ignition Interlock Devices</Link></li>
          <li><Link href="#license" className="text-blue-400 hover:text-blue-300">6. License Suspension</Link></li>
          <li><Link href="#strictest" className="text-blue-400 hover:text-blue-300">7. Strictest and Most Lenient States</Link></li>
          <li><Link href="#examples" className="text-blue-400 hover:text-blue-300">8. Real-World Cost Examples</Link></li>
        </ol>
      </nav>

      {/* 1 */}
      <section id="total-cost" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. The True Total Cost</h2>
        <p className="text-zinc-300 mb-4">
          When most people think of a DUI cost, they think of the fine. In reality, the fine is often the <strong>smallest part</strong>. Here&apos;s where the money actually goes:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Cost Category</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Typical Range</th>
                <th className="text-right py-2 text-zinc-400 font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2">Insurance increase (3-5 years)</td><td className="py-2 text-right">$5,000 - $15,000</td><td className="py-2 text-right text-zinc-400">40-60%</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Attorney fees</td><td className="py-2 text-right">$2,500 - $10,000</td><td className="py-2 text-right text-zinc-400">15-30%</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Fines, surcharges, court costs</td><td className="py-2 text-right">$1,000 - $5,000</td><td className="py-2 text-right text-zinc-400">10-20%</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">IID rental (6-24 months)</td><td className="py-2 text-right">$500 - $2,000</td><td className="py-2 text-right text-zinc-400">5-10%</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">DUI school/education</td><td className="py-2 text-right">$250 - $1,000</td><td className="py-2 text-right text-zinc-400">2-5%</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Towing, impound, bail</td><td className="py-2 text-right">$500 - $1,500</td><td className="py-2 text-right text-zinc-400">3-5%</td></tr>
              <tr className="border-t border-zinc-700"><td className="py-2 font-semibold">Total First Offense</td><td className="py-2 text-right font-bold text-red-400">$10,000 - $25,000+</td><td className="py-2 text-right text-zinc-400">100%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-zinc-300 text-sm">
          This doesn&apos;t include indirect costs like lost wages from jail time, missed work for court appearances, ride-sharing costs during license suspension, or career impact (certain jobs require a clean driving record).
        </p>
      </section>

      <ToolCTA name="DUI Cost Calculator" href="/tools/dui-cost-calculator" description="Get a state-specific DUI cost estimate with full breakdown in under 60 seconds." />

      {/* 2 */}
      <section id="fines" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. Fines and Court Costs by State</h2>
        <p className="text-zinc-300 mb-4">
          Base fines are only part of the story. Most states add <strong>penalty assessments and surcharges</strong> that multiply the base fine by 2-5x. California is the extreme example: a $390 base fine becomes $3,600+ after assessments.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">State</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Base Fine</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Total w/ Surcharges</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                { s: "California", base: "$390-$1,000", total: "$3,600-$4,000+" },
                { s: "Texas", base: "Up to $2,000", total: "$4,000-$6,000+" },
                { s: "New York", base: "$500-$1,000", total: "$1,750-$2,750" },
                { s: "Arizona", base: "$1,250+", total: "$2,500+" },
                { s: "New Jersey", base: "$250-$500", total: "$3,375-$3,750" },
                { s: "Florida", base: "$500-$1,000", total: "$1,000-$2,000" },
                { s: "Oregon", base: "Up to $6,250", total: "$6,250-$9,375" },
                { s: "Pennsylvania", base: "$0-$5,000", total: "$0-$7,500" },
              ].map(r => (
                <tr key={r.s} className="border-b border-zinc-800/50">
                  <td className="py-2 font-medium">{r.s}</td>
                  <td className="py-2 text-right text-zinc-400">{r.base}</td>
                  <td className="py-2 text-right">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-zinc-300 text-sm">
          New Jersey adds a <strong>$3,000 state surcharge</strong> ($1,000/year for 3 years) on top of fines. New York adds a $250/year <strong>Driver Responsibility Assessment</strong> for 3 years ($750 total).
        </p>
      </section>

      {/* 3 */}
      <section id="insurance" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Insurance Increases by State</h2>
        <p className="text-zinc-300 mb-4">
          The insurance increase is typically the <strong>single largest cost</strong> of a DUI. Nationally, rates jump about 88% on average — but the range is enormous:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-3">Highest Increases</h4>
            <ol className="text-zinc-300 text-sm space-y-1.5">
              <li><strong>North Carolina: 300-400%</strong></li>
              <li>California: 100-150%</li>
              <li>Michigan: 100-130%</li>
              <li>Hawaii: 100-130%</li>
              <li>Georgia: 100-125%</li>
              <li>Minnesota: 100-125%</li>
              <li>Vermont: 100-120%</li>
            </ol>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-3">Lowest Increases</h4>
            <ol className="text-zinc-300 text-sm space-y-1.5">
              <li><strong>Pennsylvania: 30-50%</strong></li>
              <li>New Jersey: 50-70%</li>
              <li>Arizona: 55-75%</li>
              <li>Washington: 55-75%</li>
              <li>Illinois: 60-80%</li>
              <li>Ohio: 60-80%</li>
              <li>Colorado: 60-80%</li>
            </ol>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">Dollar Impact Example</h4>
          <p className="text-zinc-300 text-sm">
            If you currently pay $2,000/year for auto insurance and get a DUI in <strong>North Carolina</strong> (350% increase), your premium jumps to ~$9,000/year. Over 3 years of SR-22: <strong>$21,000 in additional insurance costs alone</strong>. The same DUI in <strong>Pennsylvania</strong> (40% increase): $800/year extra = $2,400 over 3 years.
          </p>
        </div>
      </section>

      <ToolCTA name="DUI Cost Calculator" href="/tools/dui-cost-calculator" description="Enter your current insurance rate to see the real dollar impact of a DUI in your state." />

      {/* 4 */}
      <section id="criminal" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Jail Time and Criminal Penalties</h2>
        <p className="text-zinc-300 mb-4">
          Many states have <strong>mandatory minimum jail time</strong> even for a first offense:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">State</th>
                <th className="text-left py-2 text-zinc-400 font-medium">1st Offense Min Jail</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Notable</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Arizona</td><td className="py-2">1-10 days</td><td className="py-2 text-zinc-400 text-xs">0.15+ BAC: 30 days. 0.20+: 45 days.</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Texas</td><td className="py-2">72 hours (3 days)</td><td className="py-2 text-zinc-400 text-xs">Open container: adds 6-day min</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Ohio</td><td className="py-2">3 days (or DIP)</td><td className="py-2 text-zinc-400 text-xs">72-hr Driver Intervention Program alternative</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Georgia</td><td className="py-2">24 hours</td><td className="py-2 text-zinc-400 text-xs">Plus 40 hrs community service</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">California</td><td className="py-2">48 hours</td><td className="py-2 text-zinc-400 text-xs">96 hrs under VC 23536</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Virginia</td><td className="py-2">None (standard)</td><td className="py-2 text-zinc-400 text-xs">0.15+: 5 days. 0.20+: 10 days.</td></tr>
              <tr><td className="py-2 font-medium">Wisconsin</td><td className="py-2">None (civil)</td><td className="py-2 text-zinc-400 text-xs">Only state where 1st OWI is not criminal</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5 */}
      <section id="iid" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Ignition Interlock Devices (IID)</h2>
        <p className="text-zinc-300 mb-4">
          <strong>34 states + DC</strong> now require IID for all first-offense DUI convictions. The device costs $70-150/month to rent plus $100-200 for installation. Typical duration is 6-24 months for a first offense.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-300 text-sm">
            <strong>Longest IID requirements (1st offense):</strong> Massachusetts (24 months), Oklahoma (18 months), Utah (18 months).
            <br />
            <strong>States with no mandatory 1st-offense IID:</strong> Rhode Island, South Dakota, Wyoming (court discretion only).
          </p>
        </div>
      </section>

      {/* 6 */}
      <section id="license" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. License Suspension</h2>
        <p className="text-zinc-300 mb-4">
          Suspension length varies from 30 days to over a year for a first offense:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-2">Longest Suspensions (1st)</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Massachusetts: 1 year</li>
              <li>Delaware, Hawaii, New Mexico, Ohio, Oregon, Tennessee, Virginia: 1 year</li>
              <li>New Hampshire: 9 months - 2 years</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-2">Shortest Suspensions (1st)</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Pennsylvania (low BAC): No suspension</li>
              <li>Kansas: 30 days + 330 restricted</li>
              <li>Michigan, Rhode Island, South Dakota: 30 days</li>
              <li>Connecticut: 45 days</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7 */}
      <section id="strictest" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. Strictest and Most Lenient States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-3">Strictest States</h4>
            <ul className="text-zinc-300 text-sm space-y-2">
              <li><strong>Arizona</strong> — Mandatory jail even for 1st offense, escalating dramatically with BAC. Extreme/Super Extreme tiers.</li>
              <li><strong>Alaska</strong> — $1,500+ fines, 72-hour jail min, lifetime lookback.</li>
              <li><strong>Utah</strong> — Lowest BAC limit (0.05), 18-month IID, $1,310+ fines.</li>
              <li><strong>North Carolina</strong> — 300-400% insurance increase, 1-year suspension, tiered sentencing levels.</li>
              <li><strong>Oregon</strong> — Fines up to $6,250, 1-year IID, 1-year suspension, lifetime lookback.</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-3">Most Lenient States</h4>
            <ul className="text-zinc-300 text-sm space-y-2">
              <li><strong>Wisconsin</strong> — 1st offense is civil (not criminal), $150-$300 fine, no jail.</li>
              <li><strong>Pennsylvania (low BAC)</strong> — No mandatory jail, no suspension, no fine for 0.08-0.099 tier.</li>
              <li><strong>South Dakota</strong> — No mandatory jail, 30-day suspension, fines up to $2,000.</li>
              <li><strong>Mississippi</strong> — No mandatory jail (up to 48 hrs max), $250-$1,000 fine.</li>
            </ul>
          </div>
        </div>
      </section>

      <ToolCTA name="DUI Cost Calculator" href="/tools/dui-cost-calculator" description="Compare DUI costs across states side by side." />

      {/* 8 */}
      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">8. Real-World Cost Examples</h2>
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 1: California — Standard 1st DUI (BAC 0.10)</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Fines + surcharges: ~$3,800</li>
              <li>Insurance increase (125% x $2,000 x 3 years): $7,500</li>
              <li>IID (4 months): $470</li>
              <li>DUI school (3 months): $750</li>
              <li>Attorney: $3,000-$5,000</li>
              <li>Towing/impound/bail: $1,000</li>
              <li><strong>Total: $16,500 - $18,500</strong></li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 2: North Carolina — 1st DUI (BAC 0.12)</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Fines + surcharges (Level IV): ~$750</li>
              <li>Insurance increase (350% x $2,000 x 3 years): <strong>$21,000</strong></li>
              <li>DUI school/assessment: $400</li>
              <li>Attorney: $3,000-$7,000</li>
              <li>Towing/impound/bail: $1,000</li>
              <li><strong>Total: $26,000 - $30,000</strong></li>
              <li>The insurance increase alone makes NC one of the most expensive DUI states</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 3: Wisconsin — 1st OWI (BAC 0.10)</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Fine (civil): ~$800</li>
              <li>Insurance increase (80% x $2,000 x 3 years): $4,800</li>
              <li>IID (12 months): $1,110</li>
              <li>No jail (civil infraction)</li>
              <li>No attorney needed for most civil 1st offenses</li>
              <li><strong>Total: ~$6,700</strong></li>
              <li>Lowest total cost — Wisconsin is the only state where 1st OWI is not criminal</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom line */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          A DUI is far more expensive than most people realize. The fine is just the beginning — insurance increases, IID costs, attorney fees, and lost time add up to $10,000-$25,000+ for a first offense. In high-insurance-increase states like North Carolina, the total can exceed $30,000. The same DUI in Wisconsin might cost under $7,000.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/dui-cost-calculator" className="text-blue-400 hover:text-blue-300 font-medium">DUI Cost Calculator</Link> to see the full breakdown for your state, and always consult a DUI attorney for case-specific guidance.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This guide provides estimates for informational purposes only. Actual costs depend on your specific case, BAC level, judge, and circumstances. This is not legal advice.
        </p>
      </section>
    </BlogLayout>
  );
}
