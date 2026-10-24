import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "Medicaid Work Requirements 2027: Who Is Affected, Who Is Exempt, and What to Do",
  slug: "medicaid-work-requirement-explained",
  description: "The OBBBA adds an 80-hour monthly work requirement for Medicaid expansion enrollees starting January 2027. Learn who is affected, the full list of exemptions, consequences of noncompliance, and how to prepare.",
  datePublished: "2026-03-11",
  dateModified: "2026-03-11",
  tags: ["Medicaid", "Work Requirement", "OBBBA", "Healthcare", "Health Insurance", "2027"],
  faqs: [
    { question: "When do Medicaid work requirements start?", answer: "The federal mandate takes effect January 1, 2027 in all Medicaid expansion states. However, states can implement earlier. Nebraska began enforcement on May 1, 2026. All states must conduct outreach to notify affected enrollees between June 30 and August 31, 2026. If you are enrolled in Medicaid through the expansion, you should expect to receive a notice from your state by late summer 2026." },
    { question: "How many hours per month do I need to work for Medicaid?", answer: "You must complete 80 hours per month of qualifying activities — about 20 hours per week. Qualifying activities include paid employment, job training, higher education or career/technical education (at least half-time), community service, or volunteering. You can combine different activities. There is also an income-based alternative: earning at least $580 per month from employment satisfies the requirement regardless of hours worked." },
    { question: "What happens if I lose Medicaid for not meeting the work requirement?", answer: "If you are disenrolled, you must reapply from scratch. There is no automatic reinstatement. Additionally, the law bars individuals disenrolled for noncompliance from receiving premium tax credits for ACA Marketplace coverage (Healthcare.gov). This means you could lose access to both Medicaid and subsidized private insurance. This makes it critical to either meet the requirement or claim an exemption before the deadline." },
    { question: "Can I volunteer instead of working?", answer: "Yes. Community service and volunteering count as qualifying activities toward the 80-hour requirement. You can volunteer at a nonprofit, food bank, faith-based organization, school, or government program. Keep a log of your volunteer hours with signatures or confirmation from the organization, as your state may request documentation." },
    { question: "Does caring for my children count toward the 80 hours?", answer: "Caring for children is handled as an exemption, not a qualifying activity. If you are a parent, guardian, or caretaker relative of a dependent child age 13 or younger, you are exempt from the work requirement entirely. You do not need to log 80 hours. Make sure to claim this exemption when your state contacts you." },
    { question: "What if I have a disability or mental health condition?", answer: "You are likely exempt. The law exempts individuals who are blind, disabled, or have a physical, intellectual, or developmental disability. It also exempts individuals with substance use disorder, serious mental illness, or serious or complex medical conditions under the 'medically frail' category. If any of these apply, you should claim the exemption. Documentation from your doctor can help support your claim." },
    { question: "Do all states have Medicaid work requirements?", answer: "Only states that have expanded Medicaid are affected — 40 states plus the District of Columbia. The 10 non-expansion states (Alabama, Florida, Georgia, Kansas, Mississippi, South Carolina, Tennessee, Texas, Wisconsin, Wyoming) are not directly affected because they do not have Medicaid expansion populations. States cannot waive the requirement after January 1, 2027." },
    { question: "How does my state verify my hours?", answer: "States must first attempt to verify compliance through automatic data matching — payroll records, TANF/SNAP records, and educational enrollment databases. If your hours cannot be verified automatically, your state may ask you to self-report. Verification occurs at least every 6 months. At application, states review a look-back period of 1 to 3 months." },
    { question: "What is the 30-day cure period?", answer: "If your state cannot verify that you meet the 80-hour requirement, you will receive a noncompliance notice. You then have 30 days to either demonstrate that you are in compliance or claim an exemption. During this 30-day period, your Medicaid coverage continues. If you do not respond within 30 days, you will be disenrolled no later than the end of the month following the cure period." },
    { question: "How many people could lose Medicaid coverage?", answer: "The Congressional Budget Office estimated that 5.2 million adults could lose Medicaid coverage by 2034 under the House-passed version of the bill. The enacted law includes larger Medicaid cuts ($911 billion over 10 years versus the House version's $625 billion), so the actual number could be higher. An estimated 18.5 million people are currently enrolled in Medicaid through the expansion." },
  ],
  relatedTools: [
    { name: "Medicaid Work Requirement Calculator", href: "/tools/medicaid-work-requirement-calculator" },
    { name: "OBBBA Tax Calculator", href: "/tools/obbba-tax-calculator" },
    { name: "Budget Calculator", href: "/tools/budget-calculator" },
  ],
  relatedArticles: [
    { title: "No Tax on Tips or Overtime: OBBBA Guide (2026)", href: "/blog/no-tax-on-tips-obbba-guide" },
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
          <li><Link href="#what-changed" className="text-blue-400 hover:text-blue-300">What Changed Under the OBBBA</Link></li>
          <li><Link href="#who-affected" className="text-blue-400 hover:text-blue-300">Who Is Affected</Link></li>
          <li><Link href="#qualifying-activities" className="text-blue-400 hover:text-blue-300">What Counts Toward the 80 Hours</Link></li>
          <li><Link href="#exemptions" className="text-blue-400 hover:text-blue-300">Complete List of Exemptions</Link></li>
          <li><Link href="#consequences" className="text-blue-400 hover:text-blue-300">What Happens If You Do Not Comply</Link></li>
          <li><Link href="#timeline" className="text-blue-400 hover:text-blue-300">Key Dates and Timeline</Link></li>
          <li><Link href="#how-to-prepare" className="text-blue-400 hover:text-blue-300">How to Prepare Now</Link></li>
          <li><Link href="#state-status" className="text-blue-400 hover:text-blue-300">State-by-State Status</Link></li>
          <li><Link href="#faq" className="text-blue-400 hover:text-blue-300">FAQ</Link></li>
        </ol>
      </nav>

      <p>
        Starting January 1, 2027, millions of Americans on Medicaid will be required to prove they are working, volunteering, or in school for at least 80 hours per month — or risk losing their health insurance. This new requirement was enacted as part of the One Big Beautiful Bill Act (OBBBA) signed into law in 2025.
      </p>
      <p>
        An estimated 18.5 million people are enrolled in Medicaid through the ACA expansion. The Congressional Budget Office estimated that 5.2 million could lose coverage by 2034 under the House-passed version of the bill. The enacted law includes larger Medicaid cuts ($911 billion over 10 years), so the actual impact may be higher.
      </p>
      <p>
        This guide explains exactly who is affected, who is exempt, what activities count, and what you should do now to protect your coverage.
      </p>

      <ToolCTA name="Medicaid Work Requirement Calculator" href="/tools/medicaid-work-requirement-calculator" description="Check if you are subject to the work requirement, whether you qualify for an exemption, and how many hours you need. Free, private, no signup required." />

      <section id="what-changed">
        <h2>What Changed Under the OBBBA</h2>
        <p>
          Before the OBBBA, Medicaid expansion enrollees did not have to meet a work requirement. Several states had attempted to add work requirements through federal waivers, but most were struck down by courts.
        </p>
        <p>
          The OBBBA made work requirements mandatory for all Medicaid expansion states. This is now federal law, not a waiver that can be challenged. The key provisions:
        </p>
        <ul>
          <li><strong>80 hours per month</strong> of qualifying &ldquo;community engagement&rdquo; activities</li>
          <li>Applies to adults <strong>ages 19-64</strong> enrolled through Medicaid expansion</li>
          <li>Takes effect <strong>January 1, 2027</strong> in all expansion states</li>
          <li>Multiple <strong>exemption categories</strong> for those who cannot work</li>
          <li><strong>Noncompliance results in disenrollment</strong> from Medicaid and ineligibility for ACA Marketplace subsidies</li>
        </ul>
      </section>

      <section id="who-affected">
        <h2>Who Is Affected</h2>
        <p>
          The work requirement applies specifically to adults ages 19 through 64 who are enrolled in Medicaid through the ACA expansion. This generally means adults with household income up to 138% of the Federal Poverty Level (about $22,025 per year for a single person in 2026).
        </p>
        <p>
          If you receive Medicaid through a different eligibility category — such as disability, pregnancy, or as a parent of a child in a non-expansion state — you are not subject to this specific requirement.
        </p>
        <p>
          The requirement applies in all <strong>40 states plus DC</strong> that have expanded Medicaid. The 10 states that have not expanded Medicaid (Alabama, Florida, Georgia, Kansas, Mississippi, South Carolina, Tennessee, Texas, Wisconsin, and Wyoming) are not directly affected.
        </p>
      </section>

      <section id="qualifying-activities">
        <h2>What Counts Toward the 80 Hours</h2>
        <p>
          You do not necessarily have to have a traditional job to meet the requirement. The following activities all count toward the 80-hour monthly threshold:
        </p>

        <h3>Paid Employment</h3>
        <p>
          Any paid work counts — part-time or full-time, hourly or salaried. There is no minimum wage requirement. If you work 20 hours per week, you meet the 80-hour monthly requirement. Self-employment also counts, though verification may be harder since it is not captured by payroll data matching.
        </p>

        <h3>Income-Based Alternative</h3>
        <p>
          If you earn at least <strong>$580 per month</strong> from employment (equivalent to 80 hours at the federal minimum wage of $7.25/hr), you satisfy the requirement regardless of how many hours you actually work. This is important for people who earn above minimum wage but work fewer than 20 hours per week.
        </p>

        <h3>Job Training and Workforce Development</h3>
        <p>
          Participating in a job training program, apprenticeship, vocational rehabilitation, or workforce development program counts. This includes state and federally funded programs, as well as SNAP Employment and Training programs.
        </p>

        <h3>Higher Education or Career/Technical Education</h3>
        <p>
          Enrollment at least half-time in a college degree program, certificate program, or career/technical education program counts. Community college courses, trade school, and online programs qualify as long as you meet the half-time enrollment threshold.
        </p>

        <h3>Community Service and Volunteering</h3>
        <p>
          Volunteer work at nonprofits, faith-based organizations, schools, food banks, community centers, or government programs all count. This is an important option for people who are between jobs or cannot find part-time work. Keep a log of your hours with dates and signatures from the organization.
        </p>

        <h3>Combining Activities</h3>
        <p>
          You can mix and match any of the above to reach 80 hours. For example: 10 hours per week of part-time work (43 hours/month) plus 10 hours per week of volunteering (43 hours/month) exceeds the 80-hour threshold.
        </p>
      </section>

      <ToolCTA name="Medicaid Work Requirement Calculator" href="/tools/medicaid-work-requirement-calculator" description="Not sure if you meet the requirement? Enter your activities and hours to see if you hit the 80-hour threshold, or check if you qualify for an exemption." />

      <section id="exemptions">
        <h2>Complete List of Exemptions</h2>
        <p>
          Many people are exempt from the 80-hour requirement. If any of the following apply to you, you do not need to meet the work requirement. However, you must still <strong>claim your exemption</strong> when your state contacts you — failing to respond can result in disenrollment even if you are exempt.
        </p>

        <h3>Mandatory Exemptions (All States Must Honor)</h3>

        <h4>Pregnancy and Postpartum</h4>
        <p>
          Pregnant individuals are exempt. The exemption extends through the full 12-month postpartum Medicaid coverage period after delivery.
        </p>

        <h4>Parents and Caregivers of Young Children</h4>
        <p>
          Parents, guardians, caretaker relatives, or family caregivers of a dependent child age 13 or younger are exempt. This is one of the broadest exemptions — if you have a child under 14 in your household that you care for, you qualify.
        </p>

        <h4>Caregivers of Disabled Individuals</h4>
        <p>
          Family caregivers of a person with a disability are exempt, regardless of the disabled person&apos;s age.
        </p>

        <h4>Medically Frail Individuals</h4>
        <p>The law exempts &ldquo;medically frail&rdquo; individuals, which includes:</p>
        <ul>
          <li>Individuals who are blind or disabled</li>
          <li>Individuals with physical, intellectual, or developmental disabilities</li>
          <li>Individuals with substance use disorder</li>
          <li>Individuals with a serious mental illness or disabling mental health condition</li>
          <li>Individuals with a serious or complex medical condition</li>
        </ul>
        <p>
          If you have any chronic health condition, mental health condition, or disability that limits your ability to work, you likely qualify under this category. Ask your doctor for documentation to support your exemption claim.
        </p>

        <h4>Disabled Veterans</h4>
        <p>
          Veterans with a total disability rating under Title 38 of the U.S. Code are exempt.
        </p>

        <h4>American Indians and Alaska Natives</h4>
        <p>
          Individuals recognized by the Indian Health Service, including California Indians, are exempt.
        </p>

        <h4>Former Foster Care Youth</h4>
        <p>
          Former foster care youth under age 26 are exempt.
        </p>

        <h4>Substance Abuse Treatment Participants</h4>
        <p>
          Individuals currently participating in a qualifying drug addiction or alcoholism treatment and rehabilitation program are exempt (separate from the medically frail SUD exemption above).
        </p>

        <h4>Already Meeting Other Work Requirements</h4>
        <p>
          If you already comply with TANF work requirements or SNAP work requirements, you automatically satisfy the Medicaid requirement. You do not need to separately document your hours.
        </p>

        <h4>Recently Incarcerated or Currently Incarcerated</h4>
        <p>
          Individuals who are currently incarcerated or who were released from incarceration within the past 90 days are exempt.
        </p>

        <h4>Medicare Beneficiaries</h4>
        <p>
          Individuals entitled to Medicare Part A or enrolled in Medicare Part B may be exempt. Note: the scope of this exemption may be limited. Contact your state Medicaid office to confirm how it applies in your state.
        </p>

        <h3>Short-Term Hardship Exemptions (State Discretion)</h3>
        <p>States may also grant monthly exemptions for:</p>
        <ul>
          <li>Individuals receiving inpatient hospital or facility care</li>
          <li>Individuals in areas covered by a presidential disaster or emergency declaration</li>
          <li>Individuals in counties with unemployment above 8% or 1.5 times the national rate</li>
          <li>Individuals who must travel outside their community for extended medical treatment</li>
        </ul>
        <p>
          These hardship exemptions are optional — states may adopt them but are not required to. Check with your state Medicaid office to see which hardship exemptions your state recognizes.
        </p>
      </section>

      <section id="consequences">
        <h2>What Happens If You Do Not Comply</h2>
        <p>
          The consequences of noncompliance are severe. Understanding the process can help you avoid losing your healthcare coverage.
        </p>

        <h3>Step 1: Noncompliance Notice</h3>
        <p>
          If your state cannot verify your compliance through data matching (payroll records, SNAP/TANF records), you will receive a notice by mail plus at least one additional contact method (phone, text, email, or website notification).
        </p>

        <h3>Step 2: 30-Day Cure Period</h3>
        <p>
          You have 30 days to respond to the notice. During this period, your Medicaid coverage continues. You can either demonstrate that you meet the 80-hour requirement or claim an exemption. <strong>Do not ignore this notice.</strong>
        </p>

        <h3>Step 3: Disenrollment</h3>
        <p>
          If you do not respond within 30 days, your state will disenroll you from Medicaid no later than the end of the month following the cure period. Before disenrolling you, the state must check whether you qualify for Medicaid through another eligibility category and must provide written notice with information about your right to a fair hearing.
        </p>

        <h3>Step 4: Reapplication</h3>
        <p>
          To regain Medicaid coverage, you must reapply from scratch. There is no automatic reinstatement. The reapplication triggers another compliance check, so you must be meeting the 80-hour requirement or have an exemption at the time you reapply.
        </p>

        <h3>The Double Penalty: No Marketplace Subsidies</h3>
        <p>
          This is the most critical consequence many people do not know about. If you lose Medicaid due to noncompliance with the work requirement, you are also <strong>barred from receiving premium tax credits</strong> to purchase health insurance through the ACA Marketplace (Healthcare.gov).
        </p>
        <p>
          This means you cannot get subsidized private health insurance either. Without Medicaid or Marketplace subsidies, full-price health insurance for an individual can cost $400-700+ per month — far out of reach for most people in the Medicaid income range.
        </p>
        <p>
          <strong>Bottom line:</strong> Meeting the requirement or claiming an exemption is not optional. The consequences of inaction are losing all affordable health insurance options.
        </p>
      </section>

      <section id="timeline">
        <h2>Key Dates and Timeline</h2>

        <div className="space-y-4 my-6">
          <div className="flex gap-4 items-start">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-zinc-200">July 4, 2025 — OBBBA Signed Into Law</p>
              <p className="text-sm text-zinc-400">The One Big Beautiful Bill Act was signed, establishing the Medicaid work requirement as federal law.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-zinc-200">December 8, 2025 — CMS Implementation Guidance</p>
              <p className="text-sm text-zinc-400">CMS (Centers for Medicare and Medicaid Services) issued initial guidance for states on how to implement the requirement.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-zinc-200">May 1, 2026 — Nebraska Early Enforcement</p>
              <p className="text-sm text-zinc-400">Nebraska is the first state to implement the work requirement early, through a state plan amendment.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-zinc-200">June 1, 2026 — HHS Interim Final Rule</p>
              <p className="text-sm text-zinc-400">HHS must publish detailed implementation rules by this date, which will clarify definitions of &ldquo;medically frail,&rdquo; hardship exemptions, and other details.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-zinc-200">June 30 — August 31, 2026 — State Outreach Period</p>
              <p className="text-sm text-zinc-400">All expansion states must notify affected Medicaid enrollees about the work requirement, exemptions, and consequences of noncompliance.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-zinc-200">January 1, 2027 — Federal Mandate Takes Effect</p>
              <p className="text-sm text-zinc-400">All Medicaid expansion states must condition expansion eligibility on work requirements. This cannot be waived.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-3 h-3 rounded-full bg-zinc-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-base font-medium text-zinc-200">December 31, 2028 — Latest Extension Deadline</p>
              <p className="text-sm text-zinc-400">The latest date by which the HHS Secretary can grant extensions to states demonstrating &ldquo;good faith&rdquo; compliance efforts.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-to-prepare">
        <h2>How to Prepare Now</h2>
        <p>
          Even though the federal mandate does not take effect until January 2027, there are steps you should take now to protect your coverage.
        </p>

        <h3>1. Determine If You Are Exempt</h3>
        <p>
          Review the exemption list above carefully. Many people qualify for an exemption without realizing it. If you care for a child under 14, have any disability or chronic health condition, have a mental health condition, or are in substance abuse recovery, you are likely exempt. Use our <Link href="/tools/medicaid-work-requirement-calculator" className="text-blue-400 hover:text-blue-300">Medicaid work requirement calculator</Link> to check.
        </p>

        <h3>2. Gather Documentation</h3>
        <p>
          If you qualify for an exemption, gather supporting documentation now:
        </p>
        <ul>
          <li><strong>Medical exemptions:</strong> Get a letter from your doctor describing your condition</li>
          <li><strong>Caregiver exemption:</strong> Have proof of the child&apos;s age or the disabled family member&apos;s disability status</li>
          <li><strong>Veteran exemption:</strong> Have your VA disability rating documentation</li>
        </ul>

        <h3>3. Start Tracking Your Hours</h3>
        <p>
          If you are not exempt, begin tracking your qualifying activity hours now. Keep a log with dates, hours, activity type, and any supporting documentation (pay stubs, volunteer sign-in sheets, enrollment verification from your school).
        </p>

        <h3>4. Explore Qualifying Activities</h3>
        <p>
          If you are not currently meeting the 80-hour threshold, consider:
        </p>
        <ul>
          <li><strong>Volunteering:</strong> Local food banks, Habitat for Humanity, libraries, faith-based organizations, and community centers often need help and can document your hours</li>
          <li><strong>Job training programs:</strong> Contact your local American Job Center (find one at <a href="https://www.careeronestop.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">CareerOneStop.org</a>) for free workforce development programs</li>
          <li><strong>Community college:</strong> Many community colleges offer free or low-cost programs for Medicaid enrollees. Half-time enrollment satisfies the requirement</li>
        </ul>

        <h3>5. Update Your Contact Information</h3>
        <p>
          Make sure your state Medicaid office has your current mailing address, phone number, and email. Outreach notices will be sent between June and August 2026. If you miss the notice because of an outdated address, you could be disenrolled without knowing why.
        </p>

        <h3>6. Respond to Every Notice</h3>
        <p>
          When your state contacts you — and they will, between June 30 and August 31, 2026 — respond immediately. Even if you believe you are exempt, you must actively claim your exemption. Silence is treated as noncompliance.
        </p>
      </section>

      <section id="state-status">
        <h2>State-by-State Status</h2>

        <h3>Non-Expansion States (Not Affected)</h3>
        <p>
          These 10 states have not expanded Medicaid and are not directly affected by the new work requirement:
        </p>
        <p className="text-zinc-300">
          Alabama, Florida, Georgia, Kansas, Mississippi, South Carolina, Tennessee, Texas, Wisconsin, Wyoming
        </p>

        <h3>Early Implementation States</h3>
        <ul>
          <li><strong>Nebraska</strong> — First state to implement, enforcement began May 1, 2026</li>
          <li><strong>Georgia</strong> — Has a pre-existing work requirement through its &ldquo;Pathways to Coverage&rdquo; waiver (a partial expansion with conditions). Must comply with new federal rules by January 1, 2027</li>
        </ul>

        <h3>States with Pending Waiver Requests</h3>
        <p>
          Arkansas, Montana, Arizona, Iowa, Ohio, and South Carolina have submitted federal waivers requesting work requirements. These waivers may accelerate implementation before the January 2027 federal deadline.
        </p>

        <h3>All Other Expansion States</h3>
        <p>
          The remaining expansion states must implement the work requirement by January 1, 2027. The HHS Secretary can grant extensions to states making &ldquo;good faith&rdquo; efforts, but only through December 31, 2028 at the latest.
        </p>
      </section>

      <section>
        <h2>Key Takeaways</h2>
        <ul>
          <li>Starting January 1, 2027, Medicaid expansion enrollees ages 19-64 must complete 80 hours per month of work, education, job training, or community service</li>
          <li>Earning at least $580/month from employment satisfies the requirement through an income-based alternative</li>
          <li>Many people are exempt: parents of children under 14, people with disabilities or chronic health conditions, pregnant individuals, veterans, and others</li>
          <li>Noncompliance results in disenrollment from Medicaid <strong>and</strong> ineligibility for ACA Marketplace premium tax credits — a double penalty that can leave you without any affordable health insurance</li>
          <li>You must actively respond to state notices and claim exemptions — silence is treated as noncompliance</li>
          <li>States begin outreach between June 30 and August 31, 2026 — make sure your contact information is up to date</li>
          <li>Use the <Link href="/tools/medicaid-work-requirement-calculator" className="text-blue-400 hover:text-blue-300">Medicaid work requirement calculator</Link> to check your status and determine if you qualify for an exemption</li>
        </ul>
      </section>

      <section>
        <h2>Resources</h2>
        <ul>
          <li><a href="https://www.medicaid.gov" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Medicaid.gov</a> — Official federal Medicaid information and state contact directory</li>
          <li><a href="https://www.kff.org/medicaid/a-closer-look-at-the-work-requirement-provisions-in-the-2025-federal-budget-reconciliation-law/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">KFF: Work Requirement Provisions Analysis</a> — Detailed breakdown of the law from the Kaiser Family Foundation</li>
          <li><a href="https://www.careeronestop.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">CareerOneStop.org</a> — Find local job training and workforce development programs</li>
          <li><Link href="/tools/medicaid-work-requirement-calculator" className="text-blue-400 hover:text-blue-300">ToolPile Medicaid Work Requirement Calculator</Link> — Check your status and exemption eligibility</li>
        </ul>
        <p className="text-sm text-zinc-500 mt-4">
          Disclaimer: This article provides general guidance based on the OBBBA as enacted. HHS has not yet published the full interim final rule (due June 1, 2026), which will clarify definitions and implementation details. State implementation may vary. This is not legal or medical advice. For official guidance, contact your state Medicaid office or visit Medicaid.gov.
        </p>
      </section>
    </BlogLayout>
  );
}
