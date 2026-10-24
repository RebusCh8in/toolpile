import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How Child Support Is Calculated in Every State (2026 Guide)",
  slug: "child-support-calculator-guide",
  description: "Learn how child support is calculated in all 50 states. Understand the three calculation models — income shares, percentage of income, and the Melson formula — with real examples, state-specific rules, and factors that affect your payment.",
  datePublished: "2026-03-18",
  dateModified: "2026-03-18",
  tags: ["Child Support", "Child Support Calculator", "Family Law", "Child Support by State", "Income Shares", "Custody"],
  faqs: [
    { question: "How much child support will I pay?", answer: "Child support depends on your state, both parents' incomes, the number of children, custody split, and additional costs like health insurance and childcare. Most states use the income shares model, where both parents' incomes are combined and each pays a proportional share of the total child support obligation. Use our calculator for a state-specific estimate." },
    { question: "Is child support based on gross or net income?", answer: "It depends on the state. Most income shares states start with gross income and allow deductions for taxes, FICA, mandatory retirement, and health insurance. Texas uses 'net resources' (gross minus taxes and certain deductions). California uses 'net disposable income.' Wisconsin uses gross income with no deductions." },
    { question: "Does 50/50 custody mean no child support?", answer: "Not necessarily. Even with equal parenting time, if there's a significant income difference between parents, the higher earner typically still pays child support. The amount is usually reduced compared to a sole custody arrangement, but it rarely drops to zero unless both parents earn similar incomes." },
    { question: "Can child support be changed after it's set?", answer: "Yes. Either parent can request a modification if there's a 'substantial change in circumstances' — such as job loss, significant raise, change in custody arrangement, or a child's changing needs. Most states require at least a 10-20% change in the calculated amount to grant a modification." },
    { question: "What happens if I don't pay child support?", answer: "Consequences for non-payment include wage garnishment, tax refund seizure, driver's license suspension, passport denial, credit damage, contempt of court charges, and potentially jail time. Child support is a court order and non-payment is taken very seriously." },
    { question: "Is child support tax-deductible?", answer: "No. Child support has never been tax-deductible for the payer or taxable income for the recipient. This is different from alimony, which was deductible for agreements signed before 2019 but lost its deduction under the Tax Cuts and Jobs Act." },
    { question: "How long does child support last?", answer: "In most states, child support continues until the child turns 18 or graduates high school, whichever is later. Some states extend support to 19 or 21 if the child is still in high school or college. New York can extend support to age 21. A few states may require support for college expenses." },
    { question: "What if the other parent is hiding income?", answer: "Courts can impute income to a parent who is voluntarily unemployed or underemployed. This means the court assigns an income level based on the parent's education, work history, and local job market. Courts may also subpoena tax returns, bank statements, and business records to verify actual income." },
  ],
  relatedTools: [
    { name: "Child Support Calculator", href: "/tools/child-support-calculator" },
    { name: "Salary Calculator", href: "/tools/salary-calculator" },
    { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
    { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
  ],
  relatedArticles: [] as { title: string; href: string }[],
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
          <li><Link href="#three-models" className="text-blue-400 hover:text-blue-300">1. The Three Child Support Models</Link></li>
          <li><Link href="#income-shares" className="text-blue-400 hover:text-blue-300">2. Income Shares Model (41 States)</Link></li>
          <li><Link href="#percentage" className="text-blue-400 hover:text-blue-300">3. Percentage of Income Model (6 States)</Link></li>
          <li><Link href="#melson" className="text-blue-400 hover:text-blue-300">4. Melson Formula (3 States)</Link></li>
          <li><Link href="#state-formulas" className="text-blue-400 hover:text-blue-300">5. State-Specific Formulas: CA, TX, NY, FL, IL</Link></li>
          <li><Link href="#custody" className="text-blue-400 hover:text-blue-300">6. How Custody Affects Child Support</Link></li>
          <li><Link href="#income" className="text-blue-400 hover:text-blue-300">7. What Counts as Income</Link></li>
          <li><Link href="#modification" className="text-blue-400 hover:text-blue-300">8. Modifying Child Support</Link></li>
          <li><Link href="#examples" className="text-blue-400 hover:text-blue-300">9. Real-World Examples</Link></li>
        </ol>
      </nav>

      {/* ─── 1. Three Models ─── */}
      <section id="three-models" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. The Three Child Support Models</h2>
        <p className="text-zinc-300 mb-4">
          Every state in the US uses one of three models to calculate child support. The model your state uses determines which parent&apos;s income matters, how much weight custody time gets, and ultimately how much is owed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-blue-400 font-bold text-sm mb-2">Income Shares</h3>
            <p className="text-zinc-400 text-xs mb-2">41 states</p>
            <p className="text-zinc-300 text-sm">Both parents&apos; incomes are combined. Each parent pays a proportional share of the total obligation based on their percentage of combined income.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-blue-400 font-bold text-sm mb-2">Percentage of Income</h3>
            <p className="text-zinc-400 text-xs mb-2">6 states</p>
            <p className="text-zinc-300 text-sm">Only the non-custodial parent&apos;s income is used. A fixed percentage is applied based on the number of children.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-blue-400 font-bold text-sm mb-2">Melson Formula</h3>
            <p className="text-zinc-400 text-xs mb-2">3 states</p>
            <p className="text-zinc-300 text-sm">Similar to income shares but first ensures each parent can meet their own basic needs (self-support reserve) before calculating child support.</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">Which States Use Which Model?</h4>
          <div className="space-y-2 text-sm">
            <p className="text-zinc-300"><strong className="text-blue-400">Percentage of Income:</strong> Alaska, Mississippi, Nevada, North Dakota, Texas, Wisconsin</p>
            <p className="text-zinc-300"><strong className="text-blue-400">Melson Formula:</strong> Delaware, Hawaii, Montana</p>
            <p className="text-zinc-300"><strong className="text-blue-400">State-Specific:</strong> California (algebraic formula), New York (CSSA hybrid)</p>
            <p className="text-zinc-300"><strong className="text-blue-400">Income Shares:</strong> All other states + DC (Alabama, Arizona, Arkansas, Colorado, Connecticut, Florida, Georgia, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Missouri, Nebraska, New Hampshire, New Jersey, New Mexico, North Carolina, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Utah, Vermont, Virginia, Washington, West Virginia, Wyoming)</p>
          </div>
        </div>
      </section>

      <ToolCTA name="Child Support Calculator" href="/tools/child-support-calculator" description="Get a state-specific estimate of your child support payment in under 60 seconds." />

      {/* ─── 2. Income Shares ─── */}
      <section id="income-shares" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. Income Shares Model (41 States)</h2>
        <p className="text-zinc-300 mb-4">
          The income shares model is based on the idea that children should receive the same proportion of parental income they would have received if the parents lived together. Here&apos;s how it works:
        </p>

        <ol className="list-decimal list-inside text-zinc-300 space-y-3 mb-6">
          <li><strong>Calculate each parent&apos;s income</strong> — Start with gross income and subtract mandatory deductions (taxes, FICA, mandatory retirement, health insurance for the parent).</li>
          <li><strong>Combine both incomes</strong> — Add both parents&apos; adjusted incomes together.</li>
          <li><strong>Look up the Basic Support Obligation</strong> — Each state publishes a table that maps combined income and number of children to a dollar amount. This represents what the child needs.</li>
          <li><strong>Add extra costs</strong> — Health insurance premiums for the children, work-related childcare, and extraordinary medical expenses are added to the basic obligation.</li>
          <li><strong>Split proportionally</strong> — Each parent pays their percentage of the total. If Parent A earns 60% of the combined income, they pay 60% of the obligation.</li>
          <li><strong>Credit the custodial parent</strong> — The custodial parent&apos;s share is assumed spent directly on the children. The non-custodial parent pays their share to the custodial parent.</li>
        </ol>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-blue-400 font-semibold text-sm mb-2">Example: Income Shares Calculation</h4>
          <p className="text-zinc-300 text-sm mb-2">Parent A earns $5,000/month net. Parent B earns $3,000/month net. Two children. Parent A has 30% parenting time.</p>
          <ul className="text-zinc-300 text-sm space-y-1">
            <li>Combined income: $8,000/month</li>
            <li>Basic support obligation (approx): $8,000 × 28% = $2,240</li>
            <li>Parent A&apos;s share: 62.5% × $2,240 = $1,400</li>
            <li>Parent B&apos;s share: 37.5% × $2,240 = $840</li>
            <li><strong>Parent A pays Parent B: ~$1,400/month</strong> (before custody adjustments)</li>
          </ul>
        </div>
      </section>

      {/* ─── 3. Percentage of Income ─── */}
      <section id="percentage" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Percentage of Income Model (6 States)</h2>
        <p className="text-zinc-300 mb-4">
          This is the simplest model. Only the non-custodial parent&apos;s income is considered. A flat percentage is applied based on the number of children:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Children</th>
                <th className="text-center py-2 text-zinc-400 font-medium">Texas</th>
                <th className="text-center py-2 text-zinc-400 font-medium">Wisconsin</th>
                <th className="text-center py-2 text-zinc-400 font-medium">Mississippi</th>
                <th className="text-center py-2 text-zinc-400 font-medium">Alaska</th>
                <th className="text-center py-2 text-zinc-400 font-medium">Nevada</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2">1</td><td className="text-center">20%</td><td className="text-center">17%</td><td className="text-center">14%</td><td className="text-center">20%</td><td className="text-center">18%</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">2</td><td className="text-center">25%</td><td className="text-center">25%</td><td className="text-center">20%</td><td className="text-center">27%</td><td className="text-center">25%</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">3</td><td className="text-center">30%</td><td className="text-center">29%</td><td className="text-center">22%</td><td className="text-center">33%</td><td className="text-center">29%</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">4</td><td className="text-center">35%</td><td className="text-center">31%</td><td className="text-center">24%</td><td className="text-center">36%</td><td className="text-center">31%</td></tr>
              <tr><td className="py-2">5+</td><td className="text-center">40%</td><td className="text-center">34%</td><td className="text-center">26%</td><td className="text-center">39%</td><td className="text-center">33%</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <h4 className="text-amber-400 font-semibold text-sm mb-2">Key Differences Between States</h4>
          <ul className="text-zinc-300 text-sm space-y-1">
            <li><strong>Texas</strong> uses &ldquo;net resources&rdquo; (gross minus taxes, SS, Medicare, health insurance). Cap: $11,700/month net.</li>
            <li><strong>Wisconsin</strong> uses gross income — no deductions at all.</li>
            <li><strong>Mississippi</strong> uses adjusted gross (gross minus taxes and FICA).</li>
            <li><strong>Alaska</strong> uses annual net income.</li>
            <li><strong>Nevada</strong> uses gross income with tiered rates above $6,000/month.</li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-blue-400 font-semibold text-sm mb-2">Example: Texas Calculation</h4>
          <p className="text-zinc-300 text-sm">Non-custodial parent earns $6,000/month gross. After taxes and deductions, net resources = ~$4,800/month. Two children → 25% × $4,800 = <strong>$1,200/month</strong>.</p>
        </div>
      </section>

      {/* ─── 4. Melson Formula ─── */}
      <section id="melson" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Melson Formula (3 States)</h2>
        <p className="text-zinc-300 mb-4">
          Used by Delaware, Hawaii, and Montana, the Melson Formula is a three-step process that prioritizes each parent&apos;s ability to meet their own basic needs:
        </p>
        <ol className="list-decimal list-inside text-zinc-300 space-y-2 mb-4">
          <li><strong>Self-support reserve</strong> — Each parent&apos;s income is first reduced by a self-support amount (roughly $1,510/month) to ensure they can cover their own basic living expenses.</li>
          <li><strong>Primary support</strong> — A basic child support need is calculated based on the child&apos;s age and the state&apos;s cost-of-living data. Each parent contributes proportionally from their remaining income.</li>
          <li><strong>Standard of living adjustment</strong> — If either parent has income remaining after steps 1 and 2, a percentage of that excess is allocated to the child to share in the parent&apos;s standard of living.</li>
        </ol>
        <p className="text-zinc-300">
          The Melson Formula generally results in lower support amounts for low-income parents and higher amounts for high-income parents compared to the standard income shares model.
        </p>
      </section>

      <ToolCTA name="Child Support Calculator" href="/tools/child-support-calculator" description="Select your state and get an instant estimate based on your specific situation." />

      {/* ─── 5. State-Specific Formulas ─── */}
      <section id="state-formulas" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. State-Specific Formulas: CA, TX, NY, FL, IL</h2>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">California</h3>
            <p className="text-zinc-300 text-sm mb-2">California uses a unique algebraic formula: <code className="bg-zinc-800 px-2 py-0.5 rounded text-xs">CS = K[HN - (H%)(TN)]</code></p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li><strong>HN</strong> = high earner&apos;s net monthly disposable income</li>
              <li><strong>H%</strong> = percentage of time high earner has the children</li>
              <li><strong>TN</strong> = total net monthly disposable income (both parents)</li>
              <li><strong>K</strong> = income allocation factor based on total net income (ranges from ~0.165 to 0.25 for one child, multiplied for additional children)</li>
            </ul>
            <p className="text-zinc-400 text-xs mt-2">Multi-child multipliers: 2 children = 1.6×, 3 = 2.0×, 4 = 2.3×, 5 = 2.5×</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Texas</h3>
            <p className="text-zinc-300 text-sm mb-2">Percentage of income model. Flat percentages applied to net resources:</p>
            <p className="text-zinc-300 text-sm">1 child = 20%, 2 = 25%, 3 = 30%, 4 = 35%, 5+ = 40%. Net resources cap: <strong>$11,700/month</strong> (effective September 2025). Maximum guideline support for 1 child: $2,340/month.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">New York</h3>
            <p className="text-zinc-300 text-sm mb-2">Uses the Child Support Standards Act (CSSA) — a hybrid approach:</p>
            <p className="text-zinc-300 text-sm mb-2">Percentages applied to <strong>combined parental income</strong> up to $193,000/year: 1 child = 17%, 2 = 25%, 3 = 29%, 4 = 31%, 5+ = 35%.</p>
            <p className="text-zinc-300 text-sm">Each parent pays their proportional share. Self-support reserve: $21,546/year. Below this, minimum payment is $50/month.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Florida</h3>
            <p className="text-zinc-300 text-sm mb-2">Standard income shares model with a detailed statutory schedule (Fla. Stat. 61.30).</p>
            <p className="text-zinc-300 text-sm">Shared custody adjustment kicks in at <strong>73 overnights</strong> (20% of the year). The basic obligation is multiplied by 1.5 and each parent&apos;s share is offset by their parenting time percentage.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Illinois</h3>
            <p className="text-zinc-300 text-sm mb-2">Switched from percentage of income to <strong>income shares</strong> in 2017.</p>
            <p className="text-zinc-300 text-sm">Uses adjusted net income (gross minus taxes, FICA, mandatory retirement, prior support). Shared parenting adjustment at <strong>146 overnights</strong> (40%) — obligation is multiplied by 1.5 with offsets for duplicated expenses.</p>
          </div>
        </div>
      </section>

      {/* ─── 6. Custody ─── */}
      <section id="custody" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. How Custody Affects Child Support</h2>
        <p className="text-zinc-300 mb-4">
          Parenting time has a significant impact on child support calculations in most states. The general principle: the more time you spend with your children, the less support you owe (because you&apos;re spending directly on them during that time).
        </p>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Shared Custody Thresholds by State</h3>
        <p className="text-zinc-300 mb-3">Most states have a minimum overnight threshold that triggers a shared-custody adjustment:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { state: "Florida", threshold: "73 nights (20%)" },
            { state: "Indiana", threshold: "52+ nights" },
            { state: "North Carolina", threshold: "123 nights" },
            { state: "Illinois", threshold: "146 nights (40%)" },
            { state: "Wyoming", threshold: "92 nights (25%)" },
            { state: "Delaware", threshold: "164 nights" },
          ].map(s => (
            <div key={s.state} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-zinc-200 font-semibold text-sm">{s.state}</p>
              <p className="text-zinc-400 text-xs mt-1">{s.threshold}</p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">50/50 Custody</h3>
        <p className="text-zinc-300 mb-4">
          Even with equal time, child support doesn&apos;t automatically drop to zero. If one parent earns significantly more than the other, they&apos;ll still owe support to equalize the child&apos;s standard of living between households. The amount is typically reduced substantially compared to sole custody, but the higher earner usually still pays something.
        </p>
      </section>

      {/* ─── 7. Income ─── */}
      <section id="income" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. What Counts as Income</h2>
        <p className="text-zinc-300 mb-4">
          Courts cast a wide net when defining &ldquo;income&rdquo; for child support purposes. It&apos;s not just your W-2 salary:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-2">Counted as Income</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Salary and wages</li>
              <li>Bonuses and commissions</li>
              <li>Self-employment income</li>
              <li>Rental income</li>
              <li>Investment income and dividends</li>
              <li>Social Security benefits</li>
              <li>Unemployment and disability</li>
              <li>Pension and retirement income</li>
              <li>Trust income</li>
              <li>Tips and overtime</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-2">Common Deductions</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Federal and state income taxes</li>
              <li>FICA (Social Security + Medicare)</li>
              <li>Mandatory retirement contributions</li>
              <li>Union dues</li>
              <li>Health insurance premiums (for parent)</li>
              <li>Prior child support orders</li>
              <li>Spousal support/alimony paid</li>
            </ul>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-amber-400 font-semibold text-sm mb-2">Imputed Income</h4>
          <p className="text-zinc-300 text-sm">
            If a court finds that a parent is <strong>voluntarily unemployed or underemployed</strong>, it can &ldquo;impute&rdquo; income — meaning it assigns an income level based on the parent&apos;s education, work history, skills, and local job market. Quitting your job to reduce child support doesn&apos;t work.
          </p>
        </div>
      </section>

      <ToolCTA name="Child Support Calculator" href="/tools/child-support-calculator" description="Enter both parents' incomes and get a breakdown of estimated support in your state." />

      {/* ─── 8. Modification ─── */}
      <section id="modification" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">8. Modifying Child Support</h2>
        <p className="text-zinc-300 mb-4">
          Child support orders aren&apos;t permanent. Either parent can request a modification if circumstances change significantly:
        </p>
        <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-4">
          <li><strong>Job loss or income reduction</strong> — involuntary job loss is the most common reason for modification</li>
          <li><strong>Significant raise</strong> — either parent&apos;s income increasing substantially</li>
          <li><strong>Change in custody</strong> — more or fewer overnights with either parent</li>
          <li><strong>Child&apos;s needs change</strong> — medical issues, educational needs, aging out</li>
          <li><strong>New children</strong> — some states allow adjustments for subsequent children</li>
          <li><strong>Cost of living changes</strong> — some states have automatic COLA adjustments</li>
        </ul>
        <p className="text-zinc-300">
          Most states require at least a <strong>10-20% change</strong> in the calculated amount to grant a modification. Until a modification is approved by the court, the original order remains in effect — you can&apos;t unilaterally reduce payments.
        </p>
      </section>

      {/* ─── 9. Examples ─── */}
      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">9. Real-World Examples</h2>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 1: Texas — One child, standard custody</h4>
            <p className="text-zinc-300 text-sm mb-2">Non-custodial parent earns $75,000/year gross (~$6,250/month).</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Net resources after taxes/FICA: ~$5,100/month</li>
              <li>One child = 20% of net resources</li>
              <li><strong>Monthly support: ~$1,020</strong></li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 2: New York — Two children, income disparity</h4>
            <p className="text-zinc-300 text-sm mb-2">Parent A: $120,000/year. Parent B: $50,000/year. Two children. Parent A is non-custodial.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Combined income: $170,000 (under $193K cap)</li>
              <li>Two children = 25% × $170,000 = $42,500/year obligation</li>
              <li>Parent A&apos;s share: 70.6% × $42,500 = $30,000/year</li>
              <li><strong>Monthly support: ~$2,500</strong></li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 3: Florida — Two children, shared custody</h4>
            <p className="text-zinc-300 text-sm mb-2">Parent A: $6,000/month net. Parent B: $4,000/month net. 60/40 custody split (Parent A has 60%). Two children.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Combined net: $10,000/month</li>
              <li>Basic obligation (approx): $10,000 × 28% = $2,800</li>
              <li>Shared custody adjustment (1.5×): $4,200</li>
              <li>Parent A&apos;s share: 60% × $4,200 = $2,520, offset by 60% parenting time</li>
              <li>Parent B&apos;s share: 40% × $4,200 = $1,680, offset by 40% parenting time</li>
              <li><strong>Net payment from A to B: ~$840/month</strong> (significantly reduced from the ~$1,680 without shared custody)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Bottom line ─── */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          Child support calculations vary dramatically by state. The same family earning the same income could owe $800/month in Mississippi and $2,500/month in New York. Understanding your state&apos;s model — and the specific inputs that matter — is critical for planning.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/child-support-calculator" className="text-blue-400 hover:text-blue-300 font-medium">Child Support Calculator</Link> for a quick estimate, but always consult a family law attorney for your specific situation. Courts have discretion to deviate from guidelines based on special circumstances, and there are nuances (like imputed income, extraordinary expenses, and prior orders) that no calculator can fully capture.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This guide and calculator provide estimates for informational purposes only. They are not legal advice. Actual child support orders are determined by courts and may differ from these estimates.
        </p>
      </section>
    </BlogLayout>
  );
}