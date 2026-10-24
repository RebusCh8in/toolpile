import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog - ToolPile",
  description: "Guides, tutorials, and tips on image optimization, web development, accessibility, and using free online tools effectively.",
  alternates: { canonical: "https://toolpile.app/blog" },
  openGraph: {
    title: "Blog - ToolPile",
    description: "Guides, tutorials, and tips on image optimization, web development, accessibility, and using free online tools.",
    url: "https://toolpile.app/blog",
    siteName: "ToolPile",
    type: "website",
  },
};

interface BlogEntry {
  title: string;
  slug: string;
  description: string;
  date: string;
  tags: string[];
}

const posts: BlogEntry[] = [
  {
    title: "How to Clean Up Messy Terminal & Claude Code Output (2026)",
    slug: "clean-up-terminal-output",
    description: "Copying text from a terminal often brings invisible ANSI color codes, line-number gutters, and control characters. Here is what causes the mess and how to strip it for clean, paste-ready text.",
    date: "2026-06-28",
    tags: ["Terminal", "Claude Code", "ANSI Codes", "Developer Tools", "CLI"],
  },
  {
    title: "Medicare Costs in 2026: Premiums, IRMAA, Deductibles & What You'll Pay",
    slug: "medicare-calculator-guide",
    description: "Complete breakdown of 2026 Medicare costs. Part A, Part B, Part D premiums, IRMAA surcharges by income, deductibles, coinsurance, Medigap, and late enrollment penalties.",
    date: "2026-04-02",
    tags: ["Medicare", "IRMAA", "Medicare Costs 2026"],
  },
  {
    title: "How Social Security Benefits Are Calculated (2026 Guide)",
    slug: "social-security-calculator-guide",
    description: "Learn exactly how Social Security retirement benefits are calculated. AIME, PIA, bend points, claiming age adjustments, spousal benefits, and the earnings test with 2026 numbers.",
    date: "2026-04-01",
    tags: ["Social Security", "Retirement Benefits", "PIA", "Claiming Age"],
  },
  {
    title: "How VA Disability Ratings Are Calculated: VA Math Explained (2026 Guide)",
    slug: "va-disability-calculator-guide",
    description: "Learn how VA combined disability ratings work. Understand VA math, the combined rating formula, 2026 compensation rates, TDIU, and dependent allowances.",
    date: "2026-03-31",
    tags: ["VA Disability", "VA Math", "Veterans Benefits", "VA Compensation"],
  },
  {
    title: "Small Claims Court Limits, Fees & Rules in Every State (2026 Guide)",
    slug: "small-claims-court-guide",
    description: "Learn the small claims court dollar limits, filing fees, statute of limitations, attorney rules, and appeal procedures for all 50 states.",
    date: "2026-03-30",
    tags: ["Small Claims Court", "Filing Fees", "Statute of Limitations"],
  },
  {
    title: "The Bankruptcy Means Test Explained: Do You Qualify for Chapter 7? (2026 Guide)",
    slug: "bankruptcy-means-test-guide",
    description: "Learn how the Chapter 7 bankruptcy means test works. State median incomes, IRS deduction standards, disposable income thresholds, and Chapter 13 alternatives — with updated 2026 figures.",
    date: "2026-03-28",
    tags: ["Bankruptcy", "Means Test", "Chapter 7", "Debt Relief"],
  },
  {
    title: "The True Cost of a DUI in Every State (2026 Guide)",
    slug: "dui-cost-calculator-guide",
    description: "Learn the real cost of a DUI in all 50 states. Fines, insurance increases, IID costs, attorney fees, jail time, and license suspension — broken down with actual numbers.",
    date: "2026-03-27",
    tags: ["DUI", "DWI", "DUI Cost", "DUI Penalties"],
  },
  {
    title: "How Workers' Comp Benefits Are Calculated in Every State (2026 Guide)",
    slug: "workers-comp-calculator-guide",
    description: "Learn how workers' compensation benefits are calculated in all 50 states. Understand TTD rates, maximum weekly benefits, waiting periods, and which states pay the most and least.",
    date: "2026-03-26",
    tags: ["Workers Compensation", "TTD Benefits", "Workplace Injury"],
  },
  {
    title: "How Personal Injury Settlements Are Calculated (2026 Guide)",
    slug: "personal-injury-settlement-guide",
    description: "Learn how insurance companies calculate personal injury settlements. Understand the multiplier method, state negligence rules, damage caps, and what factors increase or decrease your claim value.",
    date: "2026-03-25",
    tags: ["Personal Injury", "Settlement Calculator", "Car Accident", "Insurance"],
  },
  {
    title: "How Alimony Is Calculated in Every State (2026 Guide)",
    slug: "alimony-calculator-guide",
    description: "Learn how alimony (spousal support) is calculated in all 50 states. Understand which states have formulas, duration limits, caps, and recent reforms — with real examples and state-by-state rules.",
    date: "2026-03-21",
    tags: ["Alimony", "Spousal Support", "Family Law", "Divorce"],
  },
  {
    title: "How Child Support Is Calculated in Every State (2026 Guide)",
    slug: "child-support-calculator-guide",
    description: "Learn how child support is calculated in all 50 states. Understand the three calculation models — income shares, percentage of income, and the Melson formula — with real examples and state-specific rules.",
    date: "2026-03-18",
    tags: ["Child Support", "Family Law", "Calculator", "Child Support by State"],
  },
  {
    title: "FIFA World Cup 2026: Complete Schedule, Groups, Venues & Time Zones Guide",
    slug: "world-cup-2026-schedule-guide",
    description: "Everything you need to know about the 2026 FIFA World Cup: all 48 teams, 12 groups, 16 venues across the US, Mexico & Canada, key dates, knockout bracket, and how to convert match times to your local time zone.",
    date: "2026-03-17",
    tags: ["World Cup 2026", "FIFA", "Soccer", "Time Zones"],
  },
  {
    title: "SAVE Plan Is Dead: How RAP Changes Your Student Loan Payments in 2026",
    slug: "save-vs-rap-student-loan-2026",
    description: "The SAVE student loan plan was struck down on March 9, 2026. The new Repayment Assistance Plan (RAP) launches July 1 with higher payments for most borrowers. Here's exactly how much more you'll pay and what to do next.",
    date: "2026-03-17",
    tags: ["SAVE Plan", "RAP Plan", "Student Loan Repayment", "IDR Plans"],
  },
  {
    title: "Trump Account Explained: How the New $530A Savings Account Could Build Your Child\u2019s Future (2026)",
    slug: "trump-account-calculator-guide",
    description: "Everything you need to know about Trump Accounts (IRC Section 530A) created by the One Big Beautiful Bill Act. Learn about the $1,000 government seed deposit, $5,000 annual contribution limit, investment rules, tax treatment, and how much the account could be worth.",
    date: "2026-03-15",
    tags: ["Trump Account", "MAGA Account", "Section 530A", "OBBBA"],
  },
  {
    title: "Student Loan Tax Bomb 2026: How Much You'll Owe and How to Prepare",
    slug: "student-loan-tax-bomb-2026",
    description: "The tax-free period for student loan forgiveness expired January 1, 2026. If you're on an IDR plan, your forgiven balance will be taxed as ordinary income. Learn how big the bill could be, whether the insolvency exclusion can help, and how to prepare.",
    date: "2026-03-14",
    tags: ["Student Loan Tax Bomb", "IDR Forgiveness", "Insolvency Exclusion", "Student Loans"],
  },
  {
    title: "Car Loan Interest Is Now Tax Deductible: How to Claim the OBBBA Deduction (2025-2028)",
    slug: "car-loan-interest-tax-deduction",
    description: "The OBBBA created a new above-the-line deduction for interest on new car loans. Learn who qualifies, income phaseout limits, how to claim it, and how much you could save from 2025 to 2028.",
    date: "2026-03-14",
    tags: ["Car Loan Interest Deduction", "OBBBA", "Tax Deduction", "Auto Loan"],
  },
  {
    title: "How Fast Can You Type? Average Typing Speed & How to Improve (2026)",
    slug: "typing-speed-test-guide",
    description: "Learn average typing speeds by age and profession, how WPM is measured, and 10 proven tips to type faster. Take a free typing speed test to find your WPM.",
    date: "2026-03-12",
    tags: ["Typing Speed", "WPM", "Productivity", "Typing Test"],
  },
  {
    title: "Medicaid Work Requirements 2027: Who Is Affected, Who Is Exempt, and What to Do",
    slug: "medicaid-work-requirement-explained",
    description: "The OBBBA adds an 80-hour monthly work requirement for Medicaid expansion enrollees starting January 2027. Learn who is affected, exemptions, and how to prepare.",
    date: "2026-03-11",
    tags: ["Medicaid", "Healthcare", "OBBBA", "2027"],
  },
  {
    title: "How Much Does It Cost to Run Every Appliance? (2026 Electricity Costs)",
    slug: "how-much-electricity-cost-by-appliance",
    description: "See exactly how much electricity every major household appliance costs to run per month and year. Includes real wattages, state-by-state rates, and tips to lower your electric bill.",
    date: "2026-03-10",
    tags: ["Electricity", "Energy Costs", "Appliances", "Save Money"],
  },
  {
    title: "No Tax on Tips or Overtime: How the OBBBA Saves You Money (2026)",
    slug: "no-tax-on-tips-obbba-guide",
    description: "Learn how the One Big Beautiful Bill Act eliminates federal income tax on tips and overtime. See who qualifies, income caps, phase-outs, and how much you could save in 2026.",
    date: "2026-03-09",
    tags: ["OBBBA", "No Tax on Tips", "Tax Savings", "Overtime", "Tax Deductions", "2026"],
  },
  {
    title: "Should I Refinance My Mortgage? When It Makes Sense (2026)",
    slug: "should-i-refinance-my-mortgage",
    description: "Find out when refinancing your mortgage saves money, how to calculate your break-even point, and whether a rate-and-term or cash-out refinance is right for you. Free refinance calculator included.",
    date: "2026-03-05",
    tags: ["Mortgage", "Refinance", "Finance", "Home Ownership"],
  },
  {
    title: "How Much Do I Need to Retire? A Step-by-Step Guide (2026)",
    slug: "how-much-do-i-need-to-retire",
    description: "Calculate your retirement number with the 4% rule, see savings benchmarks by age, and learn how to plan for a comfortable retirement.",
    date: "2026-03-05",
    tags: ["Retirement", "Finance", "Investing", "Calculators"],
  },
  {
    title: "How to Max Out Your 401(k): Contribution Limits and Strategies (2026)",
    slug: "how-to-max-out-401k",
    description: "Learn 2026 401(k) contribution limits, employer matching strategies, Traditional vs Roth 401(k), and how to maximize your retirement savings.",
    date: "2026-03-05",
    tags: ["401k", "Retirement", "Finance", "Calculators"],
  },
  {
    title: "How to Calculate Your TDEE for Weight Loss (and Why It Matters)",
    slug: "how-to-calculate-tdee",
    description: "Learn what TDEE is, how it differs from BMR, and how to use it for weight loss, cutting, or bulking. Includes formulas and activity multipliers.",
    date: "2026-03-05",
    tags: ["TDEE", "Health", "Weight Loss", "Calculators"],
  },
  {
    title: "How to Convert JPG to PDF for Free (No Upload Required)",
    slug: "how-to-convert-jpg-to-pdf",
    description: "Learn the fastest ways to convert JPG images to PDF without uploading to a server. Combine multiple images, set page sizes, and preserve quality.",
    date: "2026-03-05",
    tags: ["PDF", "Image Conversion", "Privacy", "Tools"],
  },
  {
    title: "How to Merge PDF Files for Free (Without Uploading to a Server)",
    slug: "how-to-merge-pdf-files",
    description: "Combine multiple PDF files into one document for free. Learn the safest methods that keep your files private and never upload to a server.",
    date: "2026-03-05",
    tags: ["PDF", "Productivity", "Privacy", "Tools"],
  },
  {
    title: "How to Compress a PDF File Without Losing Quality (2026 Guide)",
    slug: "how-to-compress-pdf",
    description: "Reduce PDF file size by up to 90% without losing quality. Learn compression methods, quality tradeoffs, and privacy-safe tools.",
    date: "2026-03-05",
    tags: ["PDF", "Compression", "Email", "Tools"],
  },
  {
    title: "How to Split a PDF: Extract Pages or Divide Into Parts (Free)",
    slug: "how-to-split-pdf",
    description: "Split PDF files by page range, into equal parts, or extract individual pages. Free browser-based tool with no upload required.",
    date: "2026-03-05",
    tags: ["PDF", "Productivity", "Privacy", "Tools"],
  },
  {
    title: "How to Convert PNG to PDF for Free (Keep Quality \u0026 Transparency)",
    slug: "how-to-convert-png-to-pdf",
    description: "Convert PNG images to PDF while preserving quality and transparency. Combine multiple PNGs, set page sizes, and keep your files private.",
    date: "2026-03-05",
    tags: ["PDF", "Image Conversion", "Design", "Tools"],
  },
  {
    title: "How Much Car Can I Afford? Auto Loan Budget Guide (2026)",
    slug: "how-much-car-can-i-afford",
    description: "Use the 20/4/10 rule to find your car budget. Covers auto loan rates, down payments, new vs used, and total cost of ownership.",
    date: "2026-03-05",
    tags: ["Auto Loan", "Finance", "Car Buying", "Calculators"],
  },
  {
    title: "Sleep Cycles Explained: How to Wake Up Refreshed Every Morning",
    slug: "sleep-cycles-explained",
    description: "Learn how 90-minute sleep cycles work, why you wake up groggy, and how to time your alarm for the best sleep. Free sleep calculator included.",
    date: "2026-03-03",
    tags: ["Sleep", "Health", "Wellness", "Calculators"],
  },
  {
    title: "How to Calculate Mortgage Payments: Complete Guide (2026)",
    slug: "how-to-calculate-mortgage-payments",
    description: "Learn how mortgage payments are calculated, what affects your monthly payment, and how to save thousands with extra payments. Free calculator included.",
    date: "2026-03-03",
    tags: ["Mortgage", "Finance", "Home Buying", "Calculators"],
  },
  {
    title: "Compound Interest Explained: How Your Money Grows (With Examples)",
    slug: "compound-interest-explained",
    description: "Understand how compound interest works with real examples and calculations. Learn the rule of 72, daily vs monthly compounding, and how to maximize growth.",
    date: "2026-03-03",
    tags: ["Finance", "Investing", "Compound Interest", "Calculators"],
  },
  {
    title: "How to Optimize Images for Shopify: Complete Speed Guide",
    slug: "optimize-images-shopify",
    description: "Reduce Shopify page load times by 50%+ with proper image optimization. Covers compression, format selection, lazy loading, and free tools.",
    date: "2026-03-02",
    tags: ["Shopify", "Image Optimization", "Page Speed"],
  },
  {
    title: "How to Make Your Website WCAG Accessible: A Practical Checklist",
    slug: "wcag-accessibility-checklist",
    description: "A practical checklist for meeting WCAG 2.2 AA standards. Covers color contrast, alt text, keyboard navigation, and free testing tools.",
    date: "2026-03-02",
    tags: ["Accessibility", "WCAG", "Web Development"],
  },
  {
    title: "How to Convert HEIC to JPG on Any Device (Free, No Upload)",
    slug: "convert-heic-to-jpg",
    description: "Convert iPhone HEIC photos to JPG format for free without uploading to any server. Works on Windows, Mac, and mobile browsers.",
    date: "2026-03-02",
    tags: ["HEIC", "Image Conversion", "iPhone"],
  },
  {
    title: "10 Best Free CSS Generators for Web Developers (2026)",
    slug: "best-css-generators",
    description: "A curated list of free CSS generator tools for gradients, shadows, glassmorphism, clip paths, loaders, and more. All browser-based with no signup.",
    date: "2026-03-02",
    tags: ["CSS", "Web Development", "Developer Tools"],
  },
  {
    title: "The Complete Guide to Image Sizes for Every Social Media Platform (2026)",
    slug: "resize-images-social-media",
    description: "Every social media image size you need in 2026. Instagram, YouTube, Facebook, Twitter, LinkedIn, TikTok, and Pinterest dimensions with free resize tools.",
    date: "2026-03-02",
    tags: ["Social Media", "Image Optimization", "Design"],
  },
  {
    title: "How to Remove Backgrounds from Product Photos for Free",
    slug: "remove-background-product-photos",
    description: "Remove backgrounds from product photos for Etsy, Shopify, and Amazon. Free browser-based tool with no upload to any server.",
    date: "2026-03-02",
    tags: ["Background Removal", "E-commerce", "Product Photography"],
  },
  {
    title: "How to Generate Secure Passwords: A Complete Guide for 2026",
    slug: "generate-secure-passwords",
    description: "Learn what makes a password secure, how long it should be, and the best free tools to generate strong passwords. Covers password managers, passphrases, and common mistakes.",
    date: "2026-03-02",
    tags: ["Security", "Passwords", "Cybersecurity"],
  },
  {
    title: "How to Calculate Your GPA: Step-by-Step Guide (2026)",
    slug: "how-to-calculate-gpa",
    description: "Learn how to calculate your GPA on a 4.0 scale with step-by-step examples. Covers weighted vs unweighted, cumulative GPA, and how to raise your GPA.",
    date: "2026-03-03",
    tags: ["Education", "GPA", "College", "Calculators"],
  },
  {
    title: "How to Calculate a Calorie Deficit for Weight Loss (2026 Guide)",
    slug: "calorie-deficit-for-weight-loss",
    description: "Learn how to calculate your calorie deficit for safe, sustainable weight loss. Covers TDEE, BMR, macro splits, and common mistakes to avoid.",
    date: "2026-03-03",
    tags: ["Weight Loss", "Health", "Nutrition", "Calculators"],
  },
  {
    title: "The 50/30/20 Budget Rule Explained: How to Budget Your Money Simply",
    slug: "50-30-20-budget-rule",
    description: "Learn how the 50/30/20 budget rule works, how to apply it to your income, and when to adjust the ratios. Free budget calculator included.",
    date: "2026-03-04",
    tags: ["Budgeting", "Finance", "Money Management", "Calculators"],
  },
  {
    title: "How to Pay Off Debt Fast: Snowball vs Avalanche Method (2026 Guide)",
    slug: "how-to-pay-off-debt-fast",
    description: "Compare the debt snowball and debt avalanche methods with real examples. Learn which strategy saves the most money and which keeps you motivated.",
    date: "2026-03-04",
    tags: ["Debt", "Finance", "Money Management", "Calculators"],
  },
  {
    title: "BMI Explained: What Your Body Mass Index Really Means (2026)",
    slug: "bmi-explained",
    description: "Understand what BMI measures, its limitations, and how to calculate yours. Learn when BMI is useful and when other metrics matter more.",
    date: "2026-03-04",
    tags: ["BMI", "Health", "Fitness", "Calculators"],
  },
  {
    title: "How to Start Investing in 2026: A Beginner's Complete Guide",
    slug: "how-to-start-investing",
    description: "Learn how to start investing with as little as $50. Covers index funds, ETFs, compound growth, risk tolerance, and common beginner mistakes to avoid.",
    date: "2026-03-04",
    tags: ["Investing", "Finance", "Stocks", "Compound Interest"],
  },
  {
    title: "Keto Macros Guide: How to Calculate Your Perfect Ratios (2026)",
    slug: "keto-macros-guide",
    description: "Learn how to calculate your ideal keto macros for fat loss, maintenance, or muscle gain. Covers net carbs, protein needs, and common keto mistakes.",
    date: "2026-03-04",
    tags: ["Keto", "Health", "Nutrition", "Calculators"],
  },
  {
    title: "How Much Life Insurance Do I Need? A Complete Guide (2026)",
    slug: "how-much-life-insurance-do-i-need",
    description: "Calculate exactly how much life insurance coverage you need. Learn the DIME formula, compare term vs. whole life, and see real cost examples by age.",
    date: "2026-03-08",
    tags: ["Life Insurance", "Finance", "Insurance Planning", "Family Finance"],
  },
];

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-8 text-sm text-zinc-500">
        <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
        <span className="mx-2 text-zinc-600">/</span>
        <span className="text-zinc-300">Blog</span>
      </nav>

      <h1 className="font-display text-4xl text-zinc-100 mb-4">Blog</h1>
      <p className="text-zinc-400 mb-10">Guides, tutorials, and tips for getting the most out of free online tools.</p>

      <div className="space-y-6">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-400/40 transition-all group"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map(tag => (
                <span key={tag} className="bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors mb-2">{post.title}</h2>
            <p className="text-sm text-zinc-400 mb-3">{post.description}</p>
            <time className="text-xs text-zinc-600">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
          </Link>
        ))}
      </div>
    </div>
  );
}
