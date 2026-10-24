import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How Personal Injury Settlements Are Calculated (2026 Guide)",
  slug: "personal-injury-settlement-guide",
  description: "Learn how insurance companies calculate personal injury settlements. Understand the multiplier method, state negligence rules, damage caps, and what factors increase or decrease your claim value.",
  datePublished: "2026-03-25",
  dateModified: "2026-03-25",
  tags: ["Personal Injury", "Settlement Calculator", "Car Accident", "Pain and Suffering", "Negligence", "Insurance"],
  faqs: [
    { question: "How much is my personal injury claim worth?", answer: "The value depends on your medical expenses, injury severity, lost wages, and your state's negligence rules. Insurance companies use the multiplier method: medical bills multiplied by 1.5-10x (based on severity) plus lost wages and property damage. A $15,000 medical bill with a moderate injury (3-5x multiplier) yields $45,000-$75,000 in pain and suffering, plus economic damages." },
    { question: "What is the average car accident settlement?", answer: "There is no meaningful 'average' because settlements range from $5,000 for minor fender-benders to millions for catastrophic injuries. Minor whiplash cases typically settle for $5,000-$25,000. Moderate injuries (broken bones, herniated discs) settle for $25,000-$200,000. Severe injuries requiring surgery can exceed $500,000. The specific facts of your case matter far more than averages." },
    { question: "How long does a personal injury settlement take?", answer: "Most personal injury claims settle within 6-18 months. Minor injuries with clear liability may settle in 3-6 months. Cases involving surgery, disputed liability, or high-value claims may take 1-3 years. If a lawsuit is filed, it adds 12-24 months. You should not settle until you have reached Maximum Medical Improvement (MMI) — settling too early may leave future medical costs uncovered." },
    { question: "Should I accept the first settlement offer?", answer: "Almost never. The first offer from an insurance company is typically 25-50% below the claim's actual value. Insurance adjusters are trained negotiators working to minimize payouts. At minimum, make a counter-demand. For moderate to severe injuries, consulting an attorney before accepting any offer is strongly recommended — studies show represented claimants receive 3-3.5x more, even after attorney fees." },
    { question: "What if I was partially at fault?", answer: "It depends on your state. In pure comparative negligence states (CA, NY, and 10 others), your award is reduced by your fault percentage but you can still recover. In modified comparative states (most states, including FL since 2023), you're barred at 50% or 51% fault. In Alabama, Maryland, North Carolina, Virginia, and DC, you're barred from ANY recovery if you're even 1% at fault." },
    { question: "Do I need a lawyer for a personal injury claim?", answer: "For minor soft tissue injuries with clear liability and low medical bills, you may handle it yourself. For anything involving surgery, disputed liability, permanent injury, government defendants, or medical bills over $10,000, an attorney will almost certainly increase your net recovery. Personal injury attorneys work on contingency (33-40% of the settlement), so there's no upfront cost." },
    { question: "What damages can I recover?", answer: "Economic damages include medical bills, future medical costs, lost wages, lost earning capacity, and property damage. Non-economic damages include pain and suffering, emotional distress, loss of enjoyment of life, and loss of consortium. Some states also allow punitive damages for egregious misconduct. A few states cap non-economic damages in general PI cases (CO, MD, OH, TN). Kansas and Oklahoma had caps that were struck down as unconstitutional in 2019." },
    { question: "Does property damage affect my injury settlement?", answer: "Indirectly, yes. Insurance adjusters use property damage as a proxy for impact severity. Significant vehicle damage ($8,000+) supports claims of serious injury. Low property damage ('MIST' — Minor Impact Soft Tissue cases) gives adjusters ammunition to argue injuries are minimal, even if they aren't. Photos of vehicle damage are important evidence." },
  ],
  relatedTools: [
    { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
    { name: "Child Support Calculator", href: "/tools/child-support-calculator" },
    { name: "Alimony Calculator", href: "/tools/alimony-calculator" },
  ],
  relatedArticles: [
    { title: "How Alimony Is Calculated in Every State", href: "/blog/alimony-calculator-guide" },
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
          <li><Link href="#multiplier-method" className="text-blue-400 hover:text-blue-300">1. The Multiplier Method</Link></li>
          <li><Link href="#multiplier-ranges" className="text-blue-400 hover:text-blue-300">2. Multiplier Ranges by Injury Type</Link></li>
          <li><Link href="#negligence-rules" className="text-blue-400 hover:text-blue-300">3. State Negligence Rules (All 50 States)</Link></li>
          <li><Link href="#damage-caps" className="text-blue-400 hover:text-blue-300">4. State Damage Caps</Link></li>
          <li><Link href="#factors" className="text-blue-400 hover:text-blue-300">5. Factors That Increase or Decrease Your Settlement</Link></li>
          <li><Link href="#policy-limits" className="text-blue-400 hover:text-blue-300">6. Insurance Policy Limits</Link></li>
          <li><Link href="#examples" className="text-blue-400 hover:text-blue-300">7. Real-World Settlement Examples</Link></li>
          <li><Link href="#attorney" className="text-blue-400 hover:text-blue-300">8. Do You Need a Lawyer?</Link></li>
        </ol>
      </nav>

      {/* 1. Multiplier Method */}
      <section id="multiplier-method" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. The Multiplier Method</h2>
        <p className="text-zinc-300 mb-4">
          Insurance companies use the <strong>multiplier method</strong> as the primary framework for valuing personal injury claims. The formula:
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <p className="text-lg font-mono text-blue-400 text-center">
            Settlement = Medical Bills + (Medical Bills x Multiplier) + Lost Wages + Property Damage
          </p>
        </div>
        <p className="text-zinc-300 mb-4">
          &ldquo;Medical bills&rdquo; (called <strong>special damages</strong>) include all medical expenses: ER visits, imaging, surgery, physical therapy, prescriptions, and medical equipment. The <strong>multiplier</strong> converts these into an estimate of <strong>general damages</strong> (pain and suffering, emotional distress, loss of enjoyment of life).
        </p>
        <p className="text-zinc-300 mb-4">
          In practice, insurance adjusters use proprietary software like <strong>Colossus</strong> (by CSC, now DXC Technology) that assigns point values to injury types, treatment duration, permanence, and impact on daily activities. The multiplier method is a simplified version of what these algorithms do internally.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">The Per Diem Alternative</h4>
          <p className="text-zinc-300 text-sm">
            Some attorneys use the <strong>per diem method</strong> instead: assign a daily dollar value to suffering (often pegged to daily earnings, e.g., $200/day), then multiply by recovery days. Example: $200/day x 180 days = $36,000 in pain and suffering. This works best for injuries with a clear recovery endpoint but is less common than the multiplier method.
          </p>
        </div>
      </section>

      <ToolCTA name="Personal Injury Calculator" href="/tools/personal-injury-calculator" description="Enter your medical bills, injury severity, and state to get an instant settlement estimate." />

      {/* 2. Multiplier Ranges */}
      <section id="multiplier-ranges" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. Multiplier Ranges by Injury Type</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Injury Severity</th>
                <th className="text-center py-2 text-zinc-400 font-medium">Multiplier</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Examples</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-3 font-medium">Minor / Soft Tissue</td><td className="text-center">1.5 - 3x</td><td className="py-3 text-sm text-zinc-400">Whiplash, sprains, bruising. Full recovery in weeks/months.</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-3 font-medium">Moderate</td><td className="text-center">3 - 5x</td><td className="py-3 text-sm text-zinc-400">Broken bones, disc herniation, concussion with lingering symptoms.</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-3 font-medium">Severe</td><td className="text-center">5 - 7x</td><td className="py-3 text-sm text-zinc-400">Surgery required, multiple fractures, moderate TBI.</td></tr>
              <tr><td className="py-3 font-medium">Catastrophic</td><td className="text-center">7 - 10x+</td><td className="py-3 text-sm text-zinc-400">Spinal cord injury, severe TBI, amputation, severe burns.</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">What Increases the Multiplier</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            { factor: "Surgery required", impact: "+0.5 - 1.0x" },
            { factor: "Permanent impairment rating", impact: "+1.0 - 2.0x" },
            { factor: "Objective MRI/CT findings", impact: "+0.5x" },
            { factor: "Long treatment duration", impact: "+0.5x" },
            { factor: "Visible scarring/disfigurement", impact: "+0.5 - 1.5x" },
            { factor: "Impact on daily activities", impact: "+0.5x" },
          ].map(f => (
            <div key={f.factor} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-zinc-200 font-semibold text-sm">{f.factor}</p>
              <p className="text-green-400 text-xs mt-1">{f.impact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Negligence Rules */}
      <section id="negligence-rules" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. State Negligence Rules (All 50 States)</h2>
        <p className="text-zinc-300 mb-4">
          Your state&apos;s negligence law determines how your fault percentage affects your settlement. There are four categories:
        </p>

        <div className="space-y-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-bold text-sm mb-2">Pure Comparative Negligence (12 states)</h4>
            <p className="text-zinc-300 text-sm mb-2">You can recover even at 99% fault, reduced by your fault percentage.</p>
            <p className="text-zinc-400 text-xs">Alaska, Arizona, California, Kentucky, Louisiana, Mississippi, Missouri, New Mexico, New York, Rhode Island, South Dakota, Washington</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-blue-400 font-bold text-sm mb-2">Modified Comparative - 51% Bar (23 states)</h4>
            <p className="text-zinc-300 text-sm mb-2">Barred if you are 51% or more at fault. At 50% fault, you can still recover (at 50% reduction).</p>
            <p className="text-zinc-400 text-xs">Connecticut, Delaware, Florida, Hawaii, Illinois, Indiana, Iowa, Massachusetts, Michigan, Minnesota, Montana, Nevada, New Hampshire, New Jersey, Ohio, Oklahoma, Oregon, Pennsylvania, South Carolina, Texas, Vermont, Wisconsin, Wyoming</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-yellow-400 font-bold text-sm mb-2">Modified Comparative - 50% Bar (11 states)</h4>
            <p className="text-zinc-300 text-sm mb-2">Barred if you are 50% or more at fault. Stricter than the 51% bar — at exactly 50%, you cannot recover.</p>
            <p className="text-zinc-400 text-xs">Arkansas, Colorado, Georgia, Idaho, Kansas, Maine, Nebraska, North Dakota, Tennessee, Utah, West Virginia</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-bold text-sm mb-2">Pure Contributory Negligence (4 states + DC)</h4>
            <p className="text-zinc-300 text-sm mb-2">You are <strong>completely barred</strong> from recovery if you are even 1% at fault. The harshest rule.</p>
            <p className="text-zinc-400 text-xs">Alabama, District of Columbia, Maryland, North Carolina, Virginia</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">Florida Changed in 2023</h4>
          <p className="text-zinc-300 text-sm">
            Florida switched from pure comparative to <strong>modified comparative (51% bar)</strong> under HB 837, effective March 24, 2023. This means Florida claimants who are 51% or more at fault are now barred from recovery entirely — a significant change from the previous rule that allowed recovery at any fault level.
          </p>
        </div>
      </section>

      <ToolCTA name="Personal Injury Calculator" href="/tools/personal-injury-calculator" description="See how your state's negligence rule affects your settlement. Adjust fault percentage in real time." />

      {/* 4. Damage Caps */}
      <section id="damage-caps" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. State Damage Caps</h2>
        <p className="text-zinc-300 mb-4">
          A critical distinction: <strong>most states that cap non-economic damages do so only in medical malpractice cases, NOT in general personal injury cases</strong> (car accidents, slip and falls, etc.). Only 4 states currently have enforceable caps on general PI non-economic damages (Kansas and Oklahoma had caps struck down as unconstitutional in 2019):
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">State</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Non-Economic Cap</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Colorado</td><td className="py-2">$1,500,000</td><td className="py-2 text-zinc-400 text-xs">Raised Jan 2025 (HB 24-1472). Inflation-adjusted biennially from 2028.</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Maryland</td><td className="py-2">$965,000</td><td className="py-2 text-zinc-400 text-xs">2026 figure. Increases $15,000/year. Applies to all PI, not just med mal.</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2 font-medium">Ohio</td><td className="py-2">$250K-$350K</td><td className="py-2 text-zinc-400 text-xs">Greater of $250K or 3x economic. Does not apply to permanent injuries.</td></tr>
              <tr><td className="py-2 font-medium">Tennessee</td><td className="py-2">$750,000</td><td className="py-2 text-zinc-400 text-xs">$1M for catastrophic injuries.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-zinc-300 text-sm">
          All other states have <strong>no cap</strong> on non-economic damages in general personal injury cases (including Kansas and Oklahoma, whose caps were struck down by their state supreme courts in 2019). Economic damages (medical bills, lost wages) are never capped.
        </p>
      </section>

      {/* 5. Factors */}
      <section id="factors" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Factors That Increase or Decrease Your Settlement</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-3">Increases Value</h4>
            <ul className="text-zinc-300 text-sm space-y-1.5">
              <li><strong>Surgery required</strong> — 2-5x higher than conservative treatment</li>
              <li><strong>Permanent impairment rating</strong> — even 5-10% AMA rating</li>
              <li><strong>Visible scarring/disfigurement</strong> — especially face/hands</li>
              <li><strong>Objective diagnostic evidence</strong> — MRI, CT, EMG findings</li>
              <li><strong>Clear liability</strong> — rear-end, DUI, red light</li>
              <li><strong>Significant property damage</strong> — correlates with severity</li>
              <li><strong>Clean prior medical history</strong> — easier causation</li>
              <li><strong>Multiple defendants / commercial vehicles</strong></li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-3">Decreases Value</h4>
            <ul className="text-zinc-300 text-sm space-y-1.5">
              <li><strong>Treatment gaps</strong> — 2+ week gaps are devastating</li>
              <li><strong>Low property damage</strong> — &ldquo;MIST&rdquo; cases get lowballed</li>
              <li><strong>Pre-existing conditions</strong> — adjusters blame the pre-existing</li>
              <li><strong>Social media contradictions</strong> — photos of activity</li>
              <li><strong>Prior injury claims</strong> — reduces credibility</li>
              <li><strong>Your percentage of fault</strong> — direct reduction</li>
              <li><strong>Chiropractic-only treatment</strong> — less weight than MD</li>
              <li><strong>Inconsistent medical records</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Policy Limits */}
      <section id="policy-limits" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Insurance Policy Limits</h2>
        <p className="text-zinc-300 mb-4">
          The defendant&apos;s insurance policy limit is often the <strong>practical ceiling</strong> on your recovery, regardless of your case&apos;s theoretical value. If your case is worth $500,000 but the defendant only has $50,000 in liability coverage, you&apos;ll likely recover only $50,000 unless the defendant has significant personal assets (most don&apos;t).
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <h4 className="text-zinc-200 font-semibold text-sm mb-2">State Minimum Auto Insurance Requirements</h4>
          <p className="text-zinc-300 text-sm mb-2">
            Many states have surprisingly low minimum liability limits:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {[
              { state: "California", min: "$30,000" },
              { state: "Florida", min: "$10,000 PIP" },
              { state: "Texas", min: "$30,000" },
              { state: "New York", min: "$25,000" },
              { state: "Illinois", min: "$25,000" },
              { state: "Pennsylvania", min: "$15,000" },
            ].map(s => (
              <div key={s.state} className="bg-zinc-800 rounded-lg p-2">
                <p className="text-zinc-300 font-medium text-xs">{s.state}</p>
                <p className="text-zinc-400 text-xs">{s.min}/person</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-zinc-300 text-sm">
          <strong>Underinsured Motorist (UIM) coverage</strong> on your own policy can supplement the gap. If you have $250,000 in UIM and the defendant only has $50,000 in liability, your UIM covers the additional $200,000. Carrying high UIM limits is one of the best financial decisions you can make.
        </p>
      </section>

      <ToolCTA name="Personal Injury Calculator" href="/tools/personal-injury-calculator" description="Factor in policy limits and see how they cap your recovery." />

      {/* 7. Examples */}
      <section id="examples" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. Real-World Settlement Examples</h2>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 1: Minor Whiplash — California</h4>
            <p className="text-zinc-300 text-sm mb-2">Rear-end collision. $5,000 in medical bills (ER, chiropractic, PT). No lost wages. $3,000 vehicle damage. No fault.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Medical bills x 2.0 multiplier = $10,000 (pain & suffering)</li>
              <li>Special damages: $5,000 + $3,000 = $8,000</li>
              <li><strong>Estimated settlement: $18,000</strong></li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 2: Broken Leg with Surgery — Texas</h4>
            <p className="text-zinc-300 text-sm mb-2">T-bone collision. $45,000 in medical bills (ER, surgery, hardware, PT). $12,000 lost wages. $15,000 vehicle totaled. 0% fault.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Medical bills x 5.5 multiplier (surgery + moderate) = $247,500 (pain & suffering)</li>
              <li>Special damages: $45,000 + $12,000 + $15,000 = $72,000</li>
              <li>Total: $319,500</li>
              <li>Defendant has $100,000 policy limit</li>
              <li><strong>Practical recovery: $100,000</strong> (limited by policy)</li>
              <li>UIM coverage on your policy could cover the gap</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 3: Herniated Disc — North Carolina (Contributory Negligence)</h4>
            <p className="text-zinc-300 text-sm mb-2">Intersection collision. $30,000 in medical bills. $8,000 lost wages. Police report says you were 10% at fault.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Medical bills x 4.0 multiplier = $120,000 (pain & suffering)</li>
              <li>Special damages: $30,000 + $8,000 = $38,000</li>
              <li>Total: $158,000</li>
              <li>BUT: NC uses <strong>pure contributory negligence</strong></li>
              <li><strong>Recovery: $0</strong> — 10% fault completely bars the claim</li>
              <li>This is why contributory negligence states are so harsh</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-200 font-semibold mb-2">Example 4: Spinal Cord Injury — New York</h4>
            <p className="text-zinc-300 text-sm mb-2">Head-on collision. $250,000 medical bills to date. $500,000 estimated future medical. $80,000 lost wages. $200,000 future lost earning capacity. 15% fault.</p>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Total medical: $750,000 x 8.0 multiplier = $6,000,000 (pain & suffering)</li>
              <li>Special damages: $750,000 + $280,000 = $1,030,000</li>
              <li>Total: $7,030,000</li>
              <li>NY pure comparative: 15% reduction = -$1,054,500</li>
              <li><strong>Estimated recovery: ~$5,975,000</strong></li>
              <li>Would require high-limit policy or multiple defendants</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Attorney */}
      <section id="attorney" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">8. Do You Need a Lawyer?</h2>
        <p className="text-zinc-300 mb-4">
          Insurance Research Council data consistently shows that <strong>represented claimants receive 3-3.5x more</strong> in settlements than unrepresented claimants, even after attorney fees (typically 33% pre-litigation, 40% post-litigation).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Handle It Yourself If:</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Minor soft tissue injury (full recovery)</li>
              <li>Clear liability (rear-end, etc.)</li>
              <li>Medical bills under $5,000</li>
              <li>No disputed facts</li>
              <li>No permanent injury</li>
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Get a Lawyer If:</h4>
            <ul className="text-zinc-300 text-sm space-y-1">
              <li>Surgery required or recommended</li>
              <li>Medical bills over $10,000</li>
              <li>Disputed liability or shared fault</li>
              <li>Permanent injury or impairment</li>
              <li>Government defendant (short deadlines)</li>
              <li>Insurance company denying claim</li>
              <li>Contributory negligence state (AL, MD, NC, VA, DC)</li>
            </ul>
          </div>
        </div>
        <p className="text-zinc-300 text-sm">
          Personal injury attorneys work on <strong>contingency</strong> — they only get paid if you win. There is no upfront cost. If your case has no value, they won&apos;t take it. If they do take it, that&apos;s a signal your claim has merit.
        </p>
      </section>

      {/* Bottom line */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          Personal injury settlement values are driven by three main factors: the severity of your injuries (which determines the multiplier), your state&apos;s negligence rules (which determine how fault affects recovery), and the available insurance coverage (which sets the practical ceiling). The same injury can be worth $150,000 in California and $0 in North Carolina if fault is involved.
        </p>
        <p className="text-zinc-300 mb-3">
          Use our <Link href="/tools/personal-injury-calculator" className="text-blue-400 hover:text-blue-300 font-medium">Personal Injury Settlement Calculator</Link> to estimate your claim value, then consult a personal injury attorney for a case-specific evaluation. Most offer free consultations and work on contingency — there is no financial risk in getting a professional opinion.
        </p>
        <p className="text-zinc-400 text-sm italic">
          Disclaimer: This guide and calculator provide estimates for informational purposes only. They are not legal advice. Actual settlements depend on the specific facts of your case and are determined by negotiation or jury verdict.
        </p>
      </section>
    </BlogLayout>
  );
}
