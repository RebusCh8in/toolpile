"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fmtP(n: number) {
  return n.toFixed(1) + "%";
}

/* ──────────────── 2026 Federal Tax Brackets ──────────────── */
const brackets2026 = {
  single: [
    { min: 0, max: 12400, rate: 0.10 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 640600, rate: 0.35 },
    { min: 640600, max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { min: 0, max: 24800, rate: 0.10 },
    { min: 24800, max: 100800, rate: 0.12 },
    { min: 100800, max: 211400, rate: 0.22 },
    { min: 211400, max: 403550, rate: 0.24 },
    { min: 403550, max: 512450, rate: 0.32 },
    { min: 512450, max: 768700, rate: 0.35 },
    { min: 768700, max: Infinity, rate: 0.37 },
  ],
  mfs: [
    { min: 0, max: 12400, rate: 0.10 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 384350, rate: 0.35 },
    { min: 384350, max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 17700, rate: 0.10 },
    { min: 17700, max: 67300, rate: 0.12 },
    { min: 67300, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 640600, rate: 0.35 },
    { min: 640600, max: Infinity, rate: 0.37 },
  ],
};

const stdDeduction2026: Record<string, number> = {
  single: 16100,
  mfj: 32200,
  mfs: 16100,
  hoh: 24150,
};

function calcFederalTax(taxableIncome: number, filing: string): number {
  const b = brackets2026[filing as keyof typeof brackets2026] || brackets2026.single;
  let tax = 0;
  for (const br of b) {
    if (taxableIncome <= br.min) break;
    const amt = Math.min(taxableIncome, br.max) - br.min;
    tax += amt * br.rate;
  }
  return tax;
}

/* ──────────────── State Tax Rates (flat effective approximations) ──────────────── */
const stateTaxRates: Record<string, number> = {
  AL: 4.0, AK: 0, AZ: 2.5, AR: 4.4, CA: 9.3,
  CO: 4.4, CT: 5.5, DE: 5.5, FL: 0, GA: 5.49,
  HI: 7.2, ID: 5.8, IL: 4.95, IN: 3.05, IA: 5.7,
  KS: 5.25, KY: 4.0, LA: 3.5, ME: 6.75, MD: 5.0,
  MA: 5.0, MI: 4.25, MN: 7.05, MS: 4.7, MO: 4.8,
  MT: 5.9, NE: 5.84, NV: 0, NH: 0, NJ: 6.37,
  NM: 4.9, NY: 6.85, NC: 4.5, ND: 1.95, OH: 3.75,
  OK: 4.75, OR: 8.75, PA: 3.07, RI: 5.0, SC: 6.4,
  SD: 0, TN: 0, TX: 0, UT: 4.65, VT: 6.6,
  VA: 5.0, WA: 0, WV: 5.12, WI: 5.3, WY: 0,
  DC: 6.5,
};

const states = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "District of Columbia" },
];

/* ──────────────── Forgiveness types ──────────────── */
const forgivenessTypes = [
  { value: "idr", label: "IDR Forgiveness (20-25 years)", taxable: true },
  { value: "rap", label: "REPAYE/SAVE Forgiveness (RAP, 30 years)", taxable: true },
  { value: "pslf", label: "Public Service Loan Forgiveness (PSLF)", taxable: false, msg: "PSLF forgiveness is permanently tax-free under IRC 108(f)(1). You do not owe any taxes on this forgiveness." },
  { value: "teacher", label: "Teacher Loan Forgiveness", taxable: false, msg: "Teacher Loan Forgiveness is tax-free under IRC 108(f)(1). You do not owe any taxes on this forgiveness." },
  { value: "closed", label: "Closed School Discharge", taxable: false, msg: "Closed school discharges are tax-free. You do not owe any taxes on this forgiveness." },
  { value: "tpd", label: "Total & Permanent Disability Discharge", taxable: false, msg: "TPD discharges were made permanently tax-free by the One Big Beautiful Bill Act (OBBBA). You do not owe any taxes." },
  { value: "bd", label: "Borrower Defense to Repayment", taxable: false, msg: "Borrower Defense discharges are tax-free. You do not owe any taxes on this forgiveness." },
];

const filingLabels: Record<string, string> = {
  single: "Single",
  mfj: "Married Filing Jointly",
  mfs: "Married Filing Separately",
  hoh: "Head of Household",
};

const yearOptions = Array.from({ length: 25 }, (_, i) => 2026 + i);

export default function Page() {
  /* Step 1 */
  const [forgivenessAmount, setForgivenessAmount] = useState(150000);
  const [forgivenessYear, setForgivenessYear] = useState(2040);
  const [forgivenessType, setForgivenessType] = useState("idr");

  /* Step 2 */
  const [filing, setFiling] = useState("single");
  const [annualIncome, setAnnualIncome] = useState(65000);
  const [stateCode, setStateCode] = useState("TX");

  /* Step 3 — Assets */
  const [cashAssets, setCashAssets] = useState(5000);
  const [retirementAssets, setRetirementAssets] = useState(25000);
  const [homeEquity, setHomeEquity] = useState(0);
  const [vehicleValue, setVehicleValue] = useState(8000);
  const [investmentAssets, setInvestmentAssets] = useState(2000);
  const [otherAssets, setOtherAssets] = useState(0);

  /* Step 3 — Liabilities */
  const [studentLoanDebt, setStudentLoanDebt] = useState(200000);
  const [mortgageBalance, setMortgageBalance] = useState(0);
  const [carLoans, setCarLoans] = useState(12000);
  const [creditCardDebt, setCreditCardDebt] = useState(5000);
  const [medicalDebt, setMedicalDebt] = useState(0);
  const [otherDebts, setOtherDebts] = useState(0);

  const [showResults, setShowResults] = useState(false);

  const selectedType = forgivenessTypes.find((t) => t.value === forgivenessType)!;
  const isTaxFree = !selectedType.taxable;

  const result = useMemo(() => {
    if (isTaxFree) return null;

    const totalAssets = cashAssets + retirementAssets + homeEquity + vehicleValue + investmentAssets + otherAssets;
    const totalLiabilities = studentLoanDebt + mortgageBalance + carLoans + creditCardDebt + medicalDebt + otherDebts;

    const insolvencyAmount = Math.max(0, totalLiabilities - totalAssets);
    const excludableAmount = Math.min(insolvencyAmount, forgivenessAmount);
    const taxableAmount = forgivenessAmount - excludableAmount;

    const deduction = stdDeduction2026[filing] || 16100;
    const baseTaxableIncome = Math.max(0, annualIncome - deduction);
    const withForgivenessTaxableIncome = Math.max(0, annualIncome + taxableAmount - deduction);

    const baseTax = calcFederalTax(baseTaxableIncome, filing);
    const withForgivenessTax = calcFederalTax(withForgivenessTaxableIncome, filing);
    const federalTax = withForgivenessTax - baseTax;

    const stateRate = (stateTaxRates[stateCode] || 0) / 100;
    const stateTax = taxableAmount * stateRate;

    const totalTax = federalTax + stateTax;

    const currentYear = 2026;
    const yearsUntil = Math.max(1, forgivenessYear - currentYear);
    const monthsUntil = yearsUntil * 12;
    const monthlySavings = totalTax / monthsUntil;

    const effectiveRate = forgivenessAmount > 0 ? (totalTax / forgivenessAmount) * 100 : 0;
    const savings = forgivenessAmount - totalTax;

    let insolvencyStatus: "full" | "partial" | "none" = "none";
    if (insolvencyAmount >= forgivenessAmount) insolvencyStatus = "full";
    else if (insolvencyAmount > 0) insolvencyStatus = "partial";

    return {
      totalAssets,
      totalLiabilities,
      insolvencyAmount,
      excludableAmount,
      taxableAmount,
      federalTax,
      stateTax,
      totalTax,
      monthlySavings,
      effectiveRate,
      savings,
      insolvencyStatus,
      yearsUntil,
    };
  }, [
    isTaxFree, forgivenessAmount, forgivenessYear, filing, annualIncome, stateCode,
    cashAssets, retirementAssets, homeEquity, vehicleValue, investmentAssets, otherAssets,
    studentLoanDebt, mortgageBalance, carLoans, creditCardDebt, medicalDebt, otherDebts,
  ]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const sectionCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-5";
  const headingCls = "text-lg font-semibold text-zinc-100 mb-4";

  return (
    <ToolLayout
      title="Student Loan Tax Bomb Calculator"
      description="Calculate your tax bill when student loan forgiveness becomes taxable income. See your federal and state taxes, check if the insolvency exclusion applies, and plan ahead."
      slug="student-loan-tax-bomb-calculator"
      category="Finance"
      keywords={[
        "student loan tax bomb calculator",
        "student loan forgiveness tax calculator",
        "IDR forgiveness tax calculator",
        "student loan forgiveness taxable 2026",
        "insolvency exclusion student loans",
        "student loan tax bill calculator",
        "income driven repayment tax",
        "loan forgiveness tax estimate",
        "Form 982 student loans",
        "student loan forgiveness tax bomb 2026",
      ]}
      faqs={[
        {
          question: "Is student loan forgiveness taxable in 2026?",
          answer: "Yes. The American Rescue Plan temporarily excluded student loan forgiveness from taxable income from 2021 through 2025. That provision expired on December 31, 2025. Starting January 1, 2026, forgiveness under income-driven repayment plans (IDR) is once again treated as taxable income by the IRS.",
        },
        {
          question: "Is PSLF forgiveness taxable?",
          answer: "No. Public Service Loan Forgiveness (PSLF) is permanently tax-free under IRC Section 108(f)(1). This has always been the case and was not affected by the ARP expiration. If you qualify for PSLF, you will not owe any taxes on the forgiven amount.",
        },
        {
          question: "What is the insolvency exclusion?",
          answer: "Under IRC Section 108(a)(1)(B), if your total liabilities exceed your total assets at the time of forgiveness, you are considered insolvent. You can exclude forgiven debt from taxable income up to the amount by which you are insolvent. You must file Form 982 with your tax return to claim this exclusion.",
        },
        {
          question: "Do retirement accounts count as assets for the insolvency test?",
          answer: "Yes. According to IRS Publication 4681, retirement account balances including 401(k), traditional IRA, and Roth IRA accounts all count as assets when determining insolvency, even though creditors generally cannot seize these accounts. This is a common misconception that can lead to underestimating your assets.",
        },
        {
          question: "How much will I owe in taxes on forgiven student loans?",
          answer: "Your tax bill depends on the forgiven amount, your regular income, filing status, state of residence, and whether you qualify for the insolvency exclusion. The forgiven amount is added to your income for the year, potentially pushing you into a higher tax bracket. Use this calculator to estimate your specific situation.",
        },
        {
          question: "Can I set up a payment plan with the IRS for my tax bomb?",
          answer: "Yes. The IRS offers installment agreements if you cannot pay your full tax bill at once. You can apply using Form 9465. For balances under $50,000, you can set up a plan online. The IRS charges interest and penalties on unpaid balances, so it is still advisable to save ahead when possible.",
        },
        {
          question: "Which states tax student loan forgiveness?",
          answer: "Most states with an income tax follow federal treatment and will tax forgiven student loan debt. States with no income tax — Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming — will not tax it. Some states like Arkansas, Indiana, Mississippi, North Carolina, and Wisconsin have historically taxed forgiven debt even when the federal exclusion was in effect.",
        },
        {
          question: "Is it still worth getting forgiveness if I have to pay taxes?",
          answer: "Almost always, yes. Your tax bill on the forgiven amount will be a fraction of the total loan balance. For example, if $150,000 is forgiven and your effective tax rate on that amount is 25%, you pay $37,500 in taxes instead of $150,000. You still save $112,500. The tax bill is significantly less than repaying the full loan balance.",
        },
      ]}
      relatedTools={[
        { name: "Student Loan Calculator", href: "/tools/student-loan-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "Tax Calculator", href: "/tools/tax-calculator" },
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
      ]}
      guide={
        <>
          <h2>What Is the Student Loan Tax Bomb?</h2>
          <p>
            When your student loans are forgiven under an income-driven repayment (IDR) plan after 20 or 25 years of payments,
            the IRS treats the forgiven balance as taxable income. This can result in a significant, unexpected tax bill — often
            called the &ldquo;tax bomb.&rdquo; The American Rescue Plan Act temporarily made all student loan forgiveness
            tax-free from 2021 through 2025, but that provision expired on December 31, 2025. Starting in 2026, IDR forgiveness
            is taxable again.
          </p>

          <h2>How the Tax Bomb Works</h2>
          <p>
            If you have $200,000 in student loans forgiven and your regular income is $60,000, the IRS treats you as having
            earned $260,000 that year. This pushes you into much higher tax brackets and can result in a federal tax bill of
            $40,000 or more, plus state taxes. The key insight is that you are taxed on the incremental income — the amount
            your tax bill increases due to the forgiveness on top of your regular income.
          </p>

          <h2>The Insolvency Exclusion: Your Main Defense</h2>
          <p>
            Under IRC Section 108(a)(1)(B), you can exclude forgiven debt from taxable income if you are insolvent — meaning
            your total liabilities exceed your total assets — at the time of forgiveness. The exclusion is limited to the
            amount by which you are insolvent. For example, if your liabilities exceed your assets by $100,000 and $150,000 is
            forgiven, you can exclude $100,000 and only pay taxes on the remaining $50,000.
          </p>
          <p>
            Important: retirement accounts (401k, IRA, Roth IRA) count as assets for the insolvency calculation per IRS
            Publication 4681, even though creditors typically cannot seize them. You must file Form 982 with your tax return
            to claim the insolvency exclusion.
          </p>

          <h2>Which Types of Forgiveness Are Tax-Free?</h2>
          <p>
            Several types of student loan forgiveness remain permanently tax-free regardless of the ARP expiration:
          </p>
          <ul>
            <li><strong>Public Service Loan Forgiveness (PSLF)</strong> — tax-free under IRC 108(f)(1)</li>
            <li><strong>Teacher Loan Forgiveness</strong> — tax-free under IRC 108(f)(1)</li>
            <li><strong>Closed School Discharge</strong> — tax-free</li>
            <li><strong>Total and Permanent Disability Discharge</strong> — made permanently tax-free</li>
            <li><strong>Borrower Defense to Repayment</strong> — tax-free</li>
          </ul>

          <h2>How to Prepare for the Tax Bomb</h2>
          <p>
            If you are on an IDR plan and expect forgiveness in the future, start planning now:
          </p>
          <ul>
            <li><strong>Estimate your tax bill</strong> using this calculator so you know the target amount.</li>
            <li><strong>Set up a dedicated savings account</strong> and make monthly contributions toward the expected tax bill.</li>
            <li><strong>Consider the insolvency exclusion</strong> — if you expect to be insolvent at the time of forgiveness, your tax bill may be reduced or eliminated.</li>
            <li><strong>Keep records</strong> of all assets and liabilities for the year of forgiveness. You will need documentation to claim insolvency on Form 982.</li>
            <li><strong>Consult a tax professional</strong> as your forgiveness date approaches to optimize your strategy.</li>
          </ul>

          <h2>PSLF vs. IDR Forgiveness</h2>
          <p>
            If you work for a qualifying employer (government or 501(c)(3) nonprofit), PSLF offers forgiveness after just 120
            qualifying payments (about 10 years) with no tax consequences. IDR forgiveness takes 20-25 years and is taxable.
            If you qualify for PSLF, it is almost always the better path — faster forgiveness and no tax bomb.
          </p>
        </>
      }
    >
      <div className="space-y-6">
        {/* ──── Step 1: Loan & Forgiveness ──── */}
        <div className={sectionCls}>
          <h2 className={headingCls}>Step 1: Loan &amp; Forgiveness Info</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Expected Forgiveness Amount ($)</label>
              <input
                type="number"
                value={forgivenessAmount}
                onChange={(e) => setForgivenessAmount(Math.max(0, +e.target.value))}
                className={inputCls}
                min={0}
                step={1000}
              />
            </div>
            <div>
              <label className={labelCls}>Expected Year of Forgiveness</label>
              <select value={forgivenessYear} onChange={(e) => setForgivenessYear(+e.target.value)} className={inputCls}>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Type of Forgiveness</label>
              <select value={forgivenessType} onChange={(e) => setForgivenessType(e.target.value)} className={inputCls}>
                {forgivenessTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {isTaxFree && (
            <div className="mt-4 bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl mt-0.5">&#10003;</span>
                <div>
                  <p className="text-emerald-300 font-semibold text-sm">Tax-Free Forgiveness</p>
                  <p className="text-emerald-400/80 text-sm mt-1">{selectedType.msg}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ──── Step 2: Income (only for taxable types) ──── */}
        {!isTaxFree && (
          <div className={sectionCls}>
            <h2 className={headingCls}>Step 2: Your Income</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Filing Status</label>
                <select value={filing} onChange={(e) => setFiling(e.target.value)} className={inputCls}>
                  {Object.entries(filingLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Expected Annual Income in Year of Forgiveness ($)</label>
                <input
                  type="number"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Math.max(0, +e.target.value))}
                  className={inputCls}
                  min={0}
                  step={1000}
                />
                <p className="text-xs text-zinc-500 mt-1">Your regular job income only — do not include the forgiven amount.</p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>State of Residence</label>
                <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={inputCls}>
                  {states.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ──── Step 3: Insolvency Check ──── */}
        {!isTaxFree && (
          <div className={sectionCls}>
            <h2 className={headingCls}>Step 3: Insolvency Check</h2>
            <p className="text-sm text-zinc-400 mb-4">
              If your total liabilities exceed your total assets at the time of forgiveness, you may exclude some or all of the forgiven
              amount from taxable income under IRC 108(a)(1)(B).
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Assets */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">Total Assets</h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Cash &amp; Bank Accounts ($)</label>
                    <input type="number" value={cashAssets} onChange={(e) => setCashAssets(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                  </div>
                  <div>
                    <label className={labelCls}>Retirement Accounts ($)</label>
                    <input type="number" value={retirementAssets} onChange={(e) => setRetirementAssets(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                    <p className="text-xs text-zinc-500 mt-1">401(k), IRA, Roth IRA — these DO count per IRS Pub 4681.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Home Value — Fair Market Value ($)</label>
                    <input type="number" value={homeEquity} onChange={(e) => setHomeEquity(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                    <p className="text-xs text-zinc-500 mt-1">Full market value of your home. List your mortgage separately under liabilities.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Vehicle Value ($)</label>
                    <input type="number" value={vehicleValue} onChange={(e) => setVehicleValue(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                  </div>
                  <div>
                    <label className={labelCls}>Investments ($)</label>
                    <input type="number" value={investmentAssets} onChange={(e) => setInvestmentAssets(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                    <p className="text-xs text-zinc-500 mt-1">Stocks, bonds, crypto, etc.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Other Assets ($)</label>
                    <input type="number" value={otherAssets} onChange={(e) => setOtherAssets(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                  </div>
                  <div className="pt-2 border-t border-zinc-700">
                    <p className="text-sm text-zinc-300">Total Assets: <span className="font-semibold text-zinc-100">{fmtC(cashAssets + retirementAssets + homeEquity + vehicleValue + investmentAssets + otherAssets)}</span></p>
                  </div>
                </div>
              </div>

              {/* Liabilities */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">Total Liabilities</h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Student Loans ($)</label>
                    <input type="number" value={studentLoanDebt} onChange={(e) => setStudentLoanDebt(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                    <p className="text-xs text-zinc-500 mt-1">Include the loans being forgiven plus any others.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Mortgage Balance ($)</label>
                    <input type="number" value={mortgageBalance} onChange={(e) => setMortgageBalance(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                  </div>
                  <div>
                    <label className={labelCls}>Car Loans ($)</label>
                    <input type="number" value={carLoans} onChange={(e) => setCarLoans(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                  </div>
                  <div>
                    <label className={labelCls}>Credit Card Debt ($)</label>
                    <input type="number" value={creditCardDebt} onChange={(e) => setCreditCardDebt(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                  </div>
                  <div>
                    <label className={labelCls}>Medical Debt ($)</label>
                    <input type="number" value={medicalDebt} onChange={(e) => setMedicalDebt(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                  </div>
                  <div>
                    <label className={labelCls}>Other Debts ($)</label>
                    <input type="number" value={otherDebts} onChange={(e) => setOtherDebts(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
                  </div>
                  <div className="pt-2 border-t border-zinc-700">
                    <p className="text-sm text-zinc-300">Total Liabilities: <span className="font-semibold text-zinc-100">{fmtC(studentLoanDebt + mortgageBalance + carLoans + creditCardDebt + medicalDebt + otherDebts)}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowResults(true)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Calculate My Tax Bomb
              </button>
            </div>
          </div>
        )}

        {/* ──── Results ──── */}
        {!isTaxFree && showResults && result && (
          <div className="space-y-6">
            {/* Hero number */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-zinc-400 text-sm uppercase tracking-wide mb-2">Estimated Total Tax Bill</p>
              <p className="text-5xl font-bold text-red-400">{fmtC(result.totalTax)}</p>
              <p className="text-zinc-500 text-sm mt-2">
                Effective tax rate on forgiven amount: <span className="text-zinc-300">{fmtP(result.effectiveRate)}</span>
              </p>
            </div>

            {/* Breakdown cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Federal Tax</p>
                <p className="text-2xl font-bold text-zinc-100">{fmtC(result.federalTax)}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">State Tax (est.)</p>
                <p className="text-2xl font-bold text-zinc-100">{fmtC(result.stateTax)}</p>
                <p className="text-xs text-zinc-600 mt-1">{states.find((s) => s.code === stateCode)?.name} @ {stateTaxRates[stateCode]}%</p>
              </div>
              <div className="bg-zinc-900 border border-blue-500/30 rounded-xl p-5 text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Total Tax Bill</p>
                <p className="text-2xl font-bold text-blue-400">{fmtC(result.totalTax)}</p>
              </div>
            </div>

            {/* Insolvency status */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-3">Insolvency Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Assets</span>
                  <span className="text-zinc-200">{fmtC(result.totalAssets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Liabilities</span>
                  <span className="text-zinc-200">{fmtC(result.totalLiabilities)}</span>
                </div>
                <div className="border-t border-zinc-700 pt-2 flex justify-between">
                  <span className="text-zinc-400">Insolvency Amount</span>
                  <span className="text-zinc-200">{fmtC(result.insolvencyAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Excludable from Income</span>
                  <span className="text-emerald-400">{fmtC(result.excludableAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Taxable Forgiveness</span>
                  <span className="text-red-400 font-semibold">{fmtC(result.taxableAmount)}</span>
                </div>
              </div>

              <div className="mt-4">
                {result.insolvencyStatus === "full" && (
                  <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-3">
                    <p className="text-emerald-300 font-semibold text-sm">Fully Insolvent</p>
                    <p className="text-emerald-400/80 text-xs mt-1">
                      Your liabilities exceed your assets by more than the forgiven amount. You can exclude the entire forgiven amount
                      from taxable income using Form 982. Your estimated tax bill on the forgiveness is <strong>$0</strong>.
                    </p>
                  </div>
                )}
                {result.insolvencyStatus === "partial" && (
                  <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3">
                    <p className="text-amber-300 font-semibold text-sm">Partially Insolvent</p>
                    <p className="text-amber-400/80 text-xs mt-1">
                      You can exclude {fmtC(result.excludableAmount)} of the forgiven amount from taxable income. The remaining {fmtC(result.taxableAmount)} is
                      taxable. File Form 982 to claim the exclusion.
                    </p>
                  </div>
                )}
                {result.insolvencyStatus === "none" && (
                  <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                    <p className="text-red-300 font-semibold text-sm">Not Insolvent</p>
                    <p className="text-red-400/80 text-xs mt-1">
                      Your assets exceed your liabilities, so the insolvency exclusion does not apply. The full forgiven amount of {fmtC(forgivenessAmount)} is taxable income.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly savings plan */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-3">Monthly Savings Plan</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-400">Years until forgiveness</p>
                  <p className="text-zinc-100 text-xl font-semibold">{result.yearsUntil}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Save per month to cover tax bill</p>
                  <p className="text-blue-400 text-xl font-semibold">{fmtC(result.monthlySavings)}/mo</p>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-3">Forgiveness vs. Full Repayment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Forgiven Amount</span>
                  <span className="text-zinc-200">{fmtC(forgivenessAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tax Bill</span>
                  <span className="text-red-400">{fmtC(result.totalTax)}</span>
                </div>
                <div className="border-t border-zinc-700 pt-2 flex justify-between">
                  <span className="text-zinc-400">You Still Save</span>
                  <span className="text-emerald-400 font-semibold">{fmtC(result.savings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tax Bill Is</span>
                  <span className="text-zinc-300">{fmtP(result.effectiveRate)} of forgiven amount</span>
                </div>
              </div>
              <div className="mt-4 bg-blue-900/20 border border-blue-800/40 rounded-lg p-3">
                <p className="text-blue-300 text-xs">
                  Even after paying {fmtC(result.totalTax)} in taxes, you save {fmtC(result.savings)} compared to repaying the full loan balance.
                  Forgiveness is still significantly better than full repayment.
                </p>
              </div>
            </div>

            {/* Disclaimers */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-3">Important Disclaimers</h3>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li>This calculator provides estimates only. Consult a tax professional for your specific situation.</li>
                <li>Tax brackets and state rates may change by your forgiveness year. These estimates use projected 2026 rates.</li>
                <li>The insolvency exclusion requires filing Form 982 with your tax return.</li>
                <li>State tax estimates use simplified flat effective rates and may differ from your actual state tax liability.</li>
                <li>PSLF, Teacher Loan Forgiveness, Closed School Discharge, TPD Discharge, and Borrower Defense discharges remain permanently tax-free.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

    </ToolLayout>
  );
}
