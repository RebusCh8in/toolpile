import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How Social Security Benefits Are Calculated (2026 Guide)",
  slug: "social-security-calculator-guide",
  description: "Learn exactly how Social Security retirement benefits are calculated. Understand AIME, PIA, bend points, claiming age adjustments, spousal benefits, and the earnings test with 2026 numbers.",
  datePublished: "2026-04-01",
  dateModified: "2026-04-01",
  tags: ["Social Security", "Social Security Calculator", "Retirement Benefits", "PIA", "AIME", "Claiming Age"],
  faqs: [
    { question: "How much Social Security will I get?", answer: "It depends on your 35 highest-earning years and when you claim. The average benefit in 2026 is $2,071/month. The maximum at age 62 is $2,969, at FRA (67) is $4,152, and at 70 is $5,181. Use our calculator for a personalized estimate based on your earnings and claiming age." },
    { question: "Should I claim Social Security at 62 or wait?", answer: "Claiming at 62 locks in a 30% permanent reduction (if your FRA is 67). Waiting until 70 gives you 124% of your full benefit. The break-even point is typically around age 80 -- if you live past 80, waiting pays more in total. If you need the income or have health concerns, claiming early may make sense." },
    { question: "What are the 2026 Social Security bend points?", answer: "The 2026 bend points are $1,286 and $7,749. The PIA formula applies 90% to AIME up to $1,286, 32% from $1,286 to $7,749, and 15% above $7,749. These are fixed at the year you turn 62 and increase annually with average wage growth." },
    { question: "Does working while collecting Social Security reduce my benefits?", answer: "Before FRA, yes -- if you earn over $24,480/year (2026), $1 is withheld for every $2 over. In the year you reach FRA, the limit is $65,160 with $1 per $3 over. After FRA, there's no limit. Withheld amounts aren't lost -- SSA recalculates at FRA to credit you." },
  ],
  relatedTools: [
    { name: "Social Security Calculator", href: "/tools/social-security-calculator" },
    { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
    { name: "401k Calculator", href: "/tools/401k-calculator" },
    { name: "Life Insurance Calculator", href: "/tools/life-insurance-calculator" },
  ],
  relatedArticles: [
    { title: "How VA Disability Ratings Are Calculated", href: "/blog/va-disability-calculator-guide" },
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
          <li><Link href="#formula" className="text-blue-400 hover:text-blue-300">1. The Benefit Formula (AIME and PIA)</Link></li>
          <li><Link href="#claiming-age" className="text-blue-400 hover:text-blue-300">2. Claiming Age: 62 vs 67 vs 70</Link></li>
          <li><Link href="#spousal" className="text-blue-400 hover:text-blue-300">3. Spousal and Survivor Benefits</Link></li>
          <li><Link href="#earnings-test" className="text-blue-400 hover:text-blue-300">4. Working While Collecting</Link></li>
          <li><Link href="#2026-numbers" className="text-blue-400 hover:text-blue-300">5. Key 2026 Numbers</Link></li>
          <li><Link href="#examples" className="text-blue-400 hover:text-blue-300">6. Real-World Examples</Link></li>
        </ol>
      </nav>

      {/* 1 */}
      <section id="formula" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. The Benefit Formula (AIME and PIA)</h2>
        <p className="text-zinc-300 mb-4">
          Social Security uses a two-step process to calculate your benefit:
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <h4 className="text-zinc-200 font-semibold mb-3">Step 1: Calculate AIME (Average Indexed Monthly Earnings)</h4>
          <ol className="text-zinc-300 text-sm space-y-1.5">
            <li><strong>1.</strong> Take your earnings from every year you worked</li>
            <li><strong>2.</strong> Index (adjust for inflation) each year&apos;s earnings to current dollars</li>
            <li><strong>3.</strong> Select the <strong>35 highest</strong> years</li>
            <li><strong>4.</strong> Add them up and divide by 420 (35 years x 12 months)</li>
            <li><strong>5.</strong> Result = your AIME</li>
          </ol>
          <p className="text-zinc-500 text-xs mt-2">If you worked fewer than 35 years, zeros fill the remaining years, dragging down your average.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <h4 className="text-zinc-200 font-semibold mb-3">Step 2: Apply the PIA Formula (2026 Bend Points)</h4>
          <div className="font-mono text-blue-400 text-sm mb-3">
            <p>PIA = 90% x first $1,286 of AIME</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 32% x AIME from $1,286 to $7,749</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 15% x AIME above $7,749</p>
          </div>
          <p className="text-zinc-300 text-sm">
            The PIA is your monthly benefit at Full Retirement Age. The formula is progressive. Low earners replace a higher percentage of their income (up to 90%) while high earners replace less (down to 15% on top earnings).
          </p>
        </div>
      </section>

      <ToolCTA name="Social Security Calculator" href="/tools/social-security-calculator" description="Enter your earnings and claiming age to estimate your monthly benefit." />

      {/* 2 */}
      <section id="claiming-age" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. Claiming Age: 62 vs 67 vs 70</h2>
        <p className="text-zinc-300 mb-4">
          When you claim determines your permanent monthly benefit:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Age</th>
                <th className="text-right py-2 text-zinc-400 font-medium">% of PIA</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Impact</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium text-red-400">62</td><td className="py-2 text-right">70%</td><td className="py-2">30% permanent reduction</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">63</td><td className="py-2 text-right">75%</td><td className="py-2">25% reduction</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">64</td><td className="py-2 text-right">80%</td><td className="py-2">20% reduction</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">65</td><td className="py-2 text-right">86.7%</td><td className="py-2">13.3% reduction</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">66</td><td className="py-2 text-right">93.3%</td><td className="py-2">6.7% reduction</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium text-green-400">67 (FRA)</td><td className="py-2 text-right">100%</td><td className="py-2">Full benefit</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">68</td><td className="py-2 text-right">108%</td><td className="py-2">8% delayed credits</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">69</td><td className="py-2 text-right">116%</td><td className="py-2">16% delayed credits</td></tr>
              <tr><td className="py-2 font-medium text-blue-400">70</td><td className="py-2 text-right">124%</td><td className="py-2">Maximum (24% increase)</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">The Break-Even Point</h4>
          <p className="text-zinc-300 text-sm">
            Claiming at 62 gives you more checks but smaller ones. Claiming at 70 gives fewer but larger checks. The break-even point (where total lifetime benefits are equal) is typically around <strong>age 80-82</strong>. If you live past 82, waiting to 70 pays more total. About 50% of 65-year-olds will live past 82.
          </p>
        </div>
      </section>

      {/* 3 */}
      <section id="spousal" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Spousal and Survivor Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">Spousal Benefits</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Up to <strong>50%</strong> of higher earner&apos;s PIA</li>
              <li>Available at age 62 (reduced)</li>
              <li>No delayed credits past FRA</li>
              <li>Higher earner must be collecting</li>
              <li>You get whichever is higher: your own or spousal</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">Survivor Benefits</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li><strong>100%</strong> of deceased spouse&apos;s benefit at FRA</li>
              <li>71.5% if claimed at age 60 (earliest)</li>
              <li>Disabled survivors: age 50</li>
              <li>Must have been married 9+ months</li>
              <li>Remarriage before 60 disqualifies</li>
            </ul>
          </div>
        </div>
      </section>

      <ToolCTA name="Social Security Calculator" href="/tools/social-security-calculator" description="Compare benefits at every claiming age from 62 to 70 with lifetime projections." />

      {/* 4 */}
      <section id="earnings-test" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Working While Collecting (Earnings Test)</h2>
        <p className="text-zinc-300 mb-4">
          If you claim before FRA and keep working, some benefits may be temporarily withheld:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Situation</th>
                <th className="text-right py-2 text-zinc-400 font-medium">2026 Exempt Amount</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Withholding</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2">Under FRA all year</td><td className="py-2 text-right">$24,480/yr</td><td className="py-2">$1 per $2 over limit</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Year you reach FRA</td><td className="py-2 text-right">$65,160/yr</td><td className="py-2">$1 per $3 over limit</td></tr>
              <tr><td className="py-2">At FRA and after</td><td className="py-2 text-right">No limit</td><td className="py-2">No withholding</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-zinc-300 text-sm">
          <strong>Key:</strong> Withheld benefits are not lost. SSA recalculates your benefit at FRA to credit you for months of withholding. Only earned income counts (not investments, pensions, or rental income).
        </p>
      </section>

      {/* 5 */}
      <section id="2026-numbers" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Key 2026 Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "COLA", value: "2.8%" },
            { label: "Wage Base", value: "$184,500" },
            { label: "Bend Points", value: "$1,286 / $7,749" },
            { label: "Max at 62", value: "$2,969/mo" },
            { label: "Max at FRA", value: "$4,152/mo" },
            { label: "Max at 70", value: "$5,181/mo" },
            { label: "Avg Benefit", value: "$2,071/mo" },
            { label: "Earnings Test (under FRA)", value: "$24,480/yr" },
            { label: "Earnings Test (FRA year)", value: "$65,160/yr" },
          ].map(n => (
            <div key={n.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">{n.label}</p>
              <p className="text-sm font-bold text-zinc-100">{n.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 */}
      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Real-World Examples</h2>
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 1: Average earner, 35 years, claiming at 67</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Average annual earnings: $60,000</li>
              <li>AIME: $60,000 x 35 / 420 = $5,000</li>
              <li>PIA: 90% x $1,286 + 32% x ($5,000 - $1,286) = $1,157 + $1,188 = $2,345</li>
              <li>Claiming at FRA (67): <strong>$2,345/month</strong></li>
              <li>At 62: $2,345 x 70% = <strong>$1,642/month</strong></li>
              <li>At 70: $2,345 x 124% = <strong>$2,908/month</strong></li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 2: High earner, 35 years, claiming at 70</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Average annual earnings: $150,000 (capped at wage base)</li>
              <li>AIME: $150,000 x 35 / 420 = $12,500</li>
              <li>PIA: 90% x $1,286 + 32% x $6,463 + 15% x $4,751 = $1,157 + $2,068 + $713 = $3,938</li>
              <li>Claiming at 70 (124%): <strong>$4,883/month = $58,596/year (tax-advantaged)</strong></li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 3: 25 years worked (10 zero years)</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Average annual earnings: $50,000, but only 25 years</li>
              <li>AIME: $50,000 x 25 / 420 = $2,976 (10 zero years drag it down)</li>
              <li>vs. 35 years: $50,000 x 35 / 420 = $4,167</li>
              <li>PIA at 25 years: $1,157 + 32% x $1,690 = $1,698</li>
              <li>PIA at 35 years: $1,157 + 32% x $2,881 = $2,079</li>
              <li><strong>10 missing years cost $381/month ($4,572/year) for life</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          Your Social Security benefit is driven by three factors: how much you earned (35 best years), how long you worked (fewer than 35 years hurts), and when you claim (62 = 30% less, 70 = 24% more). The decision of when to claim is one of the most consequential financial decisions most Americans make.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/social-security-calculator" className="text-blue-400 hover:text-blue-300 font-medium">Social Security Calculator</Link> for a personalized estimate, then create a my Social Security account at ssa.gov for exact numbers based on your complete earnings record.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This is a simplified estimate. Actual benefits depend on your complete year-by-year earnings history with inflation indexing. For exact numbers, use SSA.gov&apos;s official calculator with your real earnings record.
        </p>
      </section>
    </BlogLayout>
  );
}
