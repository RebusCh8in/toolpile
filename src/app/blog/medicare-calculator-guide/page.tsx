import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "Medicare Costs in 2026: Premiums, IRMAA, Deductibles & What You'll Pay",
  slug: "medicare-calculator-guide",
  description: "Complete breakdown of 2026 Medicare costs. Part A, Part B, Part D premiums, IRMAA surcharges by income, deductibles, coinsurance, Medigap, and late enrollment penalties.",
  datePublished: "2026-04-02",
  dateModified: "2026-04-02",
  tags: ["Medicare", "Medicare Costs 2026", "IRMAA", "Medicare Part B", "Medicare Part D", "Medicare Calculator"],
  faqs: [
    { question: "How much will I pay for Medicare in 2026?", answer: "Baseline: $0 for Part A + $202.90/month for Part B + ~$39/month for Part D = about $242/month. Higher earners pay IRMAA surcharges up to $781/month total. Add $100-250/month for Medigap if you want supplement coverage. Total range: $242 to $1,000+/month depending on income and coverage choices." },
    { question: "What income triggers IRMAA surcharges in 2026?", answer: "IRMAA kicks in at $109,001 (single) or $218,001 (married filing jointly) based on your 2024 MAGI. At the first bracket, Part B goes from $202.90 to $284.10/month. At the highest bracket ($500K+ single / $750K+ joint), Part B is $689.90/month plus $91/month Part D surcharge." },
    { question: "How much is the Part A deductible in 2026?", answer: "The Part A deductible is $1,736 per benefit period (up from $1,676 in 2025). This applies each time you're admitted to a hospital. If you're discharged and readmitted within 60 days, it's the same benefit period. After 60 days out, a new benefit period (and new deductible) begins." },
    { question: "What is the Part D $2,100 out-of-pocket cap?", answer: "Starting in 2025 under the Inflation Reduction Act, Part D has an annual out-of-pocket cap ($2,100 in 2026, up from $2,000 in 2025). Once you hit this cap, you pay $0 for covered drugs for the rest of the year. This was a major change — previously there was no annual cap." },
  ],
  relatedTools: [
    { name: "Medicare Cost Calculator", href: "/tools/medicare-calculator" },
    { name: "Social Security Calculator", href: "/tools/social-security-calculator" },
    { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
    { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
  ],
  relatedArticles: [
    { title: "How Social Security Benefits Are Calculated", href: "/blog/social-security-calculator-guide" },
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
          <li><Link href="#overview" className="text-blue-400 hover:text-blue-300">1. Medicare Cost Overview</Link></li>
          <li><Link href="#part-a" className="text-blue-400 hover:text-blue-300">2. Part A (Hospital Insurance)</Link></li>
          <li><Link href="#part-b" className="text-blue-400 hover:text-blue-300">3. Part B (Medical Insurance)</Link></li>
          <li><Link href="#irmaa" className="text-blue-400 hover:text-blue-300">4. IRMAA Surcharges by Income</Link></li>
          <li><Link href="#part-d" className="text-blue-400 hover:text-blue-300">5. Part D (Prescription Drugs)</Link></li>
          <li><Link href="#medigap" className="text-blue-400 hover:text-blue-300">6. Medigap Supplement Plans</Link></li>
          <li><Link href="#penalties" className="text-blue-400 hover:text-blue-300">7. Late Enrollment Penalties</Link></li>
        </ol>
      </nav>

      {/* 1 */}
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. Medicare Cost Overview</h2>
        <p className="text-zinc-300 mb-4">
          Here&apos;s what most people pay for Medicare in 2026:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Part</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Covers</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Part A</td><td className="py-2">Hospital, skilled nursing, hospice</td><td className="py-2 text-right text-green-400">$0 (most people)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Part B</td><td className="py-2">Doctors, outpatient, preventive</td><td className="py-2 text-right">$202.90</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Part D</td><td className="py-2">Prescription drugs</td><td className="py-2 text-right">~$39.00</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Medigap (optional)</td><td className="py-2">Covers gaps in Original Medicare</td><td className="py-2 text-right">$100-$250</td></tr>
              <tr className="border-t border-zinc-700"><td className="py-2 font-bold">Total</td><td className="py-2"></td><td className="py-2 text-right font-bold text-blue-400">$242 - $492+</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <ToolCTA name="Medicare Cost Calculator" href="/tools/medicare-calculator" description="Enter your income and coverage choices to see your exact 2026 Medicare costs." />

      {/* 2 */}
      <section id="part-a" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. Part A (Hospital Insurance)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Premiums</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>40+ quarters (10+ years worked): <strong className="text-green-400">$0</strong></li>
              <li>30-39 quarters: $311/month</li>
              <li>Under 30 quarters: $565/month</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Deductible & Coinsurance</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Deductible: <strong>$1,736</strong> per benefit period</li>
              <li>Days 1-60: $0 (after deductible)</li>
              <li>Days 61-90: $434/day</li>
              <li>Days 91+ (lifetime reserve): $868/day</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="part-b" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Part B (Medical Insurance)</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <ul className="text-zinc-300 text-sm space-y-1.5">
            <li>Standard premium: <strong>$202.90/month</strong></li>
            <li>Annual deductible: <strong>$283</strong></li>
            <li>After deductible: you pay <strong>20% coinsurance</strong> (no annual cap)</li>
            <li>The lack of an out-of-pocket cap is why many people buy Medigap</li>
          </ul>
        </div>
      </section>

      {/* 4 */}
      <section id="irmaa" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. IRMAA Surcharges by Income</h2>
        <p className="text-zinc-300 mb-4">
          Higher earners pay more for Part B and Part D. IRMAA is based on your <strong>2024 MAGI</strong> (Modified Adjusted Gross Income from 2 years prior).
        </p>

        <h3 className="text-lg font-semibold text-zinc-200 mb-3">Part B IRMAA (2026)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Single MAGI</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Joint MAGI</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Part B/mo</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Part D Surcharge</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50 bg-green-500/5"><td className="py-2">$109,000 or less</td><td className="py-2">$218,000 or less</td><td className="py-2 text-right">$202.90</td><td className="py-2 text-right">$0</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">$109,001-$137,000</td><td className="py-2">$218,001-$274,000</td><td className="py-2 text-right">$284.10</td><td className="py-2 text-right">$14.50</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">$137,001-$171,000</td><td className="py-2">$274,001-$342,000</td><td className="py-2 text-right">$405.80</td><td className="py-2 text-right">$37.50</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">$171,001-$205,000</td><td className="py-2">$342,001-$410,000</td><td className="py-2 text-right">$527.50</td><td className="py-2 text-right">$60.40</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">$205,001-$499,999</td><td className="py-2">$410,001-$749,999</td><td className="py-2 text-right">$649.20</td><td className="py-2 text-right">$83.30</td></tr>
              <tr className="bg-red-500/5"><td className="py-2">$500,000+</td><td className="py-2">$750,000+</td><td className="py-2 text-right font-bold text-red-400">$689.90</td><td className="py-2 text-right">$91.00</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">IRMAA Cost Impact</h4>
          <p className="text-zinc-300 text-sm">
            At the highest bracket, you pay $689.90/month for Part B + $91/month Part D surcharge = <strong>$780.90/month</strong> total. That&apos;s $9,371/year just in premiums vs. $2,903/year at the standard rate. The difference: <strong>$6,468/year in IRMAA surcharges</strong>.
          </p>
        </div>
      </section>

      <ToolCTA name="Medicare Cost Calculator" href="/tools/medicare-calculator" description="See exactly which IRMAA bracket you fall into and how it affects your total costs." />

      {/* 5 */}
      <section id="part-d" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Part D (Prescription Drugs)</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <ul className="text-zinc-300 text-sm space-y-1.5">
            <li>Base premium: <strong>$38.99/month</strong> (actual plan premiums vary)</li>
            <li>Maximum deductible: <strong>$615</strong> (some plans have lower or $0)</li>
            <li>Annual out-of-pocket cap: <strong>$2,100</strong> (new under Inflation Reduction Act)</li>
            <li>After hitting cap: <strong>$0</strong> for covered drugs rest of year</li>
            <li>IRMAA surcharges: up to $91/month for high earners</li>
          </ul>
        </div>
        <p className="text-zinc-300 text-sm">
          The $2,100 annual cap (up from $2,000 in 2025) is the biggest recent change to Medicare. Before 2025, there was no cap, and some beneficiaries faced $10,000+ in annual drug costs.
        </p>
      </section>

      {/* 6 */}
      <section id="medigap" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Medigap Supplement Plans</h2>
        <p className="text-zinc-300 mb-4">
          Original Medicare (Parts A + B) has no annual out-of-pocket maximum. The 20% Part B coinsurance is unlimited. Medigap plans cover these gaps:
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">Plan G (Most Popular)</h4>
          <ul className="text-zinc-300 text-sm space-y-1">
            <li>Covers: Part A deductible, Part B coinsurance (20%), skilled nursing coinsurance, Part A hospice coinsurance, foreign travel emergency</li>
            <li>Does NOT cover: Part B deductible ($283/year)</li>
            <li>Cost: <strong>$100-$250/month</strong> depending on age, location, insurer</li>
            <li>Best value for most people since Plan F is closed to new enrollees</li>
          </ul>
        </div>
        <p className="text-zinc-300 text-sm">
          Medigap only works with Original Medicare. If you choose Medicare Advantage (Part C), you cannot use Medigap. Medicare Advantage plans have their own cost structures and out-of-pocket maximums.
        </p>
      </section>

      {/* 7 */}
      <section id="penalties" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. Late Enrollment Penalties</h2>
        <p className="text-zinc-300 mb-4">
          Missing your enrollment window has <strong>permanent</strong> consequences:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-2">Part B Penalty</h4>
            <p className="text-zinc-300 text-sm">
              <strong>+10% per year</strong> of the standard premium for each full 12 months you delayed. Permanent. Example: delay 3 years = 30% surcharge = $202.90 + $60.87 = <strong>$263.77/month for life</strong>.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-2">Part D Penalty</h4>
            <p className="text-zinc-300 text-sm">
              <strong>+1% per month</strong> of the base premium for each uncovered month (63+ consecutive days without creditable coverage). Permanent. Example: 24 months uncovered = 24% x $38.99 = <strong>+$9.36/month for life</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          Medicare is not free. Most people pay at least $242/month in premiums, plus deductibles and coinsurance. Higher earners can pay $780+/month due to IRMAA surcharges. The biggest cost variables are your income (IRMAA), whether you buy Medigap, and your prescription drug needs.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/medicare-calculator" className="text-blue-400 hover:text-blue-300 font-medium">Medicare Cost Calculator</Link> to estimate your total costs based on your specific income and coverage choices.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: 2026 costs from CMS.gov. Part D premiums vary by plan. Medigap costs vary by insurer, age, and location. This is informational only, not insurance advice.
        </p>
      </section>
    </BlogLayout>
  );
}
