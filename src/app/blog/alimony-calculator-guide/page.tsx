import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How Alimony Is Calculated in Every State (2026 Guide)",
  slug: "alimony-calculator-guide",
  description: "Learn how alimony (spousal support) is calculated in all 50 states. Understand which states have formulas, duration limits, caps, and recent reforms — with real examples and state-by-state rules.",
  datePublished: "2026-03-21",
  dateModified: "2026-03-21",
  tags: ["Alimony", "Spousal Support", "Alimony Calculator", "Family Law", "Divorce", "Alimony by State"],
  faqs: [
    { question: "How much alimony will I pay?", answer: "Alimony depends on your state, both spouses' incomes, marriage length, and many other factors. States with formulas (like New York and Illinois) produce specific amounts. In discretion states, judges consider income disparity, earning capacity, age, health, and standard of living during the marriage. Use our calculator for a state-specific estimate." },
    { question: "Is alimony always awarded in divorce?", answer: "No. Alimony is not automatic. It's typically awarded when there is a significant income disparity between spouses and the lower-earning spouse cannot maintain a reasonable standard of living independently. Short marriages (under 5 years) with no children and both spouses working rarely result in alimony. Texas and Indiana are particularly restrictive." },
    { question: "Can alimony be avoided?", answer: "A prenuptial or postnuptial agreement can limit or waive alimony if properly drafted and both parties had independent legal counsel. Without an agreement, the court decides based on state law and the circumstances of the divorce. Some states allow couples to agree on alimony terms in a settlement, which may differ from what a court would order." },
    { question: "Does alimony end if my ex remarries?", answer: "In most states, yes — alimony automatically terminates when the recipient remarries. Many states also allow reduction or termination if the recipient cohabitates with a new partner (Massachusetts requires cohabitation of 3+ months). Lump-sum alimony and some contractual agreements survive remarriage." },
    { question: "Is alimony tax-deductible?", answer: "Not for divorce agreements executed after December 31, 2018. Under the Tax Cuts and Jobs Act, alimony is no longer deductible for the payor or taxable for the recipient. Agreements from before 2019 retain the old tax treatment unless modified to adopt the new rules." },
    { question: "What happens if I can't afford alimony payments?", answer: "You can petition the court for a modification based on a substantial change in circumstances (job loss, disability, retirement). Until modified, the original order remains in effect — you cannot unilaterally stop paying. Falling behind can result in wage garnishment, contempt of court, and other enforcement actions." },
    { question: "How is alimony different from child support?", answer: "Child support is for the children's expenses and is determined by specific formulas in every state. Alimony is for the lower-earning spouse's support and is more discretionary. Child support typically ends at age 18, while alimony duration varies. They are calculated separately, though some state formulas adjust alimony when child support is also being paid." },
    { question: "Which states recently reformed their alimony laws?", answer: "Florida eliminated permanent alimony in 2023. Massachusetts capped duration and added retirement-age termination in 2011. New Jersey renamed permanent alimony to 'open durational' and capped shorter marriages in 2014. Arizona revised its advisory guidelines in 2025. Utah codified that duration cannot exceed marriage length in 2024. New Hampshire adopted its 23% formula in 2019." },
  ],
  relatedTools: [
    { name: "Alimony Calculator", href: "/tools/alimony-calculator" },
    { name: "Child Support Calculator", href: "/tools/child-support-calculator" },
    { name: "Salary Calculator", href: "/tools/salary-calculator" },
    { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
  ],
  relatedArticles: [
    { title: "How Child Support Is Calculated in Every State", href: "/blog/child-support-calculator-guide" },
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
          <li><Link href="#how-states-calculate" className="text-blue-400 hover:text-blue-300">1. How States Calculate Alimony</Link></li>
          <li><Link href="#formula-states" className="text-blue-400 hover:text-blue-300">2. Formula States: NY, IL, NH, CO, PA</Link></li>
          <li><Link href="#cap-states" className="text-blue-400 hover:text-blue-300">3. Cap States: TX, FL, MA, LA</Link></li>
          <li><Link href="#local-formulas" className="text-blue-400 hover:text-blue-300">4. Local Formulas: CA, MI, VA, NV</Link></li>
          <li><Link href="#duration" className="text-blue-400 hover:text-blue-300">5. How Long Alimony Lasts</Link></li>
          <li><Link href="#reforms" className="text-blue-400 hover:text-blue-300">6. Recent Alimony Reforms</Link></li>
          <li><Link href="#tax" className="text-blue-400 hover:text-blue-300">7. Tax Treatment of Alimony</Link></li>
          <li><Link href="#examples" className="text-blue-400 hover:text-blue-300">8. Real-World Examples</Link></li>
        </ol>
      </nav>

      {/* ─── 1. How States Calculate ─── */}
      <section id="how-states-calculate" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. How States Calculate Alimony</h2>
        <p className="text-zinc-300 mb-4">
          Unlike child support, which has statutory formulas in every state, alimony calculation is far less standardized. States fall into roughly four categories:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-green-400 font-bold text-sm mb-2">Formula States (~5)</h3>
            <p className="text-zinc-300 text-sm">NY, IL, NH, CO, PA have statutory formulas that produce a specific dollar amount. These are the most predictable.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-orange-400 font-bold text-sm mb-2">Cap-Only States (~4)</h3>
            <p className="text-zinc-300 text-sm">TX, FL, MA, LA set a maximum amount or percentage but no minimum. The court decides the actual amount up to the cap.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-yellow-400 font-bold text-sm mb-2">Local Formula States (~5)</h3>
            <p className="text-zinc-300 text-sm">CA, MI, VA, NV, KS have county-level guidelines used in practice but not codified in state law.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-zinc-400 font-bold text-sm mb-2">Discretion States (~36)</h3>
            <p className="text-zinc-300 text-sm">Most states give judges broad discretion using statutory factors like income, marriage length, health, and earning capacity.</p>
          </div>
        </div>
      </section>

      <ToolCTA name="Alimony Calculator" href="/tools/alimony-calculator" description="Get a state-specific estimate of your alimony payment in under 60 seconds." />

      {/* ─── 2. Formula States ─── */}
      <section id="formula-states" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. Formula States: NY, IL, NH, CO, PA</h2>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">New York</h3>
            <p className="text-zinc-300 text-sm mb-2">New York has the most detailed statutory formula (DRL Section 236B):</p>
            <p className="text-zinc-300 text-sm mb-2"><strong>Without child support:</strong> Calculate both (a) 30% of payor&apos;s income minus 20% of payee&apos;s income, and (b) 40% of combined income minus payee&apos;s income. The award is the <strong>lower</strong> of the two.</p>
            <p className="text-zinc-300 text-sm mb-2"><strong>With child support:</strong> Same structure but with 20%/25% instead of 30%/20%.</p>
            <p className="text-zinc-300 text-sm">Income cap: <strong>$241,000/year</strong> (effective March 2026). Duration: 15-50% of marriage length depending on how long the marriage lasted.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Illinois</h3>
            <p className="text-zinc-300 text-sm mb-2">Formula: <strong>33.33% of payor&apos;s net income minus 25% of payee&apos;s net income</strong></p>
            <p className="text-zinc-300 text-sm mb-2">Cannot exceed <strong>40% of combined net income</strong>. Applies only when combined gross is under $500,000.</p>
            <p className="text-zinc-300 text-sm">Duration multipliers: 20% of marriage length for 0-5 years, scaling up to 80% for 15-20 years. Marriages over 20 years may get indefinite support.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">New Hampshire</h3>
            <p className="text-zinc-300 text-sm mb-2">Formula: <strong>23% of the difference between parties&apos; gross incomes</strong></p>
            <p className="text-zinc-300 text-sm">Cannot exceed payee&apos;s reasonable need. Maximum duration: 50% of the marriage length. The 23% rate was set post-TCJA (would revert to 30% if alimony becomes tax-deductible again).</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Colorado</h3>
            <p className="text-zinc-300 text-sm mb-2">Advisory formula: <strong>40% of higher earner&apos;s AGI minus 50% of lower earner&apos;s AGI</strong></p>
            <p className="text-zinc-300 text-sm mb-2">Tiered adjustment: multiply result by 80% (combined under $10K/mo) or 75% ($10K-$20K/mo). Applies under $240K combined annual.</p>
            <p className="text-zinc-300 text-sm">Duration scales from 31% of marriage length at 3 years to 50% at 12.5+ years. Minimum 3 years of marriage required.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Pennsylvania</h3>
            <p className="text-zinc-300 text-sm mb-2"><strong>Important:</strong> PA&apos;s formula applies only to spousal support and APL (during proceedings) — NOT post-divorce alimony.</p>
            <p className="text-zinc-300 text-sm mb-2">Without children: <strong>33% of payor&apos;s net minus 40% of payee&apos;s net</strong></p>
            <p className="text-zinc-300 text-sm">With children: <strong>25% of payor&apos;s net minus 30% of payee&apos;s net</strong> (reduced because child support is also being paid)</p>
          </div>
        </div>
      </section>

      {/* ─── 3. Cap States ─── */}
      <section id="cap-states" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. Cap States: TX, FL, MA, LA</h2>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Texas</h3>
            <p className="text-zinc-300 text-sm mb-2">One of the <strong>most restrictive</strong> states for alimony. Must meet strict eligibility: marriage of 10+ years AND inability to self-support, or disability/domestic violence.</p>
            <p className="text-zinc-300 text-sm mb-2">Cap: <strong>Lesser of $5,000/month or 20% of payor&apos;s gross income</strong></p>
            <p className="text-zinc-300 text-sm">Duration: 10-20 year marriage = max 5 years. 20-30 years = max 7 years. 30+ years = max 10 years.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Florida (Reformed 2023)</h3>
            <p className="text-zinc-300 text-sm mb-2"><strong>Permanent alimony was eliminated</strong> effective July 1, 2023 (SB 1416). Now only durational, rehabilitative, and bridge-the-gap alimony are available.</p>
            <p className="text-zinc-300 text-sm mb-2">Cap: <strong>35% of the difference in net incomes</strong></p>
            <p className="text-zinc-300 text-sm">Duration: Under 10 years = max 50% of marriage. 10-20 years = max 60%. 20+ years = max 75%. No durational alimony for marriages under 3 years.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Massachusetts</h3>
            <p className="text-zinc-300 text-sm mb-2">Cap: <strong>30-35% of the difference in gross incomes</strong> (practitioners often use 22-28% post-TCJA since alimony is no longer tax-deductible)</p>
            <p className="text-zinc-300 text-sm">Duration: 50% of marriage (0-5 yrs), 60% (5-10), 70% (10-15), 80% (15-20). 20+ years: court discretion. Terminates at recipient&apos;s remarriage or either party reaching Social Security retirement age (currently 67).</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-3">Louisiana</h3>
            <p className="text-zinc-300 text-sm">Cap: <strong>One-third (1/3) of payor&apos;s net income</strong>. Exception for domestic violence cases. Ends at remarriage or death.</p>
          </div>
        </div>
      </section>

      <ToolCTA name="Alimony Calculator" href="/tools/alimony-calculator" description="Select your state and get an instant estimate with formula breakdown." />

      {/* ─── 4. Local Formulas ─── */}
      <section id="local-formulas" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Local Formulas: CA, MI, VA, NV</h2>
        <p className="text-zinc-300 mb-4">
          These states have no statutory formula, but local courts have developed informal guidelines that are widely used — especially for temporary (pendente lite) support:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">State</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Local Formula</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Scope</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-medium">California</td>
                <td className="py-2">40% payor net - 50% payee net (Santa Clara guideline)</td>
                <td className="py-2 text-zinc-400 text-xs">Temporary support only</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-medium">Michigan</td>
                <td className="py-2">25% payor income - 35% recipient income (Oakland County)</td>
                <td className="py-2 text-zinc-400 text-xs">Starting point, not binding</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-medium">Virginia</td>
                <td className="py-2">27% higher gross - 50% lower gross (no kids); 26%/58% (kids)</td>
                <td className="py-2 text-zinc-400 text-xs">Pendente lite only</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-medium">Nevada</td>
                <td className="py-2">Tonopah formula: cumulative % based on marriage, age, education</td>
                <td className="py-2 text-zinc-400 text-xs">Clark County practice</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Kansas</td>
                <td className="py-2">20% of income difference (Johnson County)</td>
                <td className="py-2 text-zinc-400 text-xs">Local guideline only</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">California&apos;s 10-Year Rule</h4>
          <p className="text-zinc-300 text-sm">
            A widely misunderstood rule: for marriages of <strong>10+ years</strong>, the court retains jurisdiction over spousal support <strong>indefinitely</strong>. This does NOT guarantee lifetime alimony — it means the court can revisit the issue at any time. For marriages under 10 years, the guideline is support lasting approximately half the marriage length.
          </p>
        </div>
      </section>

      {/* ─── 5. Duration ─── */}
      <section id="duration" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. How Long Alimony Lasts</h2>
        <p className="text-zinc-300 mb-4">
          Duration varies dramatically by state. Here are the key patterns:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">State</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Duration Rule</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Texas</td><td className="py-2">5-10 years max (depending on marriage length)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Indiana</td><td className="py-2">Max 3 years (rehabilitative only)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Florida</td><td className="py-2">50-75% of marriage (no permanent)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Massachusetts</td><td className="py-2">50-80% of marriage; ends at retirement age</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">New Hampshire</td><td className="py-2">Max 50% of marriage length</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Utah</td><td className="py-2">Cannot exceed marriage length</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Kansas</td><td className="py-2">Max 121 months (10 years, 1 month)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">New Jersey</td><td className="py-2">Under 20 yrs: cannot exceed marriage. 20+ yrs: open durational</td></tr>
              <tr><td className="py-2 font-medium">California</td><td className="py-2">Under 10 yrs: ~half marriage. 10+ yrs: indefinite jurisdiction</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── 6. Reforms ─── */}
      <section id="reforms" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Recent Alimony Reforms</h2>
        <p className="text-zinc-300 mb-4">
          Several states have significantly reformed their alimony laws in recent years, generally moving toward shorter durations and eliminating permanent alimony:
        </p>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-1">Florida (2023) — SB 1416</h4>
            <p className="text-zinc-300 text-sm">Eliminated permanent alimony entirely. Created durational caps (50-75% of marriage). Rehabilitative capped at 5 years. Bridge-the-gap limited to 2 years. Payors can petition to reduce at reasonable retirement age.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-1">Massachusetts (2011) — Alimony Reform Act</h4>
            <p className="text-zinc-300 text-sm">Created four alimony types. Capped duration at 50-80% of marriage length. Alimony terminates at payor&apos;s Social Security retirement age (67). Cohabitation of 3+ months can trigger termination.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-1">New Jersey (2014) — Bill A-845</h4>
            <p className="text-zinc-300 text-sm">Renamed &ldquo;permanent alimony&rdquo; to &ldquo;open durational alimony.&rdquo; For marriages under 20 years, duration generally cannot exceed marriage length. Retirement creates presumptive termination.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-1">Arizona (2025) — Revised Guidelines</h4>
            <p className="text-zinc-300 text-sm">New advisory guidelines effective September 2025. Income adjustment threshold raised from $100K to $175K. Max duration for 16+ year marriages increased to 12 years or 50% of marriage. Rule of 65: age + marriage years &ge; 65 may qualify for indefinite support.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-1">Utah (2024) — HB 220</h4>
            <p className="text-zinc-300 text-sm">Codified that alimony duration cannot exceed the length of the marriage. Recipients must demonstrate earnest efforts to become self-supporting.</p>
          </div>
        </div>
      </section>

      {/* ─── 7. Tax ─── */}
      <section id="tax" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. Tax Treatment of Alimony</h2>
        <p className="text-zinc-300 mb-4">
          The Tax Cuts and Jobs Act of 2017 fundamentally changed how alimony is taxed:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Agreements After Dec 31, 2018</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Not deductible for the payor</li>
              <li>Not taxable income for the recipient</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Agreements Before Jan 1, 2019</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Deductible for the payor</li>
              <li>Taxable income for the recipient</li>
              <li>Unless modified to adopt new rules</li>
            </ul>
          </div>
        </div>
        <p className="text-zinc-300 text-sm">
          This change significantly impacts the effective cost of alimony. Before TCJA, a payor in the 32% tax bracket paying $3,000/month in alimony effectively paid ~$2,040 after the tax deduction. Now they pay the full $3,000. New Hampshire&apos;s 23% formula rate (vs. 30% pre-TCJA) directly accounts for this change.
        </p>
      </section>

      <ToolCTA name="Alimony Calculator" href="/tools/alimony-calculator" description="Enter both incomes and marriage length to see your estimated alimony by state." />

      {/* ─── 8. Examples ─── */}
      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">8. Real-World Examples</h2>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 1: New York — 15-year marriage, no child support</h4>
            <p className="text-zinc-300 text-sm mb-2">Higher earner: $10,000/month gross. Lower earner: $4,000/month gross.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Formula (a): 30% x $120,000 - 20% x $48,000 = $36,000 - $9,600 = $26,400/yr</li>
              <li>Formula (b): 40% x $168,000 - $48,000 = $67,200 - $48,000 = $19,200/yr</li>
              <li>Award = lower: <strong>$19,200/yr = $1,600/month</strong></li>
              <li>Duration: ~4-6 years (30-40% of 15 years)</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 2: Illinois — 10-year marriage</h4>
            <p className="text-zinc-300 text-sm mb-2">Higher earner: $8,000/month net. Lower earner: $2,500/month net.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>33.33% x $8,000 = $2,667</li>
              <li>25% x $2,500 = $625</li>
              <li>Raw: $2,667 - $625 = $2,042</li>
              <li>40% cap: 40% x $10,500 = $4,200 (not triggered)</li>
              <li><strong>Monthly alimony: $2,042</strong></li>
              <li>Duration: 40% x 10 years = 4 years</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 3: Texas — 25-year marriage</h4>
            <p className="text-zinc-300 text-sm mb-2">Higher earner: $12,000/month gross. Lower earner: $2,000/month gross.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>20% of $12,000 = $2,400</li>
              <li>Cap: $5,000/month</li>
              <li><strong>Maximum alimony: $2,400/month</strong> (20% is less than $5K cap)</li>
              <li>Duration: max 7 years (20-30 year marriage category)</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 4: Florida — 12-year marriage (post-2023 reform)</h4>
            <p className="text-zinc-300 text-sm mb-2">Higher earner: $7,000/month net. Lower earner: $3,000/month net.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Net income difference: $4,000</li>
              <li>35% cap: $1,400/month maximum</li>
              <li>Actual award: up to <strong>$1,400/month</strong> (court determines actual amount)</li>
              <li>Duration: max 60% of 12 years = 7.2 years</li>
              <li>No permanent alimony available (eliminated 2023)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Bottom line ─── */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          Alimony is far less predictable than child support. The same couple could see dramatically different outcomes depending on their state — from $0 in Texas (if married under 10 years) to thousands per month in New York or California. The trend across the country is toward shorter durations, elimination of permanent alimony, and more formula-based approaches.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/alimony-calculator" className="text-blue-400 hover:text-blue-300 font-medium">Alimony Calculator</Link> for a quick estimate, then consult a family law attorney. The calculator shows you the formula your state uses and how it applies to your situation, but judges have significant discretion to deviate based on circumstances no calculator can capture.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This guide and calculator provide estimates for informational purposes only. They are not legal advice. Actual alimony awards are determined by courts and may differ from these estimates.
        </p>
      </section>
    </BlogLayout>
  );
}
