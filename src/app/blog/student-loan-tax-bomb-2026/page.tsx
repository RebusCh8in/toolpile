import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "Student Loan Tax Bomb 2026: How Much You'll Owe and How to Prepare",
  slug: "student-loan-tax-bomb-2026",
  description: "The tax-free period for student loan forgiveness expired January 1, 2026. If you're on an IDR plan, your forgiven balance will be taxed as ordinary income. Learn how big the bill could be, whether the insolvency exclusion can help, and how to prepare.",
  datePublished: "2026-03-14",
  dateModified: "2026-03-14",
  tags: ["Student Loan Tax Bomb", "IDR Forgiveness Tax", "Student Loan Forgiveness Taxable 2026", "Insolvency Exclusion Student Loans", "Student Loans"],
  faqs: [
    { question: "Is student loan forgiveness taxable in 2026?", answer: "Yes, for income-driven repayment (IDR) plan forgiveness. The American Rescue Plan made all student loan forgiveness tax-free from 2021 through 2025, but that provision expired on January 1, 2026. IDR forgiveness after 20 or 25 years of payments is now taxed as ordinary income on your federal return. PSLF, Teacher Loan Forgiveness, Closed School Discharge, TPD Discharge, Death Discharge, and Borrower Defense discharge remain tax-free." },
    { question: "Is PSLF still tax-free after 2025?", answer: "Yes. Public Service Loan Forgiveness has always been permanently tax-free under IRC 108(f)(1). The ARP expiration does not affect PSLF. If you qualify for PSLF after 10 years of qualifying payments while working for a qualifying employer, the forgiven balance is not taxable income." },
    { question: "What is the insolvency exclusion for student loan forgiveness?", answer: "Under IRC 108(a)(1)(B), if your total liabilities exceed your total assets at the time of forgiveness, you are considered insolvent. You can exclude the forgiven amount from taxable income up to the amount by which you are insolvent. For example, if you are insolvent by $80,000 and $120,000 is forgiven, you can exclude $80,000 and only $40,000 is taxable. You must file IRS Form 982 with your tax return to claim this exclusion." },
    { question: "Do retirement accounts count as assets for the insolvency exclusion?", answer: "Yes. Per IRS Publication 4681, retirement accounts including 401(k) plans, IRAs, Roth IRAs, and pension values count as assets when calculating insolvency. This is a common misconception that catches people off guard. A large retirement balance can push you above the insolvency threshold even if you feel financially stretched." },
    { question: "What if I can't pay the tax bill from student loan forgiveness?", answer: "The IRS offers several options: an installment agreement (Form 9465) to pay over time, an Offer in Compromise to settle for less than the full amount, Currently Not Collectible status if you have no ability to pay, or a 120-day extension to pay in full. The IRS cannot refuse a monthly installment plan if you owe less than $50,000 and can pay within 72 months." },
    { question: "Will RAP (REPAYE Alternative Plan) forgiveness be taxable?", answer: "Yes. The RAP plan, which begins in July 2026, offers forgiveness after 30 years of payments. Because the ARP tax-free provision expired and no new exclusion was created for RAP, any forgiveness under RAP will be taxed as ordinary income. The same insolvency exclusion rules apply." },
    { question: "Do states also tax student loan forgiveness?", answer: "It depends on your state. States with no income tax (Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, Wyoming) will not tax forgiveness. Most states that automatically conform to the federal tax code will follow federal treatment and tax the forgiveness. Some states including Arkansas, Indiana, Mississippi, North Carolina, Wisconsin, and Minnesota have historically taxed forgiveness. Check your state's conformity rules." },
    { question: "Is it still worth staying on an IDR plan if forgiveness is taxable?", answer: "In most cases, yes. Even with a significant tax bill, the total amount paid (payments plus tax) is usually far less than repaying the full loan balance. For example, if $80,000 is forgiven and you owe $16,714 in taxes, you still save $63,286 compared to repaying the full balance. Use our Student Loan Tax Bomb Calculator to compare the numbers for your specific situation." },
  ],
  relatedTools: [
    { name: "Student Loan Tax Bomb Calculator", href: "/tools/student-loan-tax-bomb-calculator" },
    { name: "Student Loan Calculator", href: "/tools/student-loan-calculator" },
    { name: "Tax Calculator", href: "/tools/tax-calculator" },
    { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
  ],
  relatedArticles: [
    { title: "No Tax on Tips or Overtime: How the OBBBA Saves You Money (2026)", href: "/blog/no-tax-on-tips-obbba-guide" },
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
          <li><Link href="#what-changed" className="text-blue-400 hover:text-blue-300">What Changed in 2026</Link></li>
          <li><Link href="#who-is-affected" className="text-blue-400 hover:text-blue-300">Who Is Affected (and Who Isn&apos;t)</Link></li>
          <li><Link href="#how-big-is-the-tax-bill" className="text-blue-400 hover:text-blue-300">How Big Is the Tax Bill?</Link></li>
          <li><Link href="#insolvency-exclusion" className="text-blue-400 hover:text-blue-300">The Insolvency Exclusion Explained</Link></li>
          <li><Link href="#how-to-prepare" className="text-blue-400 hover:text-blue-300">5 Ways to Prepare Now</Link></li>
          <li><Link href="#irs-payment-options" className="text-blue-400 hover:text-blue-300">IRS Payment Options If You Can&apos;t Pay</Link></li>
          <li><Link href="#faq" className="text-blue-400 hover:text-blue-300">FAQ</Link></li>
        </ol>
      </nav>

      <p>
        For five years, student loan borrowers on income-driven repayment (IDR) plans could look forward to tax-free forgiveness. The American Rescue Plan made all forms of student loan forgiveness exempt from federal income tax from 2021 through 2025. That provision <strong>expired on January 1, 2026</strong>, and Congress did not extend it in the One Big Beautiful Bill Act (OBBBA).
      </p>
      <p>
        If you are on an IDR plan and approaching the 20- or 25-year forgiveness mark, your forgiven balance will now be treated as <strong>ordinary income</strong> on your federal tax return. For borrowers with six-figure forgiveness amounts, the resulting tax bill can be tens of thousands of dollars. This is what student loan advocates call the &ldquo;tax bomb.&rdquo;
      </p>
      <p>
        The good news: the tax bill is almost always far less than repaying the full loan balance, and there are legal strategies to reduce or eliminate it. Use our <Link href="/tools/student-loan-tax-bomb-calculator">Student Loan Tax Bomb Calculator</Link> to see exactly what you would owe based on your income, forgiveness amount, and insolvency status.
      </p>

      <section id="what-changed">
        <h2>What Changed in 2026</h2>
        <p>
          The <strong>American Rescue Plan Act of 2021</strong> (ARP) added a temporary provision making all student loan forgiveness, cancellation, and discharge tax-free at the federal level. This applied to every type of forgiveness &mdash; IDR, PSLF, borrower defense, and everything else &mdash; for the period from January 1, 2021, through December 31, 2025.
        </p>
        <p>
          That provision expired automatically on <strong>January 1, 2026</strong>. The OBBBA, signed into law in 2025, did not include an extension. As a result, the tax treatment of student loan forgiveness reverted to pre-2021 rules:
        </p>
        <ul>
          <li>IDR forgiveness after 20 or 25 years of payments is <strong>taxable as ordinary income</strong></li>
          <li>RAP forgiveness (the new REPAYE Alternative Plan with 30-year forgiveness, starting July 2026) is also <strong>taxable</strong></li>
          <li>The IRS treats the forgiven amount as if you earned that much additional income in the year of forgiveness</li>
          <li>You will receive a <strong>1099-C</strong> (Cancellation of Debt) from your loan servicer for the forgiven amount</li>
        </ul>
        <p>
          In plain English: if you have $100,000 forgiven after 20 years on an IDR plan, the IRS adds $100,000 to your taxable income that year. If you normally earn $60,000, you would be taxed as if you earned $160,000.
        </p>
      </section>

      <ToolCTA
        name="Student Loan Tax Bomb Calculator"
        href="/tools/student-loan-tax-bomb-calculator"
        description="Enter your income, forgiveness amount, filing status, and assets/liabilities to calculate your exact tax bomb — including insolvency savings."
      />

      <section id="who-is-affected">
        <h2>Who Is Affected (and Who Isn&apos;t)</h2>
        <p>
          Not all student loan forgiveness is taxable. Several types of discharge have their own permanent tax exemptions that were not affected by the ARP expiration.
        </p>
        <table>
          <thead>
            <tr>
              <th>Type of Forgiveness</th>
              <th>Taxable in 2026?</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IDR forgiveness (20-25 years)</td>
              <td><strong>Yes</strong></td>
              <td>ARP tax-free provision expired</td>
            </tr>
            <tr>
              <td>RAP forgiveness (30 years)</td>
              <td><strong>Yes</strong></td>
              <td>No tax exclusion exists for RAP</td>
            </tr>
            <tr>
              <td>Public Service Loan Forgiveness (PSLF)</td>
              <td>No</td>
              <td>Permanently tax-free under IRC 108(f)(1)</td>
            </tr>
            <tr>
              <td>Teacher Loan Forgiveness</td>
              <td>No</td>
              <td>Permanently tax-free under IRC 108(f)(1)</td>
            </tr>
            <tr>
              <td>Closed School Discharge</td>
              <td>No</td>
              <td>Not treated as cancellation of debt</td>
            </tr>
            <tr>
              <td>Total and Permanent Disability (TPD) Discharge</td>
              <td>No</td>
              <td>Made permanently tax-free by OBBBA</td>
            </tr>
            <tr>
              <td>Death Discharge</td>
              <td>No</td>
              <td>Made permanently tax-free by OBBBA</td>
            </tr>
            <tr>
              <td>Borrower Defense to Repayment</td>
              <td>No</td>
              <td>Not treated as cancellation of debt</td>
            </tr>
          </tbody>
        </table>
        <p>
          If you are pursuing <strong>PSLF</strong>, you are not affected by this change. PSLF has always been tax-free under IRC 108(f)(1), and that statute was not modified. If you work for a qualifying public service employer and can reach 120 qualifying payments, PSLF remains the best path &mdash; you get forgiveness after 10 years with zero tax consequences.
        </p>
      </section>

      <section id="how-big-is-the-tax-bill">
        <h2>How Big Is the Tax Bill?</h2>
        <p>
          The size of your tax bomb depends on three things: your regular income, the amount forgiven, and whether you qualify for the insolvency exclusion. Below are three examples with verified math using 2026 federal tax brackets and the $16,100 standard deduction for single filers and $32,200 for married filing jointly.
        </p>

        <h3>Example 1: Sarah &mdash; Single, $55K Income, $80K Forgiven, Not Insolvent</h3>
        <p>
          Sarah earns $55,000 per year and has $80,000 forgiven after 20 years on an IDR plan. She has more assets than liabilities, so the insolvency exclusion does not apply.
        </p>
        <p><strong>Without forgiveness:</strong></p>
        <ul>
          <li>Taxable income: $55,000 &minus; $16,100 (standard deduction) = $38,900</li>
          <li>10% on first $12,400 = $1,240</li>
          <li>12% on $26,500 ($12,400 to $38,900) = $3,180</li>
          <li><strong>Total tax: $4,420</strong></li>
        </ul>
        <p><strong>With $80,000 forgiveness added:</strong></p>
        <ul>
          <li>Taxable income: $135,000 &minus; $16,100 = $118,900</li>
          <li>10% on first $12,400 = $1,240</li>
          <li>12% on $38,000 ($12,400 to $50,400) = $4,560</li>
          <li>22% on $55,300 ($50,400 to $105,700) = $12,166</li>
          <li>24% on $13,200 ($105,700 to $118,900) = $3,168</li>
          <li><strong>Total tax: $21,134</strong></li>
        </ul>
        <p>
          <strong>Sarah&apos;s tax bomb: $21,134 &minus; $4,420 = $16,714.</strong> That is a significant bill, but she still saves $80,000 &minus; $16,714 = <strong>$63,286</strong> compared to repaying the full forgiven balance. The IDR strategy still saves her tens of thousands of dollars.
        </p>

        <h3>Example 2: Marcus &mdash; Married Filing Jointly, $90K Income, $120K Forgiven, Partially Insolvent</h3>
        <p>
          Marcus and his spouse earn $90,000 combined. He has $120,000 in student loans forgiven. He qualifies as partially insolvent.
        </p>
        <p><strong>Insolvency calculation:</strong></p>
        <ul>
          <li>Assets: $30,000 (retirement accounts) + $10,000 (car) + $5,000 (savings) = <strong>$45,000</strong></li>
          <li>Liabilities: $120,000 (student loans) + $15,000 (car loan) + $20,000 (credit cards) = <strong>$155,000</strong></li>
          <li>Insolvency amount: $155,000 &minus; $45,000 = <strong>$110,000</strong></li>
          <li>Excludable: min($110,000, $120,000) = <strong>$110,000</strong></li>
          <li>Taxable forgiveness: $120,000 &minus; $110,000 = <strong>$10,000</strong></li>
        </ul>
        <p><strong>Tax impact:</strong></p>
        <ul>
          <li>Taxable income: $90,000 + $10,000 &minus; $32,200 (MFJ standard deduction) = $67,800</li>
          <li>The additional $10,000 falls in the 12% bracket for MFJ filers</li>
          <li>Incremental tax on the $10,000: approximately <strong>$1,200</strong></li>
        </ul>
        <p>
          <strong>Marcus&apos;s tax bomb: approximately $1,200.</strong> The insolvency exclusion saved him roughly $15,500 in taxes. Without it, the full $120,000 would have been taxable. This is why understanding insolvency is critical.
        </p>

        <h3>Example 3: Priya &mdash; Single, $70K Income, $150K Forgiven, Not Insolvent</h3>
        <p>
          Priya earns $70,000 and has $150,000 forgiven. She has been contributing to retirement accounts for years and has significant assets.
        </p>
        <p><strong>Insolvency check:</strong></p>
        <ul>
          <li>Assets: $200,000 (retirement) + $15,000 (car) + $15,000 (savings) = <strong>$230,000</strong></li>
          <li>Liabilities: $150,000 (student loans) + $20,000 (car loan) + $10,000 (credit cards) = <strong>$180,000</strong></li>
          <li>Assets exceed liabilities &mdash; Priya is <strong>not insolvent</strong></li>
          <li>The full $150,000 is taxable</li>
        </ul>
        <p><strong>Without forgiveness:</strong></p>
        <ul>
          <li>Taxable income: $70,000 &minus; $16,100 = $53,900</li>
          <li>10% on $12,400 = $1,240</li>
          <li>12% on $38,000 ($12,400 to $50,400) = $4,560</li>
          <li>22% on $3,500 ($50,400 to $53,900) = $770</li>
          <li><strong>Total tax: $6,570</strong></li>
        </ul>
        <p><strong>With $150,000 forgiveness added:</strong></p>
        <ul>
          <li>Taxable income: $220,000 &minus; $16,100 = $203,900</li>
          <li>10% on $12,400 = $1,240</li>
          <li>12% on $38,000 ($12,400 to $50,400) = $4,560</li>
          <li>22% on $55,300 ($50,400 to $105,700) = $12,166</li>
          <li>24% on $96,075 ($105,700 to $201,775) = $23,058</li>
          <li>32% on $2,125 ($201,775 to $203,900) = $680</li>
          <li><strong>Total tax: $41,704</strong></li>
        </ul>
        <p>
          <strong>Priya&apos;s tax bomb: $41,704 &minus; $6,570 = $35,134.</strong> This is a large tax bill, driven by the fact that her retirement savings push her above the insolvency threshold. Despite the steep tax, she still saves $150,000 &minus; $35,134 = <strong>$114,866</strong> compared to repaying the full balance. However, the IRS will expect payment, and Priya should start planning now.
        </p>
      </section>

      <ToolCTA
        name="Student Loan Tax Bomb Calculator"
        href="/tools/student-loan-tax-bomb-calculator"
        description="Run your own numbers. Enter your income, forgiveness amount, and insolvency details to see your exact tax bomb and net savings."
      />

      <section id="insolvency-exclusion">
        <h2>The Insolvency Exclusion Explained</h2>
        <p>
          The insolvency exclusion under <strong>IRC 108(a)(1)(B)</strong> is the most powerful tool available to reduce or eliminate the tax bomb. It applies to any cancellation of debt, not just student loans, and it exists independently of the ARP &mdash; it has always been available and will continue to be available.
        </p>

        <h3>What Is Insolvency?</h3>
        <p>
          You are insolvent when your <strong>total liabilities exceed your total assets</strong> at the moment immediately before the debt is cancelled. You do not need to file for bankruptcy. Insolvency is determined by a simple balance sheet calculation.
        </p>

        <h3>The Formula</h3>
        <ul>
          <li><strong>Insolvency Amount</strong> = Total Liabilities &minus; Total Assets</li>
          <li><strong>Excludable Amount</strong> = the lesser of the Insolvency Amount or the Forgiven Amount</li>
          <li><strong>Taxable Forgiveness</strong> = Forgiven Amount &minus; Excludable Amount</li>
        </ul>

        <h3>What Counts as Assets</h3>
        <p>
          Per <strong>IRS Publication 4681</strong>, assets include:
        </p>
        <ul>
          <li>Cash, checking, and savings accounts</li>
          <li>Retirement accounts (401(k), IRA, Roth IRA, 403(b), pension values) &mdash; <strong>yes, these count</strong></li>
          <li>Vehicles (fair market value)</li>
          <li>Real estate (fair market value)</li>
          <li>Investment accounts (stocks, bonds, mutual funds)</li>
          <li>Personal property of significant value</li>
          <li>Business interests</li>
        </ul>
        <p>
          <strong>Important:</strong> Retirement accounts count as assets for insolvency purposes. This surprises many borrowers. If you have been diligently saving for retirement, your 401(k) or IRA balance may push your total assets above your total liabilities, disqualifying you from the insolvency exclusion. This creates a tension between retirement savings and insolvency planning that we address in the preparation section below.
        </p>

        <h3>What Counts as Liabilities</h3>
        <ul>
          <li>Student loans (including the amount about to be forgiven)</li>
          <li>Mortgage balance</li>
          <li>Auto loans</li>
          <li>Credit card debt</li>
          <li>Medical debt</li>
          <li>Personal loans</li>
          <li>Any other legally enforceable debts</li>
        </ul>

        <h3>How to File for the Insolvency Exclusion</h3>
        <ol>
          <li>Calculate your total assets and total liabilities immediately before the forgiveness date</li>
          <li>Determine your insolvency amount (liabilities minus assets)</li>
          <li>Complete <strong>IRS Form 982</strong> (Reduction of Tax Attributes Due to Discharge of Indebtedness)</li>
          <li>Check Box 1b (&ldquo;Discharge of indebtedness to the extent insolvent&rdquo;)</li>
          <li>Enter the excluded amount on Line 2</li>
          <li>Attach Form 982 to your federal tax return</li>
        </ol>
        <p>
          Keep detailed records of all assets and liabilities as of the forgiveness date. Bank statements, retirement account statements, loan balances, credit card statements, and vehicle valuations (such as Kelley Blue Book) all serve as supporting documentation if the IRS questions your insolvency claim.
        </p>
      </section>

      <section id="how-to-prepare">
        <h2>5 Ways to Prepare Now</h2>
        <p>
          If your IDR forgiveness is approaching, start preparing years in advance. Here are five concrete steps.
        </p>

        <h3>1. Start Saving Monthly for the Tax Bill</h3>
        <p>
          Use the <Link href="/tools/student-loan-tax-bomb-calculator">Student Loan Tax Bomb Calculator</Link> to estimate your future tax bill. Divide that number by the months remaining until forgiveness and set up an automatic transfer to a dedicated savings account. Even saving $200 to $300 per month over several years can build a substantial cushion. A high-yield savings account earning 4-5% will help your savings grow while you wait.
        </p>

        <h3>2. Check If You Qualify for PSLF Instead</h3>
        <p>
          PSLF offers forgiveness after just <strong>10 years</strong> (120 qualifying payments) and is <strong>permanently tax-free</strong> under IRC 108(f)(1). If you work for a federal, state, or local government agency, a 501(c)(3) nonprofit, or certain other qualifying public service employers, you may be eligible. Switching to a PSLF-qualifying employer &mdash; even later in your career &mdash; can be worth it if you can reach 120 payments before your IDR forgiveness date. Check your qualifying payment count at <Link href="/tools/student-loan-calculator">StudentAid.gov</Link> or use our <Link href="/tools/student-loan-calculator">Student Loan Calculator</Link> to model different scenarios.
        </p>

        <h3>3. Calculate Your Insolvency Position</h3>
        <p>
          Know where you stand before your forgiveness year arrives. List every asset (including retirement accounts) and every liability. If you are close to the insolvency line, small changes in your financial position could make a big difference. Understanding your insolvency status years in advance gives you time to make strategic decisions.
        </p>

        <h3>4. Consider Increasing Retirement Contributions</h3>
        <p>
          Contributing more to a traditional 401(k) or traditional IRA reduces your <strong>taxable income</strong> in the year of forgiveness. If you max out your 401(k) at $23,500 (the 2026 limit) plus a $7,000 IRA contribution, you can reduce the income that gets stacked with the forgiveness amount.
        </p>
        <p>
          However, there is a catch: retirement accounts <strong>count as assets</strong> for insolvency purposes. If increasing your retirement contributions pushes your assets above your liabilities, you could lose the insolvency exclusion, which may cost more in taxes than the income reduction saves. Run the numbers carefully or consult a tax professional before making this decision.
        </p>

        <h3>5. Consult a Tax Professional Before Your Forgiveness Year</h3>
        <p>
          The intersection of cancellation of debt income, insolvency calculations, state tax conformity, and retirement planning is genuinely complex. A CPA or enrolled agent who specializes in student loan tax issues can help you model scenarios, time major financial decisions, and ensure you claim every exclusion you are entitled to. The cost of professional advice is trivial compared to a five-figure tax bill.
        </p>
      </section>

      <section id="irs-payment-options">
        <h2>IRS Payment Options If You Can&apos;t Pay the Full Tax Bill</h2>
        <p>
          If your tax bomb arrives and you do not have the cash to pay it in full, the IRS offers several options. You will not go to jail, and the IRS generally prefers to work with you rather than pursue aggressive collection.
        </p>

        <h3>Installment Agreement (Form 9465)</h3>
        <p>
          You can request a monthly payment plan using <strong>IRS Form 9465</strong>. If you owe $50,000 or less in combined tax, penalties, and interest, the IRS is required to approve a streamlined installment agreement as long as you can pay the balance within 72 months. Interest and penalties accrue on the unpaid balance, but the rates are generally lower than private loans.
        </p>

        <h3>Offer in Compromise</h3>
        <p>
          An Offer in Compromise (OIC) lets you settle your tax debt for less than the full amount owed. The IRS evaluates your ability to pay, income, expenses, and asset equity. OICs are not easy to get approved &mdash; the IRS accepts roughly 30-40% of applications &mdash; but for borrowers with limited income and assets, it can reduce the bill substantially.
        </p>

        <h3>Currently Not Collectible Status</h3>
        <p>
          If you truly cannot afford to pay anything, the IRS can place your account in <strong>Currently Not Collectible</strong> (CNC) status. This pauses all collection activity. Interest and penalties still accrue, but the IRS will not garnish wages, levy bank accounts, or file liens while you are in CNC status. The IRS reviews your financial situation periodically to determine if your ability to pay has changed.
        </p>

        <h3>120-Day Extension to Pay</h3>
        <p>
          If you need a short window to gather funds, you can request a <strong>120-day extension</strong> to pay in full. No setup fee is required. Interest accrues during the extension period, but there is no installment agreement fee.
        </p>
      </section>

      <ToolCTA
        name="Student Loan Tax Bomb Calculator"
        href="/tools/student-loan-tax-bomb-calculator"
        description="Calculate your student loan tax bomb, insolvency exclusion, and net savings. See exactly what you'll owe and how much forgiveness still saves you."
      />

      <section>
        <h2>States and Student Loan Forgiveness Taxes</h2>
        <p>
          Your state tax treatment depends on whether your state has an income tax and how it conforms to the federal tax code.
        </p>
        <p>
          <strong>No state income tax (no state bill):</strong> Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. If you live in one of these states, you only owe federal taxes on forgiveness.
        </p>
        <p>
          <strong>States that have historically taxed forgiveness:</strong> Arkansas, Indiana, Mississippi, North Carolina, Wisconsin, and Minnesota have historically treated student loan forgiveness as taxable income at the state level. If you live in one of these states, you may owe state income tax on top of your federal bill.
        </p>
        <p>
          <strong>Rolling-conformity states:</strong> Most states that automatically adopt the current federal tax code (&ldquo;rolling conformity&rdquo;) will follow the federal treatment. Since forgiveness is now taxable federally, it will be taxable in these states as well. Use our <Link href="/tools/tax-calculator">Tax Calculator</Link> to estimate your combined federal and state burden.
        </p>
      </section>

      <section>
        <h2>Key Takeaways</h2>
        <ul>
          <li>The ARP tax-free period for student loan forgiveness ended January 1, 2026 &mdash; IDR and RAP forgiveness are now taxable as ordinary income</li>
          <li>PSLF, Teacher Loan Forgiveness, Closed School Discharge, TPD Discharge, Death Discharge, and Borrower Defense remain tax-free</li>
          <li>The insolvency exclusion (IRC 108(a)(1)(B)) can reduce or eliminate the tax bill if your liabilities exceed your assets</li>
          <li>Retirement accounts count as assets for insolvency &mdash; this catches many borrowers off guard</li>
          <li>Even with a significant tax bomb, forgiveness almost always saves you money compared to repaying the full balance</li>
          <li>Start planning years in advance: save monthly, check PSLF eligibility, calculate insolvency, and consult a tax professional</li>
          <li>The IRS offers installment agreements, Offers in Compromise, and Currently Not Collectible status if you cannot pay the full bill</li>
          <li>Use our <Link href="/tools/student-loan-tax-bomb-calculator">Student Loan Tax Bomb Calculator</Link> to run your own numbers</li>
        </ul>
      </section>

      <p className="text-sm text-zinc-500 italic mt-8">
        Disclaimer: This article is for informational purposes only and does not constitute tax or financial advice. Tax laws are complex and individual circumstances vary. The examples above use estimated 2026 federal tax brackets and standard deduction amounts, which are subject to change. Consult a qualified tax professional, CPA, or enrolled agent before making decisions based on the information in this guide.
      </p>
    </BlogLayout>
  );
}
