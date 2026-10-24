import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "No Tax on Tips or Overtime: How the OBBBA Saves You Money (2026)",
  slug: "no-tax-on-tips-obbba-guide",
  description: "Learn how the One Big Beautiful Bill Act eliminates federal income tax on tips and overtime. See who qualifies, income caps, phase-outs, and how much you could save in 2026.",
  datePublished: "2026-03-09",
  dateModified: "2026-03-09",
  tags: ["OBBBA", "No Tax on Tips", "Tax Savings", "Overtime", "Tax Deductions", "2026"],
  faqs: [
    { question: "Do I have to do anything special to claim no tax on tips?", answer: "No special forms are required beyond your standard tax return. Your employer should report your tip income on your W-2 (Box 7 for Social Security tips, Box 8 for allocated tips). When you file, the tip deduction is claimed on Schedule 1-A and appears on Form 1040 line 13b. Tax software will be updated to include this deduction automatically. If you receive cash tips, you are still required to report them to your employer using Form 4070 so they appear on your W-2." },
    { question: "Are cash tips exempt too?", answer: "Yes, cash tips qualify for the deduction, but only if you properly report them. You must report cash tips of $20 or more per month to your employer. If you fail to report them, they are not included on your W-2 and you cannot claim the deduction. The IRS has always required tip reporting, and claiming the deduction on unreported tips would be a red flag for an audit." },
    { question: "Does the overtime deduction apply to salaried workers who work over 40 hours?", answer: "No. The overtime tax exemption specifically applies to workers who are non-exempt under the Fair Labor Standards Act (FLSA). These are typically hourly workers who receive time-and-a-half pay for hours exceeding 40 per week. Salaried exempt employees such as managers, professionals, and administrators do not qualify, even if they regularly work more than 40 hours. The exemption is tied to the FLSA overtime classification, not simply working long hours." },
    { question: "Can I claim both the tip and overtime deduction?", answer: "Yes, you can claim both if you qualify for each. For example, a tipped restaurant worker who also earns overtime pay can deduct up to $25,000 in tips and up to $12,500 in overtime pay (single filer) from their federal taxable income. The deductions are independent and each has its own cap. This makes the combined maximum deduction $37,500 for a single filer who earns both tips and overtime." },
    { question: "What happens after 2028?", answer: "All four OBBBA tax deductions are temporary and expire after the 2028 tax year unless Congress passes legislation to extend them. After 2028, tips and overtime would once again be fully subject to federal income tax. There is political interest in making these provisions permanent, but no guarantee. Plan your finances accordingly and do not assume the deductions will continue beyond 2028." },
    { question: "Does my state also exempt tips and overtime from taxes?", answer: "Not automatically. The OBBBA only affects federal income taxes. Each state sets its own tax rules. As of early 2026, no states have passed matching exemptions for tips or overtime, though several have introduced bills. If you live in a state with no income tax (Texas, Florida, Nevada, etc.), you already pay no state tax on this income. If your state has an income tax, your tips and overtime remain fully taxable at the state level." },
    { question: "Do I still pay Social Security and Medicare on tips?", answer: "Yes. The OBBBA exempts tips and overtime from federal income tax only. FICA taxes still apply in full. That means you pay 6.2% for Social Security (up to the wage base of $184,500 in 2026) and 1.45% for Medicare on every dollar of tips and overtime. Your employer also pays the matching FICA amount. This is an important distinction because FICA adds 7.65% in taxes that the deduction does not eliminate." },
    { question: "What if I earn over $150,000 - do I lose the deduction entirely?", answer: "Not necessarily. The phase-out for tips and overtime is gradual, not a cliff. It begins at $150,000 MAGI for single filers ($300,000 for married filing jointly). As your income rises above the threshold, the deduction amount is reduced proportionally. You lose the deduction entirely once your income exceeds the phase-out range. Workers with income slightly above the threshold will still receive a partial deduction." },
    { question: "Can gig workers (Uber, DoorDash) claim the tip deduction?", answer: "It depends. The tip deduction is designed for workers in traditionally tipped occupations. Gig workers who receive tips through platforms like Uber, DoorDash, or Instacart may qualify if their tips are separately identified and reported. However, gig workers are typically classified as independent contractors, and the deduction language focuses on tips reported through W-2 employment. The IRS is expected to issue guidance clarifying eligibility for gig workers. Consult a tax professional if you rely on gig tip income." },
    { question: "Is the $25,000 tip cap per person or per household?", answer: "The $25,000 tip deduction cap is per person, not per household. If both spouses earn tips, each can deduct up to $25,000, for a combined household deduction of up to $50,000. However, the MAGI phase-out threshold for married filing jointly is $300,000, which is double the single filer threshold of $150,000. If you file separately, each spouse uses the $150,000 threshold independently." },
  ],
  relatedTools: [
    { name: "OBBBA Tax Calculator", href: "/tools/obbba-tax-calculator" },
    { name: "Tax Calculator", href: "/tools/tax-calculator" },
    { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
    { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
    { name: "Tip Calculator", href: "/tools/tip-calculator" },
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
          <li><Link href="#what-is-obbba" className="text-blue-400 hover:text-blue-300">What Is the OBBBA?</Link></li>
          <li><Link href="#no-tax-on-tips" className="text-blue-400 hover:text-blue-300">No Tax on Tips: Who Qualifies and How Much You Save</Link></li>
          <li><Link href="#no-tax-on-overtime" className="text-blue-400 hover:text-blue-300">No Tax on Overtime: Who Qualifies and How Much You Save</Link></li>
          <li><Link href="#senior-bonus-deduction" className="text-blue-400 hover:text-blue-300">Senior Bonus Deduction ($6,000)</Link></li>
          <li><Link href="#auto-loan-interest" className="text-blue-400 hover:text-blue-300">Auto Loan Interest Deduction ($10,000)</Link></li>
          <li><Link href="#how-to-claim" className="text-blue-400 hover:text-blue-300">How to Claim These Deductions on Your Tax Return</Link></li>
          <li><Link href="#stacking-deductions" className="text-blue-400 hover:text-blue-300">Can You Stack Multiple OBBBA Deductions?</Link></li>
          <li><Link href="#common-mistakes" className="text-blue-400 hover:text-blue-300">Common Mistakes to Avoid</Link></li>
          <li><Link href="#comparison-table" className="text-blue-400 hover:text-blue-300">Side-by-Side Comparison of All 4 Provisions</Link></li>
          <li><Link href="#faq" className="text-blue-400 hover:text-blue-300">FAQ</Link></li>
        </ol>
      </nav>

      <p>
        The One Big Beautiful Bill Act changed taxes for millions of American workers. If you earn tips, work overtime, are 65 or older, or recently financed a new car, you could save thousands of dollars per year on your federal taxes. These are real deductions available right now for the 2025 through 2028 tax years.
      </p>
      <p>
        Below we break down all four OBBBA tax provisions in detail: who qualifies, how much you can deduct, the income phase-out thresholds, and exactly how to claim each one — with real-world examples and dollar amounts so you can estimate your own savings.
      </p>

      <section id="what-is-obbba">
        <h2>What Is the OBBBA?</h2>
        <p>
          The One Big Beautiful Bill Act (OBBBA) is a comprehensive tax and spending bill signed into law in 2025. While the bill covers a wide range of policy areas, its most impactful provisions for everyday workers are four new tax deductions that reduce federal income tax on specific types of income.
        </p>
        <p>
          The four key tax provisions are:
        </p>
        <ul>
          <li><strong>No tax on tips</strong> — A deduction of up to $25,000 per year for workers in tipped occupations</li>
          <li><strong>No tax on overtime</strong> — A deduction for overtime pay earned by hourly (FLSA non-exempt) workers</li>
          <li><strong>Senior bonus deduction</strong> — An additional $6,000 deduction for taxpayers aged 65 and older</li>
          <li><strong>Auto loan interest deduction</strong> — Up to $10,000 in interest on loans for new, American-assembled vehicles</li>
        </ul>
        <p>
          All four deductions are claimed on the new Schedule 1-A and appear on Form 1040 line 13b, alongside your standard or itemized deduction. You can claim them whether you take the standard deduction or itemize. They reduce your taxable income (not your AGI), which means they lower your tax bill but do not affect AGI-based thresholds for other benefits. Married filing separately filers cannot claim any of these deductions.
        </p>
        <p>
          There is one critical detail: all four provisions are temporary. They apply to tax years 2025 through 2028 and automatically expire unless Congress acts to extend them.
        </p>
      </section>

      <section id="no-tax-on-tips">
        <h2>No Tax on Tips: Who Qualifies and How Much You Save</h2>
        <p>
          The tip deduction is the most talked-about provision of the OBBBA, and for good reason. Roughly 4 million American workers earn a significant portion of their income from tips. For many of these workers, the deduction means keeping $1,000 to $3,000 more per year.
        </p>

        <h3>Who Qualifies</h3>
        <p>
          You qualify for the tip tax deduction if you work in an occupation that the IRS has listed as &quot;customarily and regularly receiving tips&quot; (see the full list at IRS.gov/TippedOccupations) and your tips are reported on your W-2 or other tax forms. Qualifying occupations include:
        </p>
        <ul>
          <li>Restaurant servers and waitstaff</li>
          <li>Bartenders</li>
          <li>Baristas and coffee shop workers</li>
          <li>Hairdressers, barbers, and cosmetologists</li>
          <li>Hotel housekeepers and bellhops</li>
          <li>Valets and parking attendants</li>
          <li>Delivery drivers (who receive tips)</li>
          <li>Nail technicians and spa workers</li>
          <li>Casino dealers</li>
          <li>Tour guides</li>
        </ul>

        <h3>How Much You Can Deduct</h3>
        <p>
          You can deduct up to <strong>$25,000 per year</strong> in tip income from your federal taxable income. This is the annual cap regardless of how much you actually earn in tips. If you earn $18,000 in tips, you deduct $18,000. If you earn $40,000 in tips, you deduct the maximum $25,000.
        </p>

        <h3>Income Phase-Out</h3>
        <p>
          The deduction begins to phase out at <strong>$150,000 MAGI for single filers</strong> and <strong>$300,000 for married filing jointly</strong>. The phase-out is gradual, not a cliff. As your modified adjusted gross income rises above the threshold, the deduction is reduced proportionally until it reaches zero.
        </p>
        <p>
          For most tipped workers, the phase-out is irrelevant. A server earning $50,000 in total compensation is well below the threshold. The phase-out primarily affects high-earning tipped workers such as bartenders at upscale establishments or hairdressers with celebrity clientele.
        </p>

        <h3>Important: FICA Still Applies</h3>
        <p>
          The tip deduction eliminates federal <em>income</em> tax on tips. It does <strong>not</strong> eliminate FICA taxes. You still pay 6.2% for Social Security and 1.45% for Medicare on all tip income, and your employer pays the matching amount. This means tips are still subject to 7.65% in payroll taxes on the employee side.
        </p>
        <p>
          This is the single biggest misconception about the OBBBA. &quot;No tax on tips&quot; does not mean zero taxes on tips. It means no federal income tax on tips.
        </p>

        <h3>Duration</h3>
        <p>
          The tip deduction is effective for tax years 2025 through 2028. It sunsets automatically after 2028 unless Congress extends it.
        </p>

        <h3>Example: How Much a Server Saves</h3>
        <p>
          Let us walk through a real example. Maria is a full-time server in Texas. She earns $30,000 in base wages and $20,000 in tips per year. She files as single with no dependents.
        </p>
        <table>
          <thead>
            <tr><th>Item</th><th>Without OBBBA</th><th>With OBBBA</th></tr>
          </thead>
          <tbody>
            <tr><td>Gross income</td><td>$50,000</td><td>$50,000</td></tr>
            <tr><td>Tip deduction</td><td>$0</td><td>-$20,000</td></tr>
            <tr><td>Standard deduction (2026)</td><td>-$16,100</td><td>-$16,100</td></tr>
            <tr><td>Taxable income</td><td>$33,900</td><td>$13,900</td></tr>
            <tr><td>Federal income tax</td><td>~$3,820</td><td>~$1,420</td></tr>
            <tr><td><strong>Annual savings</strong></td><td></td><td><strong>~$2,400</strong></td></tr>
          </tbody>
        </table>
        <p>
          Maria saves approximately $2,400 per year in federal income taxes. Over the four-year life of the provision (2025-2028), that is roughly $9,600 in total savings. She lives in Texas, which has no state income tax, so there is no state-level impact. Workers in states with income taxes would still owe state tax on their tip income.
        </p>
        <p>
          Note that Maria still pays FICA on her $20,000 in tips: $1,240 in Social Security tax and $290 in Medicare tax. The OBBBA does not change this.
        </p>
      </section>

      <ToolCTA
        name="OBBBA Tax Calculator"
        href="/tools/obbba-tax-calculator"
        description="Enter your wages, tips, overtime, filing status, and state to see exactly how much the OBBBA saves you. Calculates all four deductions side by side."
      />

      <section id="no-tax-on-overtime">
        <h2>No Tax on Overtime: Who Qualifies and How Much You Save</h2>
        <p>
          The overtime tax deduction rewards workers who put in extra hours. If you are an hourly worker who regularly works more than 40 hours per week, this deduction can save you $1,000 to $2,000 or more per year.
        </p>

        <h3>Who Qualifies</h3>
        <p>
          You must meet two requirements:
        </p>
        <ul>
          <li><strong>FLSA non-exempt:</strong> You must be classified as a non-exempt worker under the Fair Labor Standards Act. This generally means you are paid hourly and receive time-and-a-half for hours over 40 per week. Salaried exempt employees (managers, professionals, administrators) do not qualify.</li>
          <li><strong>W-2 employee:</strong> You must be a W-2 employee, not an independent contractor. Self-employed individuals and 1099 workers are not eligible.</li>
        </ul>
        <p>
          Common occupations that qualify include warehouse workers, factory workers, nurses (hourly), construction laborers, retail hourly employees, mechanics, truck drivers (hourly), and food service workers.
        </p>

        <h3>How Much You Can Deduct</h3>
        <p>
          You can deduct overtime pay up to <strong>$12,500 per year for single filers</strong> and <strong>$25,000 for married filing jointly</strong>. Only pay earned for hours beyond 40 per week qualifies. Your regular 40-hour pay is not affected.
        </p>

        <h3>Income Phase-Out</h3>
        <p>
          The phase-out is the same as the tip deduction: it begins at <strong>$150,000 MAGI for single filers</strong> and <strong>$300,000 for married filing jointly</strong>. The phase-out is gradual.
        </p>

        <h3>FICA Still Applies</h3>
        <p>
          Just like tips, overtime pay is exempt from federal income tax under the OBBBA but remains subject to FICA taxes (6.2% Social Security + 1.45% Medicare). Your employer continues to pay the matching amount.
        </p>

        <h3>Duration</h3>
        <p>
          Effective for tax years 2025 through 2028, with the same sunset as the tip deduction.
        </p>

        <h3>Example: How Much a Warehouse Worker Saves</h3>
        <p>
          James works in a distribution warehouse in Ohio. His base pay is $22 per hour. He regularly works 50 hours per week, meaning 10 hours of overtime at $33 per hour (time and a half). He files as single.
        </p>
        <table>
          <thead>
            <tr><th>Item</th><th>Calculation</th></tr>
          </thead>
          <tbody>
            <tr><td>Regular pay (40 hrs/wk &times; 52 wks)</td><td>$45,760</td></tr>
            <tr><td>Overtime pay (10 hrs/wk &times; $33 &times; 52 wks)</td><td>$17,160</td></tr>
            <tr><td>Total gross income</td><td>$62,920</td></tr>
            <tr><td>OT deduction (capped at $12,500)</td><td>-$12,500</td></tr>
            <tr><td>Standard deduction (2026)</td><td>-$16,100</td></tr>
            <tr><td>Taxable income (with OBBBA)</td><td>$34,320</td></tr>
            <tr><td>Taxable income (without OBBBA)</td><td>$46,820</td></tr>
            <tr><td><strong>Federal income tax savings</strong></td><td><strong>~$1,500-$2,000</strong></td></tr>
          </tbody>
        </table>
        <p>
          James saves roughly $1,500 to $2,000 per year in federal income taxes. The exact amount depends on his other deductions and credits. His overtime pay of $17,160 exceeds the $12,500 single-filer cap, so $4,660 of his overtime is still taxed as regular income.
        </p>
        <p>
          If James were married filing jointly, his cap would be $25,000, and his full $17,160 in overtime would be deductible.
        </p>
      </section>

      <section id="senior-bonus-deduction">
        <h2>Senior Bonus Deduction ($6,000)</h2>
        <p>
          The OBBBA includes a $6,000 additional deduction for taxpayers aged 65 and older. This is separate from and stacks with the existing additional standard deduction for seniors ($1,950 for single filers and $1,550 per married spouse in 2025).
        </p>

        <h3>Who Qualifies</h3>
        <p>
          You must be age 65 or older by the end of the tax year. There is no occupation or income-type requirement. Any income qualifies: wages, Social Security, pension, investment income, and so on.
        </p>

        <h3>How It Stacks</h3>
        <p>
          The $6,000 OBBBA senior deduction is in addition to the standard deduction and the existing senior standard deduction bump. Here is what a single filer aged 65+ gets in total:
        </p>
        <table>
          <thead>
            <tr><th>Deduction</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>Standard deduction (2026)</td><td>$16,100</td></tr>
            <tr><td>Existing senior bonus (65+)</td><td>$1,950</td></tr>
            <tr><td>OBBBA senior deduction</td><td>$6,000</td></tr>
            <tr><td><strong>Total standard deduction</strong></td><td><strong>$24,050</strong></td></tr>
          </tbody>
        </table>
        <p>
          For a married couple where both spouses are 65+, the total standard deduction would be $32,200 + $3,100 (2 &times; $1,550) + $12,000 (2 &times; $6,000) = $47,300. That is a significant amount of tax-free income.
        </p>

        <h3>Income Phase-Out (Lower Threshold)</h3>
        <p>
          The senior bonus deduction has a <strong>much lower phase-out threshold</strong> than the tip and overtime deductions. It begins at <strong>$75,000 MAGI for single filers</strong> and <strong>$150,000 for married filing jointly</strong>. The phase-out is gradual.
        </p>
        <p>
          This lower threshold means many working seniors with moderate incomes will see a reduced deduction. A single retiree with $90,000 in combined pension and Social Security income would receive a partial deduction rather than the full $6,000.
        </p>

        <h3>Duration</h3>
        <p>
          Effective for tax years 2025 through 2028, same sunset as the other provisions.
        </p>
      </section>

      <section id="auto-loan-interest">
        <h2>Auto Loan Interest Deduction ($10,000)</h2>
        <p>
          The fourth OBBBA provision allows taxpayers to deduct interest paid on auto loans for qualifying new vehicles. The maximum deduction is <strong>$10,000 per year</strong> in interest paid.
        </p>

        <h3>Vehicle Requirements</h3>
        <ul>
          <li><strong>New vehicles only</strong> — Used cars do not qualify</li>
          <li><strong>Personal use only</strong> — Business or commercial vehicles do not qualify</li>
          <li><strong>Final assembly in the United States</strong> — Verify via the vehicle information label on the dealer lot or the NHTSA VIN Decoder</li>
          <li><strong>Under 14,000 lbs GVWR</strong> — Gross vehicle weight rating must be below 14,000 pounds, which includes virtually all passenger cars, SUVs, and light trucks</li>
        </ul>

        <h3>Loan Requirements</h3>
        <p>
          The auto loan must be taken out during the 2025-2028 period. Loans from before 2025 do not qualify, even if you are still making payments during this window. Refinanced loans may qualify if the refinance occurs during the eligible period, but consult a tax professional to confirm.
        </p>

        <h3>Income Phase-Out</h3>
        <p>
          The phase-out for the auto loan deduction starts at <strong>$100,000 MAGI for single filers</strong> and <strong>$200,000 for married filing jointly</strong>. This is a middle threshold between the senior deduction ($75K/$150K) and the tip/overtime deduction ($150K/$300K).
        </p>

        <h3>How Much This Is Worth</h3>
        <p>
          A typical new car loan of $35,000 at 6.5% interest generates roughly $2,100 in interest in the first year. For a taxpayer in the 22% bracket, deducting $2,100 saves about $460 in federal taxes. Over the life of a 60-month loan, total interest might be $6,000-$8,000, meaning cumulative tax savings of $1,300-$1,760 for a 22% bracket filer.
        </p>
        <p>
          For larger loans on trucks or SUVs, the savings are proportionally higher. A $55,000 truck loan at 7% interest could generate $3,500+ in first-year interest, yielding $770+ in tax savings for a 22% bracket filer.
        </p>
      </section>

      <section id="how-to-claim">
        <h2>How to Claim These Deductions on Your Tax Return</h2>
        <p>
          All four OBBBA deductions are reported on the new Schedule 1-A and reduce your taxable income on Form 1040 line 13b. This means:
        </p>
        <ul>
          <li>You do <strong>not</strong> need to itemize to claim them</li>
          <li>They reduce your taxable income (note: they do not reduce your AGI)</li>
          <li>You can take these deductions in addition to the standard deduction</li>
          <li>Married filing separately filers are <strong>not eligible</strong> for any OBBBA deductions</li>
        </ul>

        <h3>Tips</h3>
        <p>
          Your employer should track and report your tip income on your W-2. Box 7 shows Social Security tips, and Box 8 shows allocated tips. When you file your return, the tip deduction is entered as an adjustment to income on Form 1040. If you receive cash tips, report them to your employer monthly using Form 4070 so they are captured on your W-2.
        </p>

        <h3>Overtime</h3>
        <p>
          Your employer reports your total wages on your W-2, including overtime pay. For tax year 2025, employers are <strong>not required</strong> to separately report overtime on the W-2 — the IRS issued Notice 2025-69 with guidance on how workers can calculate the deduction themselves using pay stubs and records. Starting in 2026, employers <strong>will be required</strong> to separately identify overtime compensation on updated W-2 forms. Keep your pay stubs as backup documentation.
        </p>

        <h3>Senior Deduction and Auto Loan Interest</h3>
        <p>
          The senior deduction is straightforward: if you are 65 or older, it is an additional deduction on your return. For the auto loan interest deduction, your lender is required to report interest of $600 or more annually. For 2025, the IRS provided transition relief (Notice 2025-57) allowing lenders to report via online portals, monthly statements, or annual statements — there is no specific IRS form yet (Form 1098 is for mortgage interest only). Keep your loan statements showing interest paid as documentation.
        </p>

        <h3>Sunset Warning</h3>
        <p>
          These deductions expire after the 2028 tax year. If you are making financial decisions based on these tax savings, such as choosing a job with more overtime or financing a new car, factor in that the benefits are temporary. Do not assume they will be extended.
        </p>
      </section>

      <ToolCTA
        name="OBBBA Tax Calculator"
        href="/tools/obbba-tax-calculator"
        description="See your total OBBBA savings in under a minute. Enter your tip income, overtime pay, age, and auto loan details to get a personalized breakdown of all eligible deductions."
      />

      <section id="stacking-deductions">
        <h2>Can You Stack Multiple OBBBA Deductions?</h2>
        <p>
          Yes. The four OBBBA deductions are independent. If you qualify for more than one, you can claim all of them. There is no combined cap across the provisions.
        </p>

        <h3>Example: Tipped Hourly Worker (Tips + Overtime)</h3>
        <p>
          Sofia is a bartender who works 45 hours per week. She earns $15/hour in base pay plus $22,000 per year in tips. Her 5 weekly overtime hours generate an additional $5,850 in annual overtime pay ($22.50/hr &times; 5 hrs &times; 52 wks).
        </p>
        <ul>
          <li>Tip deduction: $22,000 (under the $25,000 cap)</li>
          <li>Overtime deduction: $5,850 (under the $12,500 cap)</li>
          <li><strong>Total OBBBA deductions: $27,850</strong></li>
        </ul>
        <p>
          At a 12% effective tax rate, Sofia saves roughly $3,340 per year in federal income taxes.
        </p>

        <h3>Example: Senior with Auto Loan (Senior + Auto Loan Interest)</h3>
        <p>
          Robert is 68 years old, retired, and recently purchased a new American-assembled SUV with a $40,000 loan at 6.5% interest. He has $60,000 in annual retirement income (pension plus Social Security).
        </p>
        <ul>
          <li>Senior bonus deduction: $6,000 (below the $75,000 phase-out)</li>
          <li>Auto loan interest deduction: ~$2,400 (first-year interest on $40K loan)</li>
          <li><strong>Total OBBBA deductions: $8,400</strong></li>
        </ul>
        <p>
          At Robert&apos;s income level and tax bracket, this saves him roughly $1,000-$1,200 in federal taxes for the year.
        </p>

        <h3>Example: 65+ Delivery Driver (Tips + Overtime + Senior)</h3>
        <p>
          The maximum stacking scenario: Linda is a 66-year-old hourly delivery driver who earns tips and works overtime. She qualifies for three deductions simultaneously.
        </p>
        <ul>
          <li>Tip deduction: up to $25,000</li>
          <li>Overtime deduction: up to $12,500</li>
          <li>Senior bonus deduction: $6,000 (subject to the lower $75,000 phase-out)</li>
          <li><strong>Maximum combined OBBBA deductions: up to $43,500</strong></li>
        </ul>
        <p>
          In practice, few workers will max out all three. But even partial stacking produces meaningful savings. A 65-year-old server earning $15,000 in tips and claiming the $6,000 senior deduction saves well over $2,000 per year.
        </p>
      </section>

      <section id="common-mistakes">
        <h2>Common Mistakes to Avoid</h2>

        <h3>1. Thinking tips are exempt from ALL taxes</h3>
        <p>
          This is the number one misconception. The OBBBA exempts tips from federal income tax only. FICA taxes (Social Security at 6.2% and Medicare at 1.45%) still apply to every dollar of tip income. State income taxes are also unaffected. A worker earning $20,000 in tips still pays $1,530 in FICA taxes on that income, even with the OBBBA deduction.
        </p>

        <h3>2. Salaried workers trying to claim the overtime deduction</h3>
        <p>
          The overtime deduction is only for FLSA non-exempt workers, which typically means hourly employees. If you are a salaried exempt employee (manager, professional, administrator), you do not qualify even if you regularly work 50 or 60 hours per week. The FLSA classification is what matters, not the number of hours you work.
        </p>

        <h3>3. Forgetting the different phase-out thresholds</h3>
        <p>
          Each provision has its own phase-out. The tip and overtime deductions phase out starting at $150,000/$300,000 (single/MFJ). The senior deduction phases out at the much lower $75,000/$150,000. The auto loan interest deduction phases out at $100,000/$200,000. Using the wrong threshold could lead to overclaiming the deduction.
        </p>

        <h3>4. Not realizing this is temporary</h3>
        <p>
          All four provisions sunset after the 2028 tax year. Do not restructure your entire financial life around these deductions without a plan for when they expire. If you are counting on the overtime deduction to make a higher-hour job financially worthwhile, consider what happens in 2029 when that deduction disappears.
        </p>

        <h3>5. Assuming state taxes follow federal rules</h3>
        <p>
          The OBBBA is a federal law. Your state income tax is unaffected. If you live in California, New York, or any other state with an income tax, your tips and overtime remain fully taxable at the state level. Only workers in states without income tax (Texas, Florida, Nevada, Washington, Wyoming, South Dakota, Alaska, Tennessee, New Hampshire) avoid both federal and state income tax on their tips.
        </p>

        <h3>6. Underreporting tips to avoid FICA</h3>
        <p>
          Some workers may be tempted to underreport tips since they already get the income tax deduction. This is illegal and counterproductive. Underreported tips reduce your Social Security benefit in retirement and can trigger IRS audits. The OBBBA gives you a legitimate deduction. Use it properly and report all tips accurately.
        </p>
      </section>

      <section id="comparison-table">
        <h2>Side-by-Side Comparison of All 4 OBBBA Provisions</h2>
        <table>
          <thead>
            <tr>
              <th>Provision</th>
              <th>Max Deduction</th>
              <th>Who Qualifies</th>
              <th>Phase-Out (Single / MFJ)</th>
              <th>FICA Exempt?</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>No tax on tips</td>
              <td>$25,000/yr</td>
              <td>Tipped W-2 workers</td>
              <td>$150K / $300K</td>
              <td>No</td>
              <td>After 2028</td>
            </tr>
            <tr>
              <td>No tax on overtime</td>
              <td>$12,500 single / $25,000 MFJ</td>
              <td>FLSA non-exempt hourly W-2 workers</td>
              <td>$150K / $300K</td>
              <td>No</td>
              <td>After 2028</td>
            </tr>
            <tr>
              <td>Senior bonus</td>
              <td>$6,000/yr</td>
              <td>Taxpayers age 65+</td>
              <td>$75K / $150K</td>
              <td>N/A</td>
              <td>After 2028</td>
            </tr>
            <tr>
              <td>Auto loan interest</td>
              <td>$10,000/yr</td>
              <td>New U.S.-assembled vehicle buyers</td>
              <td>$100K / $200K</td>
              <td>N/A</td>
              <td>After 2028</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Key Takeaways</h2>
        <ul>
          <li>The OBBBA creates four deductions (claimed on Schedule 1-A, Form 1040 line 13b) for tax years 2025-2028: tips ($25K cap), overtime ($12.5K/$25K cap), senior bonus ($6K), and auto loan interest ($10K)</li>
          <li>Tips and overtime are exempt from federal income tax only. FICA taxes (7.65%) still apply</li>
          <li>Each deduction has its own income phase-out threshold. Tips and overtime: $150K/$300K. Senior: $75K/$150K. Auto: $100K/$200K</li>
          <li>You can stack multiple deductions if you qualify for more than one</li>
          <li>These are Schedule 1-A deductions (Form 1040 line 13b), so you do not need to itemize</li>
          <li>State income taxes are not affected by the OBBBA</li>
          <li>All provisions expire after 2028 unless Congress extends them</li>
          <li>Consult a tax professional for advice specific to your situation, especially if your income is near a phase-out threshold</li>
        </ul>
      </section>

      <p className="text-sm text-zinc-500 italic mt-8">
        Disclaimer: This article is for informational purposes only and does not constitute tax advice. Tax laws are complex and individual circumstances vary. Consult a qualified tax professional or CPA before making decisions based on the information in this guide. While we strive for accuracy, tax rules can change and IRS guidance may differ from preliminary interpretations.
      </p>
    </BlogLayout>
  );
}
