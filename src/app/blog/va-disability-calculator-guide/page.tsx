import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How VA Disability Ratings Are Calculated: VA Math Explained (2026 Guide)",
  slug: "va-disability-calculator-guide",
  description: "Learn how VA combined disability ratings work. Understand VA math, the combined rating formula, 2026 compensation rates, TDIU, dependent allowances, and the bilateral factor.",
  datePublished: "2026-03-31",
  dateModified: "2026-03-31",
  tags: ["VA Disability", "VA Math", "VA Combined Rating", "VA Compensation Rates", "Veterans Benefits", "TDIU"],
  faqs: [
    { question: "Why don't VA ratings add up normally?", answer: "The VA uses 'whole person' theory. You start at 100% healthy. Each disability reduces your remaining health, not the total. So 50% + 50% doesn't equal 100% -- the first 50% leaves 50% remaining, and the second 50% takes half of THAT remaining 50% (=25%), giving you 75% combined. This prevents exceeding 100% and reflects that each additional disability has less overall impact." },
    { question: "What is the VA combined rating formula?", answer: "Sort ratings highest to lowest. Start with 100. Apply the highest rating first (subtract from 100). Apply the next rating to the REMAINING percentage only. Repeat for all ratings. Subtract the final remaining from 100. Round to the nearest 10%. Example: 70% + 40% + 20% = 100-70=30, 30x0.4=12 so 30-12=18, 18x0.2=3.6 so 18-3.6=14.4, combined = 100-14.4 = 85.6%, rounds to 90%." },
    { question: "How much does a 100% VA disability rating pay in 2026?", answer: "$3,828.06/month for a veteran with no dependents (tax-free). With a spouse: $4,160.17/month. With spouse and one child: $4,292.39/month. These rates reflect the 2.5% COLA increase effective December 1, 2025." },
    { question: "Is VA disability pay taxable?", answer: "No. VA disability compensation is completely exempt from federal and state income tax. This makes the effective value significantly higher than the dollar amount suggests -- $3,828/month tax-free is equivalent to roughly $5,000-5,500/month in pre-tax income." },
  ],
  relatedTools: [
    { name: "VA Disability Calculator", href: "/tools/va-disability-calculator" },
    { name: "Workers' Comp Calculator", href: "/tools/workers-comp-calculator" },
    { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
  ],
  relatedArticles: [
    { title: "How Workers' Comp Benefits Are Calculated in Every State", href: "/blog/workers-comp-calculator-guide" },
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
          <li><Link href="#va-math" className="text-blue-400 hover:text-blue-300">1. VA Math Explained</Link></li>
          <li><Link href="#rates" className="text-blue-400 hover:text-blue-300">2. 2026 Compensation Rates</Link></li>
          <li><Link href="#dependents" className="text-blue-400 hover:text-blue-300">3. Dependent Allowances</Link></li>
          <li><Link href="#tdiu" className="text-blue-400 hover:text-blue-300">4. TDIU</Link></li>
          <li><Link href="#bilateral" className="text-blue-400 hover:text-blue-300">5. Bilateral Factor</Link></li>
          <li><Link href="#examples" className="text-blue-400 hover:text-blue-300">6. Real-World Examples</Link></li>
        </ol>
      </nav>

      {/* 1 */}
      <section id="va-math" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. VA Math Explained</h2>
        <p className="text-zinc-300 mb-4">
          The biggest frustration veterans face with disability ratings is that <strong>VA ratings don&apos;t add up normally</strong>. Two 50% ratings don&apos;t equal 100%. They equal 75%. Here&apos;s why:
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <h4 className="text-zinc-200 font-semibold mb-3">The Formula</h4>
          <ol className="text-zinc-300 text-sm space-y-2">
            <li><strong>1.</strong> Start at 100% (fully healthy)</li>
            <li><strong>2.</strong> Sort your ratings highest to lowest</li>
            <li><strong>3.</strong> Apply the highest rating first: subtract from 100</li>
            <li><strong>4.</strong> Apply the next rating to the REMAINING percentage only</li>
            <li><strong>5.</strong> Repeat for all ratings</li>
            <li><strong>6.</strong> Subtract final remaining from 100 = combined rating</li>
            <li><strong>7.</strong> Round to the nearest 10%</li>
          </ol>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <h4 className="text-zinc-200 font-semibold mb-3">Example: 50% + 50%</h4>
          <ul className="text-zinc-300 text-sm space-y-1">
            <li>Start: 100% healthy</li>
            <li>Apply 50%: 100 - 50 = 50% remaining</li>
            <li>Apply 50% to remaining: 50 x 0.50 = 25 reduction</li>
            <li>50 - 25 = 25% remaining</li>
            <li>Combined: 100 - 25 = <strong>75%</strong>, rounds to <strong>80%</strong></li>
            <li>NOT 100% as simple addition would suggest</li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">Rounding Rules</h4>
          <p className="text-zinc-300 text-sm">
            The final combined value is rounded to the nearest 10%. The 5 rounds up: 75% rounds to 80%, 74% rounds to 70%, 65% rounds to 70%, 55% rounds to 60%. This rounding can mean hundreds of dollars per month difference in compensation.
          </p>
        </div>
      </section>

      <ToolCTA name="VA Disability Calculator" href="/tools/va-disability-calculator" description="Add your ratings and see your combined percentage with step-by-step VA math." />

      {/* 2 */}
      <section id="rates" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. 2026 Compensation Rates</h2>
        <p className="text-zinc-300 mb-4">
          These rates are effective December 1, 2025, reflecting a 2.5% COLA increase. All payments are <strong>completely tax-free</strong>.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Rating</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Monthly</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Annual</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Tax-Equivalent*</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                [10, 175.51], [20, 347.14], [30, 537.26], [40, 773.82], [50, 1102.04],
                [60, 1394.80], [70, 1758.02], [80, 2044.30], [90, 2296.58], [100, 3828.06],
              ].map(([r, m]) => (
                <tr key={r} className="border-b border-zinc-800/50">
                  <td className="py-2 font-medium">{r}%</td>
                  <td className="py-2 text-right">${(m as number).toFixed(2)}</td>
                  <td className="py-2 text-right">${((m as number) * 12).toFixed(0)}</td>
                  <td className="py-2 text-right text-zinc-400">~${Math.round((m as number) / 0.75).toLocaleString()}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-zinc-500 text-xs">*Tax-equivalent assumes ~25% effective tax rate. Your actual equivalent depends on your tax bracket.</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">The 100% Jump</h4>
          <p className="text-zinc-300 text-sm">
            Notice the massive jump from 90% ($2,296.58) to 100% ($3,828.06). That&apos;s a <strong>$1,531.48/month increase</strong> for going from 90% to 100%. This is why veterans fight hard for that last 10%, and why understanding VA math and rounding is so important.
          </p>
        </div>
      </section>

      {/* 3 */}
      <section id="dependents" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Dependent Allowances</h2>
        <p className="text-zinc-300 mb-4">
          Veterans rated <strong>30% or higher</strong> receive additional compensation for dependents. At 10-20%, no dependent pay is available.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Rating</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Alone</th>
                <th className="text-right py-2 text-zinc-400 font-medium">+ Spouse</th>
                <th className="text-right py-2 text-zinc-400 font-medium">+ Spouse & 1 Child</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                [30, 537.26, 601.26, 649.26], [50, 1102.04, 1205.04, 1277.04],
                [70, 1758.02, 1900.02, 1996.02], [100, 3828.06, 4160.17, 4292.39],
              ].map(([r, a, s, sc]) => (
                <tr key={r} className="border-b border-zinc-800/50">
                  <td className="py-2 font-medium">{r}%</td>
                  <td className="py-2 text-right">${(a as number).toFixed(2)}</td>
                  <td className="py-2 text-right">${(s as number).toFixed(2)}</td>
                  <td className="py-2 text-right">${(sc as number).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4 */}
      <section id="tdiu" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. TDIU (Total Disability Individual Unemployability)</h2>
        <p className="text-zinc-300 mb-4">
          TDIU pays at the <strong>100% rate ($3,828.06/month)</strong> even if your combined rating is less than 100%, when you can&apos;t maintain substantially gainful employment due to service-connected disabilities.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">Eligibility Requirements</h4>
          <ul className="text-zinc-300 text-sm space-y-1">
            <li><strong>Option A:</strong> One disability rated at least 60%</li>
            <li><strong>Option B:</strong> Two or more disabilities with 70%+ combined, and at least one at 40%+</li>
            <li>Plus evidence you cannot secure or follow substantially gainful employment</li>
            <li>You can still earn below the poverty threshold (~$15,060/year) and maintain TDIU</li>
          </ul>
        </div>
      </section>

      <ToolCTA name="VA Disability Calculator" href="/tools/va-disability-calculator" description="Calculate your combined rating and see if you hit TDIU thresholds." />

      {/* 5 */}
      <section id="bilateral" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Bilateral Factor</h2>
        <p className="text-zinc-300 mb-4">
          When disabilities affect <strong>paired extremities</strong> (both arms, both legs), the VA applies a 10% bonus to the combined bilateral rating before combining with other disabilities.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h4 className="text-zinc-200 font-semibold mb-2">Example: Left Knee 30% + Right Knee 20%</h4>
          <ul className="text-zinc-300 text-sm space-y-1">
            <li>Combine bilateral: 100 - 30 = 70; 70 x 0.20 = 14; 70 - 14 = 56 remaining = 44% combined</li>
            <li>Apply bilateral factor: 44 x 0.10 = 4.4</li>
            <li>Adjusted bilateral: 44 + 4.4 = <strong>48.4%</strong></li>
            <li>This 48.4% is then combined with any other non-bilateral ratings</li>
          </ul>
        </div>
      </section>

      {/* 6 */}
      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Real-World Examples</h2>
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 1: PTSD 70% + Tinnitus 10%</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>100 - 70 = 30 remaining</li>
              <li>30 x 0.10 = 3 reduction</li>
              <li>30 - 3 = 27 remaining</li>
              <li>Combined: 100 - 27 = 73% rounds to <strong>70%</strong></li>
              <li>Monthly: <strong>$1,758.02</strong> (veteran alone, tax-free)</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 2: Back 40% + Knee 30% + Tinnitus 10% + Scars 10%</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>100 - 40 = 60 remaining</li>
              <li>60 x 0.30 = 18; 60 - 18 = 42 remaining</li>
              <li>42 x 0.10 = 4.2; 42 - 4.2 = 37.8 remaining</li>
              <li>37.8 x 0.10 = 3.78; 37.8 - 3.78 = 34.02 remaining</li>
              <li>Combined: 100 - 34.02 = 65.98% rounds to <strong>70%</strong></li>
              <li>Monthly: <strong>$1,758.02</strong> (alone) or <strong>$1,900.02</strong> (with spouse)</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 3: Near the 100% threshold</h4>
            <p className="text-zinc-300 text-sm mb-2">70% + 50% + 30% + 20%</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>100 - 70 = 30; 30 x 0.50 = 15; 30 - 15 = 15</li>
              <li>15 x 0.30 = 4.5; 15 - 4.5 = 10.5</li>
              <li>10.5 x 0.20 = 2.1; 10.5 - 2.1 = 8.4</li>
              <li>Combined: 100 - 8.4 = 91.6% rounds to <strong>90%</strong></li>
              <li>Monthly: $2,296.58 at 90% vs $3,828.06 at 100%</li>
              <li>Missing 100% by 8.4 points costs <strong>$1,531.48/month</strong></li>
              <li>This is why TDIU matters for veterans who can&apos;t work</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          VA math means your combined rating is always less than the simple sum of your individual ratings. Understanding this formula helps you plan your claims strategy, know what rating you need to hit the next threshold, and determine if TDIU might be an option.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/va-disability-calculator" className="text-blue-400 hover:text-blue-300 font-medium">VA Disability Calculator</Link> to calculate your exact combined rating and see your estimated monthly compensation with dependent allowances.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This calculator provides estimates based on the official VA combined rating formula and published 2026 compensation rates. Actual ratings are determined by VA examiners. Consult a VA-accredited claims agent or attorney for your specific case.
        </p>
      </section>
    </BlogLayout>
  );
}
