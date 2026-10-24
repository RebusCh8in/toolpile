import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How Workers' Comp Benefits Are Calculated in Every State (2026 Guide)",
  slug: "workers-comp-calculator-guide",
  description: "Learn how workers' compensation benefits are calculated in all 50 states. Understand TTD rates, maximum weekly benefits, waiting periods, and which states pay the most and least.",
  datePublished: "2026-03-26",
  dateModified: "2026-03-26",
  tags: ["Workers Compensation", "Workers Comp Calculator", "TTD Benefits", "Workplace Injury", "Workers Comp by State"],
  faqs: [
    { question: "How much does workers' comp pay per week?", answer: "Most states pay 66.67% (two-thirds) of your average weekly wage, subject to a state maximum. The maximum varies enormously: Iowa pays up to $2,350/week while Mississippi caps at $631/week. States using after-tax wages at 75-80% (like Iowa, Alaska, Connecticut) often produce similar dollar amounts to the 66.67% of gross states." },
    { question: "Are workers' comp benefits taxable?", answer: "No. Workers' compensation benefits are exempt from federal income tax. This means a $1,000/week workers' comp check has the same buying power as roughly $1,300-$1,400/week in regular wages (depending on your tax bracket). If you also receive SSDI, some SSDI benefits may become taxable." },
    { question: "What is the waiting period for workers' comp?", answer: "The waiting period is 3-7 days depending on your state (medical treatment is covered from day one). If your disability exceeds the retroactive period (typically 14-21 days), the waiting period is paid retroactively. So for injuries lasting more than 2-3 weeks, you ultimately get paid for the full time off." },
    { question: "Which state pays the most workers' comp?", answer: "Iowa has the highest maximum weekly benefit at $2,350, followed by New Hampshire ($2,309), Washington (~$2,196), and DC ($1,809). However, the actual benefit depends on your wages — if you earn less than the maximum, the state cap doesn't matter. Mississippi ($631), Georgia ($800), and Indiana ($828) have the lowest maximums." },
    { question: "Does workers' comp cover all medical bills?", answer: "Yes, workers' comp covers all reasonable and necessary medical treatment for your work injury — with no deductibles, copays, or coverage limits. This includes ER visits, surgery, physical therapy, prescriptions, and medical devices. You may need to use approved providers or get treatment pre-authorized." },
    { question: "Can I be fired while on workers' comp?", answer: "You cannot be fired specifically for filing a workers' comp claim (that's retaliation and illegal). However, most states are 'at-will' employment states, meaning your employer can terminate you for other legitimate reasons. If you believe you were fired in retaliation for filing a claim, consult a workers' comp attorney." },
    { question: "What if my employer doesn't have workers' comp?", answer: "In most states, employers are required by law to carry workers' comp insurance. If your employer doesn't have it, they may face penalties, and you may be able to file a claim through your state's uninsured employer fund. Texas is the only state where coverage is truly voluntary." },
    { question: "How long can I receive workers' comp benefits?", answer: "TTD benefits last until you can return to work or reach Maximum Medical Improvement (MMI). Most states have no strict time limit, but Georgia caps TTD at 400 weeks unless the injury is catastrophic. If you have a permanent impairment, you may receive PPD or PTD benefits after TTD ends. PTD benefits may last until retirement age or for life." },
  ],
  relatedTools: [
    { name: "Workers' Comp Calculator", href: "/tools/workers-comp-calculator" },
    { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
    { name: "Salary Calculator", href: "/tools/salary-calculator" },
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
          <li><Link href="#how-it-works" className="text-blue-400 hover:text-blue-300">1. How Workers&apos; Comp Benefits Work</Link></li>
          <li><Link href="#rates-by-state" className="text-blue-400 hover:text-blue-300">2. TTD Rates and Maximums by State</Link></li>
          <li><Link href="#waiting-periods" className="text-blue-400 hover:text-blue-300">3. Waiting and Retroactive Periods</Link></li>
          <li><Link href="#highest-lowest" className="text-blue-400 hover:text-blue-300">4. Highest and Lowest Paying States</Link></li>
          <li><Link href="#special-states" className="text-blue-400 hover:text-blue-300">5. Special State Rules</Link></li>
          <li><Link href="#benefit-types" className="text-blue-400 hover:text-blue-300">6. Types of Workers&apos; Comp Benefits</Link></li>
          <li><Link href="#tax" className="text-blue-400 hover:text-blue-300">7. Tax Treatment</Link></li>
          <li><Link href="#examples" className="text-blue-400 hover:text-blue-300">8. Real-World Examples</Link></li>
        </ol>
      </nav>

      {/* 1 */}
      <section id="how-it-works" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. How Workers&apos; Comp Benefits Work</h2>
        <p className="text-zinc-300 mb-4">
          When you&apos;re injured at work and can&apos;t perform your job, workers&apos; compensation provides two types of benefits: <strong>medical treatment</strong> (covered from day one with no out-of-pocket costs) and <strong>wage replacement</strong> (a percentage of your lost wages, subject to state caps).
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <p className="text-lg font-mono text-blue-400 text-center mb-3">
            Weekly Benefit = Average Weekly Wage x State Rate
          </p>
          <p className="text-zinc-400 text-sm text-center">(Subject to state minimum and maximum caps)</p>
        </div>
        <p className="text-zinc-300 mb-4">
          The <strong>Average Weekly Wage (AWW)</strong> is typically calculated from your earnings over the 52 weeks before your injury. Most states use <strong>66.67% (two-thirds)</strong> of your gross AWW. A few states use different rates or calculate from after-tax wages.
        </p>
      </section>

      <ToolCTA name="Workers' Comp Calculator" href="/tools/workers-comp-calculator" description="Enter your weekly wage and state to get an instant TTD benefit estimate." />

      {/* 2 */}
      <section id="rates-by-state" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. TTD Rates and Maximums by State</h2>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Wage Replacement Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">66.67% of Gross (~38 states)</h4>
            <p className="text-zinc-300 text-sm">The most common rate. Two-thirds of your gross average weekly wage. Used by AL, AZ, AR, CA, CO, DE, DC, FL, GA, HI, IL, IN, KS, KY, LA, MD, MN, MS, MO, MT, NE, NV, NM, NY, NC, ND, OH, OR, PA, SC, SD, TN, UT, VT, VA, WV, WI, WY.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">Other Rates</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li><strong>60%:</strong> Massachusetts, New Hampshire</li>
              <li><strong>67%:</strong> Idaho</li>
              <li><strong>70%:</strong> New Jersey, Oklahoma, Texas</li>
              <li><strong>75% of after-tax:</strong> Connecticut, Rhode Island</li>
              <li><strong>80% of after-tax:</strong> Alaska, Iowa, Maine, Michigan</li>
              <li><strong>60-75% (varies):</strong> Washington (by family status)</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Maximum Weekly Benefits (Selected States)</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">State</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Max Weekly</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Min Weekly</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                { s: "Iowa", max: "$2,350", min: "$398", rate: "80% after-tax" },
                { s: "New Hampshire", max: "$2,309", min: "$462", rate: "60%" },
                { s: "Washington", max: "$2,196", min: "$549", rate: "60-75%" },
                { s: "Illinois", max: "$2,009", min: "$291", rate: "66.67%" },
                { s: "Massachusetts", max: "$1,829", min: "$366", rate: "60%" },
                { s: "DC", max: "$1,809", min: "$452", rate: "66.67%" },
                { s: "California", max: "$1,764", min: "$265", rate: "66.67%" },
                { s: "Oregon", max: "$1,771", min: "$50", rate: "66.67%" },
                { s: "New York", max: "$1,222", min: "$325", rate: "66.67%" },
                { s: "Texas", max: "$1,271", min: "$191", rate: "70%" },
                { s: "Florida", max: "$1,358", min: "$20", rate: "66.67%" },
                { s: "Georgia", max: "$800", min: "$50", rate: "66.67%" },
                { s: "Mississippi", max: "$631", min: "$25", rate: "66.67%" },
              ].map(r => (
                <tr key={r.s} className="border-b border-zinc-800/50">
                  <td className="py-2 font-medium">{r.s}</td>
                  <td className="py-2 text-right">{r.max}</td>
                  <td className="py-2 text-right text-zinc-500">{r.min}</td>
                  <td className="py-2 text-zinc-400 text-xs">{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3 */}
      <section id="waiting-periods" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Waiting and Retroactive Periods</h2>
        <p className="text-zinc-300 mb-4">
          Every state has a <strong>waiting period</strong> before wage replacement benefits begin (medical treatment is always covered from day one). If your disability exceeds the <strong>retroactive period</strong>, the waiting period is paid retroactively.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">3-Day Wait (24 states)</h4>
            <p className="text-zinc-400 text-xs">AL, CA, CO, CT, DC, DE, HI, IL, IA, MD, MN, MO, MT, NH, OK, OR, RI, UT, VT, WA, WV, WI, WY</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">5-Day Wait (5 states)</h4>
            <p className="text-zinc-400 text-xs">ID, MA, MS, NV, ND</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">7-Day Wait (22 states)</h4>
            <p className="text-zinc-400 text-xs">AZ, AR, FL, GA, IN, KS, KY, LA, ME, MI, NE, NJ, NM, NY, NC, OH, PA, SC, SD, TN, TX, VA</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">What &ldquo;Retroactive&rdquo; Means</h4>
          <p className="text-zinc-300 text-sm">
            If your disability exceeds the retroactive period, you get paid for the waiting period too. Most states use <strong>14 days</strong> (~25 states) or <strong>21 days</strong> (~10 states). Louisiana and Nebraska have the longest at <strong>42 days</strong>. New Jersey has the shortest at <strong>7 days</strong>. This means in most states, if you&apos;re off work for 2-3+ weeks, you ultimately receive benefits for the full time off.
          </p>
        </div>
      </section>

      <ToolCTA name="Workers' Comp Calculator" href="/tools/workers-comp-calculator" description="See how the waiting period affects your total benefits based on your time off." />

      {/* 4 */}
      <section id="highest-lowest" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Highest and Lowest Paying States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-3">Highest Max Weekly Benefits</h4>
            <ol className="text-zinc-300 text-sm space-y-1.5">
              <li><strong>1. Iowa:</strong> $2,350/week (80% after-tax)</li>
              <li><strong>2. New Hampshire:</strong> $2,309/week (60%)</li>
              <li><strong>3. Washington:</strong> ~$2,196/week (60-75%)</li>
              <li><strong>4. Illinois:</strong> $2,009/week (66.67%)</li>
              <li><strong>5. Massachusetts:</strong> $1,829/week (60%)</li>
            </ol>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-3">Lowest Max Weekly Benefits</h4>
            <ol className="text-zinc-300 text-sm space-y-1.5">
              <li><strong>1. Mississippi:</strong> $631/week</li>
              <li><strong>2. Georgia:</strong> $800/week</li>
              <li><strong>3. Indiana:</strong> $828/week</li>
              <li><strong>4. Kansas:</strong> $835/week</li>
              <li><strong>5. Louisiana:</strong> $845/week</li>
            </ol>
          </div>
        </div>
        <p className="text-zinc-300 text-sm mt-4">
          The gap is massive: an injured worker earning $2,000/week would receive $1,333/week in Iowa but only $631/week in Mississippi — a <strong>$702/week</strong> difference for the same wage and injury. However, remember that the maximum only matters if your wage is high enough to hit the cap.
        </p>
      </section>

      {/* 5 */}
      <section id="special-states" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Special State Rules</h2>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-purple-400 font-semibold text-sm mb-2">Monopolistic State Fund States (4)</h4>
            <p className="text-zinc-300 text-sm mb-2">These states require all employers to buy workers&apos; comp from the state fund only — no private insurers:</p>
            <p className="text-zinc-400 text-sm"><strong>Ohio</strong> (BWC), <strong>Washington</strong> (L&I), <strong>Wyoming</strong> (DWS), <strong>North Dakota</strong> (WSI)</p>
            <p className="text-zinc-400 text-xs mt-1">This doesn&apos;t affect your benefits — just who administers them.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-orange-400 font-semibold text-sm mb-2">Texas: The Only Opt-Out State</h4>
            <p className="text-zinc-300 text-sm">
              Texas is the only state where employers can legally choose not to carry workers&apos; comp insurance. Employers who opt out (&ldquo;non-subscribers&rdquo;) lose important legal protections — injured workers can sue them directly without the usual defenses (contributory negligence, assumption of risk). About 20% of Texas employers are non-subscribers. Oklahoma had an opt-out system from 2013-2016, but it was struck down as unconstitutional.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">After-Tax Wage States</h4>
            <p className="text-zinc-300 text-sm">
              Alaska, Connecticut, Iowa, Maine, Michigan, and Rhode Island calculate benefits from <strong>after-tax (spendable) wages</strong> at higher percentages (75-80%). This often produces similar dollar amounts to the 66.67% of gross used by most states, since ~75% of gross ≈ after-tax income for most workers.
            </p>
          </div>
        </div>
      </section>

      {/* 6 */}
      <section id="benefit-types" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Types of Workers&apos; Comp Benefits</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">TTD — Temporary Total Disability</h4>
            <p className="text-zinc-300 text-sm">You can&apos;t work at all during recovery. This is the most common benefit and what our calculator estimates. Lasts until you return to work or reach MMI.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">TPD — Temporary Partial Disability</h4>
            <p className="text-zinc-300 text-sm">You can work light duty at reduced wages. Benefit = percentage of the difference between your pre-injury and current earnings.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">PPD — Permanent Partial Disability</h4>
            <p className="text-zinc-300 text-sm">You have lasting impairment after MMI but can still work. Based on impairment rating and scheduled body part values. Can be significant — 20% loss of use of an arm in NY ≈ $76K.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">PTD — Permanent Total Disability</h4>
            <p className="text-zinc-300 text-sm">You can never return to work. Benefits are typically the same rate as TTD and may last until retirement age or for life, depending on the state.</p>
          </div>
        </div>
      </section>

      {/* 7 */}
      <section id="tax" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. Tax Treatment</h2>
        <p className="text-zinc-300 mb-4">
          Workers&apos; compensation benefits are <strong>completely exempt from federal and state income tax</strong>. This is a significant benefit that most people overlook when comparing workers&apos; comp to their regular paycheck.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">The Tax-Free Advantage</h4>
          <p className="text-zinc-300 text-sm mb-2">Example: You earn $1,500/week gross. Your take-home after federal, state, and FICA taxes is approximately $1,125.</p>
          <p className="text-zinc-300 text-sm mb-2">Workers&apos; comp pays 66.67% = $1,000/week. Since it&apos;s tax-free, you keep the full $1,000.</p>
          <p className="text-zinc-300 text-sm">Your actual wage replacement: $1,000 / $1,125 = <strong>89%</strong> of your take-home pay, not the 66.67% it appears.</p>
        </div>
        <p className="text-zinc-300 text-sm">
          <strong>SSDI interaction:</strong> If you receive both workers&apos; comp and Social Security Disability Insurance (SSDI), your combined benefits cannot exceed 80% of your pre-injury earnings. If they do, SSDI is reduced — not workers&apos; comp. The SSDI portion that gets offset may become taxable.
        </p>
      </section>

      <ToolCTA name="Workers' Comp Calculator" href="/tools/workers-comp-calculator" description="Compare benefits across states and see how your wage translates to tax-free workers' comp." />

      {/* 8 */}
      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">8. Real-World Examples</h2>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 1: California — Back injury, 12 weeks off</h4>
            <p className="text-zinc-300 text-sm mb-2">Construction worker earning $1,500/week gross. Herniated disc, 12 weeks TTD.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>66.67% x $1,500 = $1,000/week</li>
              <li>Below CA max ($1,764) — full benefit applies</li>
              <li>3-day wait, 14-day retro — 12 weeks &gt; 14 days, so waiting period paid retroactively</li>
              <li><strong>Total benefits: $1,000 x 12 = $12,000 (tax-free)</strong></li>
              <li>Plus all medical bills covered separately</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 2: Mississippi — Same injury, same wage</h4>
            <p className="text-zinc-300 text-sm mb-2">Same worker, same wage ($1,500/week), same injury. But in Mississippi.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>66.67% x $1,500 = $1,000/week</li>
              <li>BUT: MS max is $631/week — capped</li>
              <li>5-day wait, 14-day retro — 12 weeks &gt; 14 days, paid retroactively</li>
              <li><strong>Total benefits: $631 x 12 = $7,572 (tax-free)</strong></li>
              <li>$4,428 less than California for the same injury and wage</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 3: Iowa — High earner, 6 weeks off</h4>
            <p className="text-zinc-300 text-sm mb-2">Software developer earning $3,000/week gross. Broken wrist, 6 weeks TTD.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Iowa uses 80% of after-tax (est. after-tax: $2,250)</li>
              <li>80% x $2,250 = $1,800/week</li>
              <li>Below IA max ($2,350) — full benefit applies</li>
              <li>3-day wait, 14-day retro — 6 weeks &gt; 14 days, paid retroactively</li>
              <li><strong>Total benefits: $1,800 x 6 = $10,800 (tax-free)</strong></li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 4: Georgia — Short injury, waiting period not retroactive</h4>
            <p className="text-zinc-300 text-sm mb-2">Warehouse worker earning $800/week. Sprained ankle, 2 weeks off (14 days).</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>66.67% x $800 = $533/week</li>
              <li>Below GA max ($800) — full benefit applies</li>
              <li>7-day wait, 21-day retro — 14 days &lt; 21 days, so waiting period NOT paid retroactively</li>
              <li>Paid days: 14 - 7 = 7 days = 1 week</li>
              <li><strong>Total benefits: $533 x 1 = $533 (tax-free)</strong></li>
              <li>Lost a full week of benefits to the non-retroactive waiting period</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom line */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          Workers&apos; comp benefits vary dramatically by state — the same $1,500/week worker receives $1,000/week in California but only $631/week in Mississippi. The tax-free nature of benefits means your actual wage replacement is higher than the headline percentage suggests. Understanding your state&apos;s maximum, waiting period, and retroactive rules helps you plan financially during recovery.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/workers-comp-calculator" className="text-blue-400 hover:text-blue-300 font-medium">Workers&apos; Comp Calculator</Link> to estimate your benefits, and don&apos;t forget that all medical treatment is covered separately with no out-of-pocket costs.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This guide and calculator provide estimates for informational purposes only. Actual benefits are determined by your state&apos;s workers&apos; compensation board based on verified wage history and medical documentation. Consult your state&apos;s workers&apos; comp board or an attorney for your specific situation.
        </p>
      </section>
    </BlogLayout>
  );
}
