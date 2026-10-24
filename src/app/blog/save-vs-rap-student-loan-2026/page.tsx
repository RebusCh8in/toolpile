import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "SAVE Plan Is Dead: How RAP Changes Your Student Loan Payments in 2026",
  slug: "save-vs-rap-student-loan-2026",
  description: "The SAVE student loan plan was struck down on March 9, 2026. The new Repayment Assistance Plan (RAP) launches July 1 with higher payments for most borrowers. Here's exactly how much more you'll pay and what to do next.",
  datePublished: "2026-03-17",
  dateModified: "2026-03-17",
  tags: ["SAVE Plan", "RAP Plan", "Student Loan Repayment", "Repayment Assistance Plan", "Student Loans 2026", "IDR Plans"],
  faqs: [
    { question: "What happened to the SAVE plan?", answer: "The SAVE plan was struck down by the 8th Circuit Court of Appeals on March 9, 2026. A lawsuit brought by seven Republican-led states (Missouri, Arkansas, Florida, Georgia, North Dakota, Ohio, Oklahoma) argued that the Biden administration exceeded its authority in creating SAVE. The Trump administration agreed to a settlement halting all SAVE enrollment and forgiveness. Borrowers who were on SAVE have been in administrative forbearance since mid-2024." },
    { question: "What is the RAP plan for student loans?", answer: "RAP (Repayment Assistance Plan) is the new income-driven repayment plan created by the One Big Beautiful Bill Act (OBBBA, Public Law 119-21). It launches July 1, 2026, and replaces SAVE as the primary IDR option for new loans. RAP uses a sliding scale based on raw AGI (1-10% depending on income bracket) rather than discretionary income. Forgiveness occurs after 30 years of payments." },
    { question: "How are RAP payments calculated?", answer: "RAP payments are based on your adjusted gross income (AGI) using a sliding scale: $0-$10K AGI = $10/month, $10,001-$20K = 1%, $20,001-$30K = 2%, $30,001-$40K = 3%, $40,001-$50K = 4%, $50,001-$60K = 5%, $60,001-$70K = 6%, $70,001-$80K = 7%, $80,001-$90K = 8%, $90,001-$100K = 9%, over $100K = 10%. The percentage is applied to your full AGI and divided by 12. You also get a $50/month reduction per dependent." },
    { question: "Will I pay more under RAP than I did under SAVE?", answer: "Most borrowers with incomes above approximately $30,000 will pay more under RAP than under SAVE. The biggest reason is that SAVE excluded 225% of the federal poverty level from your income before calculating payments (about $35,910 for a single person), while RAP uses your raw AGI with no exclusion. For example, a single borrower earning $50,000 would pay about $59/month under SAVE but $167/month under RAP." },
    { question: "Can I still use IBR instead of RAP?", answer: "Yes. Income-Based Repayment (IBR) is still available for existing federal student loans originated before July 1, 2026. IBR New (for loans after July 1, 2014) charges 10% of discretionary income above 150% of FPL with 20-year forgiveness. IBR Old charges 15% with 25-year forgiveness. The OBBBA removed the partial financial hardship requirement, so everyone can now enroll in IBR regardless of income. For some borrowers, IBR may result in lower payments than RAP." },
    { question: "What happens if I do nothing as a SAVE borrower?", answer: "If you are currently in SAVE forbearance and do nothing, you will be automatically enrolled in the RAP plan when it launches on July 1, 2026. Your payments will be calculated based on your most recent tax return AGI. Interest has been accruing during the forbearance period, but it will not capitalize when you transition to RAP." },
    { question: "Is RAP forgiveness taxable?", answer: "Yes. RAP forgiveness after 30 years of payments is taxable as ordinary income. The American Rescue Plan provision that made student loan forgiveness tax-free expired on January 1, 2026, and the OBBBA did not create a new tax exclusion for RAP. You will receive a 1099-C for the forgiven amount. The insolvency exclusion under IRC 108(a)(1)(B) may help reduce or eliminate the tax bill." },
    { question: "Does RAP have an interest subsidy?", answer: "Yes. Like SAVE, RAP provides a 100% interest subsidy, meaning your balance will never grow due to unpaid interest. Additionally, RAP includes a $50/month government principal match, which means the government contributes $50 per month toward your principal balance on top of your regular payment. Your loan balance will never increase under RAP." },
  ],
  relatedTools: [
    { name: "SAVE vs RAP Calculator", href: "/tools/save-vs-rap-calculator" },
    { name: "Student Loan Tax Bomb Calculator", href: "/tools/student-loan-tax-bomb-calculator" },
    { name: "Student Loan Calculator", href: "/tools/student-loan-calculator" },
    { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
  ],
  relatedArticles: [
    { title: "Student Loan Tax Bomb 2026: How Much You'll Owe and How to Prepare", href: "/blog/student-loan-tax-bomb-2026" },
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
          <li><Link href="#what-happened-to-save" className="text-blue-400 hover:text-blue-300">What Happened to the SAVE Plan?</Link></li>
          <li><Link href="#what-is-rap" className="text-blue-400 hover:text-blue-300">What Is RAP (Repayment Assistance Plan)?</Link></li>
          <li><Link href="#how-rap-payments-calculated" className="text-blue-400 hover:text-blue-300">How RAP Payments Are Calculated</Link></li>
          <li><Link href="#save-vs-rap-comparison" className="text-blue-400 hover:text-blue-300">SAVE vs RAP: Side-by-Side Comparison</Link></li>
          <li><Link href="#who-pays-more" className="text-blue-400 hover:text-blue-300">Who Pays More Under RAP?</Link></li>
          <li><Link href="#30-year-forgiveness" className="text-blue-400 hover:text-blue-300">The 30-Year Forgiveness Problem</Link></li>
          <li><Link href="#what-about-ibr" className="text-blue-400 hover:text-blue-300">What About IBR?</Link></li>
          <li><Link href="#what-to-do-now" className="text-blue-400 hover:text-blue-300">What SAVE Borrowers Should Do Right Now</Link></li>
          <li><Link href="#faq" className="text-blue-400 hover:text-blue-300">FAQ</Link></li>
        </ol>
      </nav>

      <p>
        On March 9, 2026, the SAVE plan &mdash; the most generous income-driven repayment plan ever created for federal student loans &mdash; was officially struck down. More than 7 million borrowers who enrolled in SAVE are now in limbo, stuck in administrative forbearance with interest accruing and no clear path forward.
      </p>
      <p>
        The replacement is called <strong>RAP (Repayment Assistance Plan)</strong>, created by the One Big Beautiful Bill Act (OBBBA). RAP launches on <strong>July 1, 2026</strong>, and for most borrowers, it means significantly higher monthly payments. The key change: RAP uses your raw adjusted gross income (AGI) with a sliding scale instead of SAVE&apos;s discretionary income formula that excluded 225% of the federal poverty level.
      </p>
      <p>
        Use our <Link href="/tools/save-vs-rap-calculator">SAVE vs RAP Calculator</Link> to see exactly how your payments change under the new plan. Below, we break down every detail &mdash; the math, the comparison, and what you should do next.
      </p>

      <section id="what-happened-to-save">
        <h2>What Happened to the SAVE Plan?</h2>
        <p>
          The <strong>SAVE (Saving on a Valuable Education)</strong> plan was introduced by the Biden administration in 2023 as a replacement for REPAYE. It offered the lowest payments of any IDR plan: 5% of discretionary income for undergraduate loans, 10% for graduate loans, with a generous income exclusion of 225% of the federal poverty level (FPL). Borrowers with low enough incomes could qualify for $0 monthly payments.
        </p>
        <p>
          Seven Republican-led states &mdash; <strong>Missouri, Arkansas, Florida, Georgia, North Dakota, Ohio, and Oklahoma</strong> &mdash; filed a lawsuit arguing that the Department of Education exceeded its statutory authority in creating SAVE. The case made its way to the <strong>8th Circuit Court of Appeals</strong>, which issued its final ruling on <strong>March 9, 2026</strong>, striking down the plan.
        </p>
        <p>
          The Trump administration agreed to a settlement that permanently halted all SAVE enrollment and forgiveness. Borrowers who had been enrolled in SAVE were placed into <strong>administrative forbearance</strong> starting in mid-2024, meaning no payments were required but interest continued to accrue. That forbearance continues until July 1, 2026, when RAP launches.
        </p>
        <p>
          More than <strong>7 million borrowers</strong> had enrolled in SAVE before enrollment was frozen. All of them will need to transition to a new repayment plan.
        </p>
      </section>

      <section id="what-is-rap">
        <h2>What Is RAP (Repayment Assistance Plan)?</h2>
        <p>
          RAP is the new income-driven repayment plan created by the <strong>One Big Beautiful Bill Act (OBBBA, Public Law 119-21)</strong>. Unlike SAVE, which was created through executive action and regulatory rulemaking, RAP is <strong>written into law</strong>. This means it cannot be struck down by courts the way SAVE was &mdash; it would take an act of Congress to change it.
        </p>
        <p>
          RAP launches on <strong>July 1, 2026</strong>, and replaces SAVE as the primary IDR option for new federal student loans. Existing borrowers can also enroll in RAP, and SAVE borrowers who take no action will be <strong>automatically enrolled</strong>.
        </p>
        <p>
          The fundamental difference between SAVE and RAP is how payments are calculated. SAVE used <strong>discretionary income</strong> &mdash; your AGI minus 225% of the federal poverty level &mdash; and charged a flat percentage (5% for undergrad, 10% for grad). RAP uses your <strong>raw AGI</strong> with a sliding scale from 1% to 10%, with no income exclusion at all.
        </p>
      </section>

      <ToolCTA
        name="SAVE vs RAP Calculator"
        href="/tools/save-vs-rap-calculator"
        description="Enter your income, loan balance, and family size to compare your monthly payments under SAVE, RAP, and IBR side by side."
      />

      <section id="how-rap-payments-calculated">
        <h2>How RAP Payments Are Calculated</h2>
        <p>
          RAP uses a <strong>sliding scale</strong> based on your adjusted gross income (AGI). The percentage applied to your income increases as you earn more:
        </p>
        <table>
          <thead>
            <tr>
              <th>AGI Range</th>
              <th>Rate</th>
              <th>Monthly Payment Formula</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>$0 &ndash; $10,000</td><td>Flat $10</td><td>$10/month</td></tr>
            <tr><td>$10,001 &ndash; $20,000</td><td>1%</td><td>AGI &times; 0.01 &divide; 12</td></tr>
            <tr><td>$20,001 &ndash; $30,000</td><td>2%</td><td>AGI &times; 0.02 &divide; 12</td></tr>
            <tr><td>$30,001 &ndash; $40,000</td><td>3%</td><td>AGI &times; 0.03 &divide; 12</td></tr>
            <tr><td>$40,001 &ndash; $50,000</td><td>4%</td><td>AGI &times; 0.04 &divide; 12</td></tr>
            <tr><td>$50,001 &ndash; $60,000</td><td>5%</td><td>AGI &times; 0.05 &divide; 12</td></tr>
            <tr><td>$60,001 &ndash; $70,000</td><td>6%</td><td>AGI &times; 0.06 &divide; 12</td></tr>
            <tr><td>$70,001 &ndash; $80,000</td><td>7%</td><td>AGI &times; 0.07 &divide; 12</td></tr>
            <tr><td>$80,001 &ndash; $90,000</td><td>8%</td><td>AGI &times; 0.08 &divide; 12</td></tr>
            <tr><td>$90,001 &ndash; $100,000</td><td>9%</td><td>AGI &times; 0.09 &divide; 12</td></tr>
            <tr><td>Over $100,000</td><td>10%</td><td>AGI &times; 0.10 &divide; 12</td></tr>
          </tbody>
        </table>
        <p>
          <strong>Dependent adjustment:</strong> Your monthly payment is reduced by <strong>$50 per dependent</strong>. The minimum payment is always <strong>$10/month</strong>, regardless of income or dependents.
        </p>
        <p>
          <strong>No FPL subtraction:</strong> Unlike SAVE, which excluded 225% of the federal poverty level from your income before calculating payments, RAP uses your <strong>raw AGI</strong>. This is the single biggest reason most borrowers will pay more.
        </p>

        <h3>Example: Single, No Dependents, $50,000 AGI</h3>
        <p><strong>Under RAP:</strong></p>
        <ul>
          <li>$50,000 AGI falls in the $40,001&ndash;$50,000 bracket = 4% rate</li>
          <li>Payment = $50,000 &times; 0.04 &divide; 12 = <strong>$167/month</strong></li>
        </ul>
        <p><strong>Under SAVE (undergraduate loans):</strong></p>
        <ul>
          <li>Discretionary income = $50,000 &minus; $35,910 (225% FPL for household size 1) = $14,090</li>
          <li>Payment = $14,090 &times; 0.05 &divide; 12 = <strong>$59/month</strong></li>
        </ul>
        <p>
          <strong>Increase: $108/month, a 183% jump.</strong> Over a year, that&apos;s $1,296 more in student loan payments. Over 20 years (SAVE&apos;s undergrad forgiveness timeline), that&apos;s $25,920 more &mdash; and RAP&apos;s forgiveness doesn&apos;t even kick in until year 30.
        </p>
      </section>

      <section id="save-vs-rap-comparison">
        <h2>SAVE vs RAP: Side-by-Side Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>SAVE (Dead)</th>
              <th>RAP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Payment basis</td>
              <td>5&ndash;10% of discretionary income</td>
              <td>1&ndash;10% of AGI (sliding scale)</td>
            </tr>
            <tr>
              <td>Income protection</td>
              <td>225% of FPL excluded</td>
              <td>None &mdash; raw AGI used</td>
            </tr>
            <tr>
              <td>Dependent adjustment</td>
              <td>Built into FPL calculation</td>
              <td>$50/month per dependent</td>
            </tr>
            <tr>
              <td>Undergrad rate</td>
              <td>5%</td>
              <td>Varies by AGI bracket</td>
            </tr>
            <tr>
              <td>Grad rate</td>
              <td>10%</td>
              <td>Varies by AGI bracket</td>
            </tr>
            <tr>
              <td>Forgiveness</td>
              <td>20 years (undergrad) / 25 years (grad)</td>
              <td>30 years (all)</td>
            </tr>
            <tr>
              <td>Interest subsidy</td>
              <td>100% waived</td>
              <td>100% waived</td>
            </tr>
            <tr>
              <td>Principal matching</td>
              <td>No</td>
              <td>$50/month government match</td>
            </tr>
            <tr>
              <td>Balance growth</td>
              <td>Never</td>
              <td>Never</td>
            </tr>
            <tr>
              <td>Parent PLUS eligible</td>
              <td>No</td>
              <td>No</td>
            </tr>
          </tbody>
        </table>
        <p>
          The two plans share some features &mdash; both prevent your balance from growing and both subsidize 100% of unpaid interest. But the payment calculation and forgiveness timeline differences are dramatic. RAP&apos;s $50/month principal match is a new feature, but for most borrowers it does not offset the higher monthly payments.
        </p>
      </section>

      <ToolCTA
        name="SAVE vs RAP Calculator"
        href="/tools/save-vs-rap-calculator"
        description="Compare your monthly payments, total cost, and forgiveness timeline under SAVE, RAP, IBR, and standard repayment. See which plan saves you the most."
      />

      <section id="who-pays-more">
        <h2>Who Pays More Under RAP?</h2>
        <p>
          The loss of the <strong>225% FPL exclusion</strong> is the single biggest change. Under SAVE, the first $35,910 of income (for a single person, household size 1) was completely protected from the payment calculation. Under RAP, that protection is gone &mdash; every dollar of AGI counts.
        </p>
        <p>
          Here&apos;s how payments compare at different income levels for a <strong>single borrower with undergraduate loans</strong>:
        </p>
        <table>
          <thead>
            <tr>
              <th>AGI</th>
              <th>SAVE Payment</th>
              <th>RAP Payment</th>
              <th>Monthly Increase</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>$30,000 (no dependents)</td>
              <td>$0/mo</td>
              <td>$50/mo</td>
              <td>+$50</td>
            </tr>
            <tr>
              <td>$50,000 (no dependents)</td>
              <td>$59/mo</td>
              <td>$167/mo</td>
              <td>+$108</td>
            </tr>
            <tr>
              <td>$75,000 (no dependents)</td>
              <td>$163/mo</td>
              <td>$438/mo</td>
              <td>+$275</td>
            </tr>
            <tr>
              <td>$50,000 (2 dependents)</td>
              <td>$0/mo</td>
              <td>$67/mo</td>
              <td>+$67</td>
            </tr>
          </tbody>
        </table>

        <h3>The Math Behind Each Example</h3>

        <p><strong>$30,000 AGI, single, no dependents:</strong></p>
        <ul>
          <li>SAVE: Discretionary income = $30,000 &minus; $35,910 (225% FPL) = negative &rarr; <strong>$0/month</strong></li>
          <li>RAP: $30,000 falls in the $20,001&ndash;$30,000 bracket = 2%. Payment = $30,000 &times; 0.02 &divide; 12 = <strong>$50/month</strong></li>
        </ul>

        <p><strong>$50,000 AGI, single, no dependents:</strong></p>
        <ul>
          <li>SAVE: Discretionary income = $50,000 &minus; $35,910 = $14,090. Payment = $14,090 &times; 0.05 &divide; 12 = <strong>$59/month</strong></li>
          <li>RAP: $50,000 falls in the $40,001&ndash;$50,000 bracket = 4%. Payment = $50,000 &times; 0.04 &divide; 12 = <strong>$167/month</strong></li>
        </ul>

        <p><strong>$75,000 AGI, single, no dependents:</strong></p>
        <ul>
          <li>SAVE: Discretionary income = $75,000 &minus; $35,910 = $39,090. Payment = $39,090 &times; 0.05 &divide; 12 = <strong>$163/month</strong></li>
          <li>RAP: $75,000 falls in the $70,001&ndash;$80,000 bracket = 7%. Payment = $75,000 &times; 0.07 &divide; 12 = <strong>$438/month</strong></li>
        </ul>

        <p><strong>$50,000 AGI, 2 dependents:</strong></p>
        <ul>
          <li>SAVE: 225% FPL for household size 3 = $61,470. Discretionary income = $50,000 &minus; $61,470 = negative &rarr; <strong>$0/month</strong></li>
          <li>RAP: Base payment = $167/month. Dependent reduction = $50 &times; 2 = $100. Payment = $167 &minus; $100 = <strong>$67/month</strong></li>
        </ul>

        <p>
          <strong>Key takeaway:</strong> Most borrowers earning above roughly $30,000 will pay more under RAP. The only borrowers who might pay less are those earning $10,000 or below, who pay a flat $10/month under RAP versus $0 under SAVE. Dependents help significantly under RAP &mdash; the $50/month per dependent reduction can bring payments down substantially for larger families.
        </p>
      </section>

      <section id="30-year-forgiveness">
        <h2>The 30-Year Forgiveness Problem</h2>
        <p>
          Under SAVE, undergraduate borrowers received forgiveness after <strong>20 years</strong> and graduate borrowers after <strong>25 years</strong>. Under RAP, <strong>everyone waits 30 years</strong> &mdash; regardless of whether your loans are undergraduate or graduate.
        </p>
        <p>
          That&apos;s 10 extra years of payments for undergraduate borrowers and 5 extra years for graduate borrowers. Combined with the higher monthly payments, the total amount paid over the life of the plan increases dramatically.
        </p>
        <p>
          But the timeline isn&apos;t the only problem. Starting January 1, 2026, student loan forgiveness under IDR plans is <strong>taxable as ordinary income</strong>. The American Rescue Plan provision that made forgiveness tax-free expired, and the OBBBA did not create a new exemption for RAP.
        </p>
        <p>
          This creates a triple hit for borrowers:
        </p>
        <ol>
          <li><strong>Higher monthly payments</strong> due to the loss of the FPL exclusion</li>
          <li><strong>10 more years of payments</strong> before forgiveness kicks in (for undergrad borrowers)</li>
          <li><strong>Taxable forgiveness</strong> &mdash; the forgiven amount is added to your taxable income, potentially creating a five- or six-figure tax bill</li>
        </ol>
        <p>
          Use our <Link href="/tools/student-loan-tax-bomb-calculator">Student Loan Tax Bomb Calculator</Link> to estimate what you&apos;ll owe in taxes when your RAP forgiveness arrives. For many borrowers, the combination of higher payments, a longer timeline, and taxable forgiveness makes the total cost under RAP significantly higher than it would have been under SAVE.
        </p>
      </section>

      <section id="what-about-ibr">
        <h2>What About IBR?</h2>
        <p>
          Income-Based Repayment (IBR) is still available for existing federal student loans originated before July 1, 2026. There are two versions:
        </p>
        <ul>
          <li><strong>IBR New</strong> (loans after July 1, 2014): 10% of discretionary income above 150% of FPL, with forgiveness after 20 years</li>
          <li><strong>IBR Old</strong> (loans before July 1, 2014): 15% of discretionary income above 150% of FPL, with forgiveness after 25 years</li>
        </ul>
        <p>
          A significant change under the OBBBA: the <strong>partial financial hardship requirement has been removed</strong>. Previously, you could only enroll in IBR if your IBR payment would be less than what you&apos;d pay on the standard 10-year plan. Now, everyone can enroll in IBR regardless of income level.
        </p>
        <p>
          For some borrowers, <strong>IBR may actually result in lower payments than RAP</strong>. IBR uses 150% of FPL as its income exclusion (about $23,940 for a single person), which is less protective than SAVE&apos;s 225% but still excludes a significant portion of income &mdash; unlike RAP, which excludes nothing. The tradeoff is that IBR charges a higher percentage (10-15% vs RAP&apos;s sliding scale).
        </p>
        <p>
          Use our <Link href="/tools/save-vs-rap-calculator">SAVE vs RAP Calculator</Link> to compare RAP, IBR, and standard repayment side by side for your specific situation.
        </p>
        <p>
          <strong>WARNING:</strong> If you switch from SAVE forbearance to IBR and then later switch to RAP, your accrued interest may <strong>capitalize</strong> &mdash; meaning it gets added to your principal balance. This can increase the total amount you owe. Think carefully before making multiple plan switches.
        </p>
      </section>

      <section id="what-to-do-now">
        <h2>What SAVE Borrowers Should Do Right Now</h2>
        <p>
          If you were enrolled in SAVE, here&apos;s your current situation and what to do about it.
        </p>

        <h3>1. Understand Your Forbearance Status</h3>
        <p>
          You are in <strong>administrative forbearance until July 1, 2026</strong>. No payments are due, but interest <strong>is</strong> accruing on your loans. This forbearance time does not count toward IDR forgiveness or PSLF qualifying payments.
        </p>

        <h3>2. If You Do Nothing, You&apos;ll Be Auto-Enrolled in RAP</h3>
        <p>
          On July 1, 2026, all SAVE borrowers who have not actively chosen a different repayment plan will be <strong>automatically enrolled in RAP</strong>. Your first payment will be calculated based on your most recent tax return.
        </p>

        <h3>3. Run the Numbers</h3>
        <p>
          Before July 1, compare your options:
        </p>
        <ul>
          <li><strong>RAP</strong>: Sliding scale 1-10% of raw AGI, 30-year forgiveness</li>
          <li><strong>IBR</strong>: 10-15% of discretionary income (above 150% FPL), 20-25 year forgiveness</li>
          <li><strong>Standard 10-year</strong>: Fixed payments, no forgiveness, but you&apos;re done in 10 years</li>
        </ul>
        <p>
          Use our <Link href="/tools/save-vs-rap-calculator">SAVE vs RAP Calculator</Link> to compare all three options with your actual income and balance.
        </p>

        <h3>4. Consider Refinancing (With Caution)</h3>
        <p>
          If you have good credit and a high income, refinancing to a private loan could give you a lower interest rate and a shorter repayment timeline. But refinancing means you permanently lose access to all federal protections: IDR plans, forgiveness, forbearance, and deferment. Only consider this if you are confident you can handle the payments long-term and do not need a forgiveness safety net.
        </p>

        <h3>5. Consider Aggressive Repayment</h3>
        <p>
          If your balance is low enough that you could pay it off well before the 20- or 30-year forgiveness mark, aggressive repayment on the standard plan may save you money compared to decades of IDR payments plus a tax bomb at the end. Run the total cost comparison using our <Link href="/tools/debt-payoff-calculator">Debt Payoff Calculator</Link>.
        </p>

        <h3>6. Do NOT Switch to IBR First, Then RAP</h3>
        <p>
          Switching repayment plans can trigger <strong>interest capitalization</strong>, where your accrued unpaid interest gets added to your principal balance. If you go from SAVE forbearance to IBR and then later to RAP, you could capitalize interest twice. If you&apos;re going to choose IBR, make that decision and stick with it. If you want RAP, let the auto-enrollment happen.
        </p>
      </section>

      <ToolCTA
        name="SAVE vs RAP Calculator"
        href="/tools/save-vs-rap-calculator"
        description="Compare RAP, IBR, and standard repayment for your specific income and loan balance. See monthly payments, total cost, and forgiveness amounts side by side."
      />

      <section>
        <h2>Key Takeaways</h2>
        <ul>
          <li>The SAVE plan was struck down on March 9, 2026, by the 8th Circuit Court of Appeals &mdash; it is no longer available</li>
          <li>RAP (Repayment Assistance Plan) launches July 1, 2026, created by the OBBBA as law, not executive action</li>
          <li>RAP uses raw AGI with a 1&ndash;10% sliding scale instead of SAVE&apos;s discretionary income formula &mdash; most borrowers will pay significantly more</li>
          <li>A single borrower earning $50,000 goes from $59/month under SAVE to $167/month under RAP &mdash; a 183% increase</li>
          <li>RAP forgiveness takes 30 years (vs 20 for SAVE undergrad), and forgiveness is now taxable</li>
          <li>IBR is still available and may be a better option for some borrowers &mdash; run the numbers before choosing</li>
          <li>SAVE borrowers will be auto-enrolled in RAP on July 1 if they take no action</li>
          <li>Avoid switching plans multiple times, as this can trigger interest capitalization</li>
          <li>Use our <Link href="/tools/save-vs-rap-calculator">SAVE vs RAP Calculator</Link> to compare all your options</li>
        </ul>
      </section>

      <p className="text-sm text-zinc-500 italic mt-8">
        Disclaimer: This article is for informational purposes only and does not constitute financial or legal advice. Student loan regulations are subject to change. The payment calculations above use 2026 federal poverty level guidelines and the RAP sliding scale as enacted in the OBBBA (Public Law 119-21). Consult a qualified financial advisor or student loan specialist before making repayment decisions.
      </p>
    </BlogLayout>
  );
}
