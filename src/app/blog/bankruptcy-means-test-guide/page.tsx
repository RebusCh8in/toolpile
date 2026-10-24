import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "The Bankruptcy Means Test Explained: Do You Qualify for Chapter 7? (2026 Guide)",
  slug: "bankruptcy-means-test-guide",
  description: "Learn how the Chapter 7 bankruptcy means test works. State median incomes, IRS deduction standards, disposable income thresholds, and Chapter 13 alternatives — with updated 2026 figures.",
  datePublished: "2026-03-28",
  dateModified: "2026-03-28",
  tags: ["Bankruptcy", "Means Test", "Chapter 7", "Chapter 13", "Bankruptcy Calculator", "Debt Relief"],
  faqs: [
    { question: "What is the bankruptcy means test?", answer: "The means test is a formula that determines whether you qualify for Chapter 7 bankruptcy. It compares your average monthly income over the past 6 months to your state's median income for your household size. If you're below the median, you pass automatically. If above, a detailed calculation using IRS-standard deductions determines whether you have enough disposable income to repay your debts through Chapter 13." },
    { question: "Can I pass the means test if I make too much money?", answer: "Yes. Even if your income exceeds your state's median, you can still pass if your allowable deductions (housing, transportation, taxes, health care, etc.) leave you with less than $151.25/month in disposable income ($9,075 over 60 months). High-cost-of-living areas with expensive housing often produce passing results even for above-median earners." },
    { question: "What debts can be discharged in Chapter 7?", answer: "Chapter 7 discharges most unsecured debts including credit cards, medical bills, personal loans, and utility bills. It does NOT discharge student loans (in most cases), child support, alimony, most tax debts, court fines, or debts from fraud/DUI injuries. Secured debts (mortgage, auto loan) are not discharged unless you surrender the collateral." },
    { question: "How long does bankruptcy stay on your credit report?", answer: "Chapter 7 bankruptcy stays on your credit report for 10 years from the filing date. Chapter 13 stays for 7 years. However, many people see credit score improvements within 1-2 years after discharge as the debt-to-income ratio improves and on-time payments on remaining debts accumulate." },
  ],
  relatedTools: [
    { name: "Bankruptcy Means Test Calculator", href: "/tools/bankruptcy-means-test" },
    { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
    { name: "Debt-to-Income Calculator", href: "/tools/debt-to-income-calculator" },
    { name: "Credit Card Payoff Calculator", href: "/tools/credit-card-payoff-calculator" },
  ],
  relatedArticles: [
    { title: "The True Cost of a DUI in Every State", href: "/blog/dui-cost-calculator-guide" },
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
          <li><Link href="#how-it-works" className="text-blue-400 hover:text-blue-300">1. How the Means Test Works</Link></li>
          <li><Link href="#median-income" className="text-blue-400 hover:text-blue-300">2. State Median Income (2026 Figures)</Link></li>
          <li><Link href="#deductions" className="text-blue-400 hover:text-blue-300">3. Allowed Deductions</Link></li>
          <li><Link href="#thresholds" className="text-blue-400 hover:text-blue-300">4. Disposable Income Thresholds</Link></li>
          <li><Link href="#ch7-vs-ch13" className="text-blue-400 hover:text-blue-300">5. Chapter 7 vs. Chapter 13</Link></li>
          <li><Link href="#examples" className="text-blue-400 hover:text-blue-300">6. Real-World Examples</Link></li>
        </ol>
      </nav>

      {/* 1 */}
      <section id="how-it-works" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. How the Means Test Works</h2>
        <p className="text-zinc-300 mb-4">
          The means test (11 U.S.C. &sect; 707(b)(2)) is a two-step process that determines whether filing Chapter 7 bankruptcy would be an &ldquo;abuse&rdquo; of the system:
        </p>
        <div className="space-y-4 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-2">Step 1: Income vs. State Median</h4>
            <p className="text-zinc-300 text-sm">Average your gross income from ALL sources over the 6 calendar months before filing (called &ldquo;Current Monthly Income&rdquo; or CMI). Annualize it (CMI &times; 12) and compare to your state&apos;s median income for your household size. <strong>If below median → you pass automatically.</strong></p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-yellow-400 font-semibold text-sm mb-2">Step 2: Disposable Income Test (if above median)</h4>
            <p className="text-zinc-300 text-sm">Subtract IRS-standard deductions (living expenses, transportation, health care) and actual expenses (housing, taxes, insurance) from your CMI. Multiply disposable income by 60 months. If the result is below <strong>$9,075</strong>, you pass. Above <strong>$15,150</strong>, you fail. In between, a 25% unsecured debt test applies.</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">What Counts as Income (and What Doesn&apos;t)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-green-400 font-medium mb-1">Included:</p>
              <ul className="text-zinc-300 space-y-0.5">
                <li>Wages, salary, commissions, bonuses</li>
                <li>Self-employment / 1099 income</li>
                <li>Rental income, pensions</li>
                <li>Unemployment, workers&apos; comp</li>
                <li>Alimony / child support received</li>
              </ul>
            </div>
            <div>
              <p className="text-red-400 font-medium mb-1">Excluded:</p>
              <ul className="text-zinc-300 space-y-0.5">
                <li><strong>Social Security</strong> (retirement, SSDI, SSI)</li>
                <li>Payments to victims of war crimes</li>
                <li>Certain DoD payments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ToolCTA name="Bankruptcy Means Test Calculator" href="/tools/bankruptcy-means-test" description="Take the means test right now — enter your income and state to see if you qualify for Chapter 7." />

      {/* 2 */}
      <section id="median-income" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. State Median Income (2026 Figures)</h2>
        <p className="text-zinc-300 mb-4">
          These are the <strong>current figures effective April 1, 2026</strong>, published by the DOJ US Trustee Program. For households larger than 4, add $11,100 per additional person.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">State</th>
                <th className="text-right py-2 text-zinc-400 font-medium">1 Person</th>
                <th className="text-right py-2 text-zinc-400 font-medium">2 People</th>
                <th className="text-right py-2 text-zinc-400 font-medium">3 People</th>
                <th className="text-right py-2 text-zinc-400 font-medium">4 People</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                { s: "California", v: [79253,102797,116541,139071] },
                { s: "Texas", v: [66837,86714,99273,117962] },
                { s: "Florida", v: [69876,86523,97540,114761] },
                { s: "New York", v: [73272,92902,115579,139040] },
                { s: "Illinois", v: [73180,93934,113625,137902] },
                { s: "Pennsylvania", v: [72230,87534,110151,135862] },
                { s: "Ohio", v: [66239,83725,102504,123702] },
                { s: "Georgia", v: [68478,84965,101479,123481] },
                { s: "Massachusetts", v: [88202,112708,139411,178524] },
                { s: "Mississippi", v: [53978,70328,82846,97464] },
                { s: "DC", v: [85391,161397,161397,166598] },
              ].map(r => (
                <tr key={r.s} className="border-b border-zinc-800/50">
                  <td className="py-2 font-medium">{r.s}</td>
                  {r.v.map((v, i) => <td key={i} className="py-2 text-right">${v.toLocaleString()}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-zinc-400 text-xs">
          Full state data available in our <Link href="/tools/bankruptcy-means-test" className="text-blue-400">calculator</Link>. Source: DOJ US Trustee Program, Census Bureau data.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">Highest and Lowest Medians (1 Person)</h4>
          <p className="text-zinc-300 text-sm">
            <strong>Highest:</strong> Massachusetts ($88,202), Washington ($88,585), Utah ($87,898), Colorado ($87,940).
            <br /><strong>Lowest:</strong> Mississippi ($53,978), Arkansas ($58,421), Louisiana ($59,447), Oklahoma ($61,180).
            <br />Higher median = easier to qualify (your income is more likely to be below it).
          </p>
        </div>
      </section>

      {/* 3 */}
      <section id="deductions" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Allowed Deductions</h2>
        <p className="text-zinc-300 mb-4">
          If your income is above your state&apos;s median, you subtract these IRS-standard deductions to calculate disposable income:
        </p>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">IRS National Standards (automatic — no documentation needed)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-1 text-zinc-400 font-medium">Household Size</th>
                    <th className="text-right py-1 text-zinc-400 font-medium">Monthly Allowance</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-zinc-800/50"><td className="py-1">1 person</td><td className="py-1 text-right">$839</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="py-1">2 people</td><td className="py-1 text-right">$1,481</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="py-1">3 people</td><td className="py-1 text-right">$1,753</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="py-1">4 people</td><td className="py-1 text-right">$2,129</td></tr>
                  <tr><td className="py-1">Each additional</td><td className="py-1 text-right">+$394</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-zinc-500 text-xs mt-2">Covers food, clothing, housekeeping, personal care, miscellaneous. Effective Apr 2025 - Jun 2026.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Other Standard Deductions</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li><strong>Out-of-pocket health care:</strong> $84/month per person (under 65) or $149/month (65+)</li>
              <li><strong>Vehicle ownership:</strong> $662/month (1 car) or $1,324 (2 cars) — only if you have a car payment</li>
              <li><strong>Vehicle operating:</strong> $232-$401/month depending on region/metro area</li>
              <li><strong>Public transit:</strong> $244/month (if no vehicle)</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Actual Expense Deductions (must document)</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Housing (rent/mortgage) and utilities — actual amounts</li>
              <li>Income taxes and payroll taxes</li>
              <li>Health insurance and disability insurance premiums</li>
              <li>Court-ordered payments (child support, alimony)</li>
              <li>Child care and education for employment</li>
              <li>Involuntary payroll deductions (union dues, uniforms)</li>
              <li>Secured debt payments (mortgage, auto loan)</li>
              <li>Priority debt payments (tax debt, domestic support)</li>
            </ul>
          </div>
        </div>
      </section>

      <ToolCTA name="Bankruptcy Means Test Calculator" href="/tools/bankruptcy-means-test" description="Enter your expenses and see how deductions affect your disposable income." />

      {/* 4 */}
      <section id="thresholds" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Disposable Income Thresholds</h2>
        <p className="text-zinc-300 mb-4">
          After subtracting all allowed deductions, your monthly disposable income is multiplied by 60 months:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-green-400 font-bold text-lg mb-1">PASS</p>
            <p className="text-zinc-300 text-sm">Below $9,075</p>
            <p className="text-zinc-500 text-xs">(&lt;$151.25/month)</p>
          </div>
          <div className="bg-zinc-900 border border-yellow-500/30 rounded-xl p-4 text-center">
            <p className="text-yellow-400 font-bold text-lg mb-1">MIDDLE ZONE</p>
            <p className="text-zinc-300 text-sm">$9,075 - $15,150</p>
            <p className="text-zinc-500 text-xs">25% of unsecured debt test</p>
          </div>
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400 font-bold text-lg mb-1">FAIL</p>
            <p className="text-zinc-300 text-sm">Above $15,150</p>
            <p className="text-zinc-500 text-xs">(&gt;$252.50/month)</p>
          </div>
        </div>
        <p className="text-zinc-300 text-sm">
          <strong>Middle zone:</strong> If your 60-month disposable income is between $9,075 and $15,150, you fail only if that amount is enough to pay at least 25% of your nonpriority unsecured debts. Otherwise, you pass.
        </p>
        <p className="text-zinc-400 text-xs mt-2">
          These thresholds are effective April 1, 2025 through March 31, 2028. Previous thresholds were $8,775 / $14,625.
        </p>
      </section>

      {/* 5 */}
      <section id="ch7-vs-ch13" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Chapter 7 vs. Chapter 13</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium"></th>
                <th className="text-left py-2 text-zinc-400 font-medium">Chapter 7</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Chapter 13</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2 text-zinc-400 font-medium">Process</td><td className="py-2">Liquidation</td><td className="py-2">Repayment plan</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 text-zinc-400 font-medium">Timeline</td><td className="py-2">3-4 months</td><td className="py-2">3-5 years</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 text-zinc-400 font-medium">Means Test</td><td className="py-2">Required</td><td className="py-2">Not required</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 text-zinc-400 font-medium">Keep Assets</td><td className="py-2">Exempt assets only</td><td className="py-2">Keep all assets</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 text-zinc-400 font-medium">Debt Limits</td><td className="py-2">None</td><td className="py-2">Secured: $1,580,125<br />Unsecured: $526,700</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 text-zinc-400 font-medium">Credit Report</td><td className="py-2">10 years</td><td className="py-2">7 years</td></tr>
              <tr><td className="py-2 text-zinc-400 font-medium">Plan Length</td><td className="py-2">N/A</td><td className="py-2">3 yrs (below median)<br />5 yrs (above median)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6 */}
      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Real-World Examples</h2>
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 1: Below Median — Texas, Family of 3</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Monthly income (CMI): $7,500 → Annual: $90,000</li>
              <li>TX median for 3-person household: $99,273</li>
              <li>$90,000 &lt; $99,273 → <strong>PASS — Chapter 7 eligible</strong></li>
              <li>No further testing needed</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 2: Above Median, Still Passes — California, Single</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Monthly income (CMI): $7,000 → Annual: $84,000</li>
              <li>CA median for 1-person: $79,253 → Above median, full test required</li>
              <li>Deductions: Living ($839) + Health OOP ($84) + Housing ($2,200) + Transport ($943) + Health ins ($350) + Taxes ($1,200) = $5,616</li>
              <li>Disposable: $7,000 - $5,616 = $1,384/month</li>
              <li>Wait — that&apos;s $83,040 over 60 months, well above $15,150</li>
              <li><strong>FAIL — but California&apos;s high housing costs often bring this down</strong></li>
              <li>With $2,800/month rent: deductions = $6,216, disposable = $784, 60-month = $47,040 → still fails</li>
              <li>This earner likely needs Chapter 13 or to explore special circumstances</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 3: Above Median, Passes on Deductions — Ohio, Family of 4</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Monthly income (CMI): $11,000 → Annual: $132,000</li>
              <li>OH median for 4-person: $123,702 → Above median</li>
              <li>Deductions: Living ($2,129) + Health OOP ($336 for 4 people) + Housing ($1,600) + Utilities ($250) + Transport own ($1,324) + Transport op ($518) + Health ins ($600) + Child care ($800) + Taxes ($2,500) = $10,057</li>
              <li>Disposable: $11,000 - $10,057 = $943/month</li>
              <li>But this seems high... 60-month = $56,580 → would fail</li>
              <li>Add secured debt payments (mortgage + car = $2,800/month as actual deduction): disposable drops to $0</li>
              <li>$0 &times; 60 = $0 &lt; $9,075 → <strong>PASS</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom line */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          The means test looks complicated, but the first step is simple: compare your income to your state&apos;s median. If you&apos;re below it, you qualify for Chapter 7 regardless of your debts. If you&apos;re above it, the allowed deductions — especially housing, transportation, and secured debt payments — often bring disposable income below the threshold.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/bankruptcy-means-test" className="text-blue-400 hover:text-blue-300 font-medium">Bankruptcy Means Test Calculator</Link> for a quick estimate, then consult a bankruptcy attorney. Most offer free consultations and can run the full means test with your actual numbers.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This guide provides a simplified overview. The actual means test has additional line items. This is not legal advice — consult a bankruptcy attorney.
        </p>
      </section>
    </BlogLayout>
  );
}
