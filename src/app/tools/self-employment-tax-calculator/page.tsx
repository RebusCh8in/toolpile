"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number): string {
  if (n < 0) return "-" + fmt(-n);
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function pct(n: number): string {
  return n.toFixed(1) + "%";
}

// 2026 federal brackets
const fedBrackets = {
  single: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
  married: [
    { min: 0, max: 23850, rate: 10 },
    { min: 23850, max: 96950, rate: 12 },
    { min: 96950, max: 206700, rate: 22 },
    { min: 206700, max: 394600, rate: 24 },
    { min: 394600, max: 501050, rate: 32 },
    { min: 501050, max: 751600, rate: 35 },
    { min: 751600, max: Infinity, rate: 37 },
  ],
  hoh: [
    { min: 0, max: 17000, rate: 10 },
    { min: 17000, max: 64850, rate: 12 },
    { min: 64850, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250500, rate: 32 },
    { min: 250500, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
};

const stdDeduction = { single: 15700, married: 31400, hoh: 22500 };

// SE tax constants (2026)
const SE_FACTOR = 0.9235;
const SS_RATE_SE = 0.124; // 12.4% (both halves)
const SS_CAP = 176100;
const MEDICARE_RATE_SE = 0.029; // 2.9% (both halves)
const MEDICARE_ADDITIONAL_RATE = 0.009;
const MEDICARE_ADDITIONAL_THRESHOLD = 200000;

// W-2 FICA for comparison
const SS_RATE_W2 = 0.062;
const MEDICARE_RATE_W2 = 0.0145;

// State tax data
type StateInfo = { name: string; rate: number; type: "none" | "flat" | "progressive" };
const states: Record<string, StateInfo> = {
  AL: { name: "Alabama", rate: 4.0, type: "progressive" },
  AK: { name: "Alaska", rate: 0, type: "none" },
  AZ: { name: "Arizona", rate: 2.5, type: "flat" },
  AR: { name: "Arkansas", rate: 3.9, type: "progressive" },
  CA: { name: "California", rate: 7.5, type: "progressive" },
  CO: { name: "Colorado", rate: 4.4, type: "flat" },
  CT: { name: "Connecticut", rate: 5.5, type: "progressive" },
  DE: { name: "Delaware", rate: 5.5, type: "progressive" },
  FL: { name: "Florida", rate: 0, type: "none" },
  GA: { name: "Georgia", rate: 5.39, type: "progressive" },
  HI: { name: "Hawaii", rate: 7.2, type: "progressive" },
  ID: { name: "Idaho", rate: 5.695, type: "flat" },
  IL: { name: "Illinois", rate: 4.95, type: "flat" },
  IN: { name: "Indiana", rate: 3.05, type: "flat" },
  IA: { name: "Iowa", rate: 3.8, type: "flat" },
  KS: { name: "Kansas", rate: 4.7, type: "progressive" },
  KY: { name: "Kentucky", rate: 4.0, type: "flat" },
  LA: { name: "Louisiana", rate: 3.0, type: "flat" },
  ME: { name: "Maine", rate: 5.8, type: "progressive" },
  MD: { name: "Maryland", rate: 4.75, type: "progressive" },
  MA: { name: "Massachusetts", rate: 5.0, type: "flat" },
  MI: { name: "Michigan", rate: 4.25, type: "flat" },
  MN: { name: "Minnesota", rate: 6.8, type: "progressive" },
  MS: { name: "Mississippi", rate: 4.7, type: "flat" },
  MO: { name: "Missouri", rate: 4.7, type: "progressive" },
  MT: { name: "Montana", rate: 5.9, type: "progressive" },
  NE: { name: "Nebraska", rate: 5.2, type: "progressive" },
  NV: { name: "Nevada", rate: 0, type: "none" },
  NH: { name: "New Hampshire", rate: 0, type: "none" },
  NJ: { name: "New Jersey", rate: 5.5, type: "progressive" },
  NM: { name: "New Mexico", rate: 4.7, type: "progressive" },
  NY: { name: "New York", rate: 6.0, type: "progressive" },
  NC: { name: "North Carolina", rate: 4.5, type: "flat" },
  ND: { name: "North Dakota", rate: 1.95, type: "progressive" },
  OH: { name: "Ohio", rate: 3.5, type: "progressive" },
  OK: { name: "Oklahoma", rate: 4.25, type: "progressive" },
  OR: { name: "Oregon", rate: 8.0, type: "progressive" },
  PA: { name: "Pennsylvania", rate: 3.07, type: "flat" },
  RI: { name: "Rhode Island", rate: 4.75, type: "progressive" },
  SC: { name: "South Carolina", rate: 6.2, type: "progressive" },
  SD: { name: "South Dakota", rate: 0, type: "none" },
  TN: { name: "Tennessee", rate: 0, type: "none" },
  TX: { name: "Texas", rate: 0, type: "none" },
  UT: { name: "Utah", rate: 4.65, type: "flat" },
  VT: { name: "Vermont", rate: 6.0, type: "progressive" },
  VA: { name: "Virginia", rate: 5.0, type: "progressive" },
  WA: { name: "Washington", rate: 0, type: "none" },
  WV: { name: "West Virginia", rate: 5.12, type: "progressive" },
  WI: { name: "Wisconsin", rate: 5.3, type: "progressive" },
  WY: { name: "Wyoming", rate: 0, type: "none" },
};

const statesSorted = Object.entries(states).sort((a, b) => a[1].name.localeCompare(b[1].name));

function calcFedTax(taxable: number, filing: "single" | "married" | "hoh") {
  const b = fedBrackets[filing];
  let tax = 0;
  const breakdown: { rate: number; amount: number; tax: number }[] = [];
  for (const br of b) {
    if (taxable <= br.min) break;
    const amt = Math.min(taxable, br.max) - br.min;
    const t = amt * (br.rate / 100);
    tax += t;
    breakdown.push({ rate: br.rate, amount: amt, tax: t });
  }
  const marginal = b.find(br => taxable <= br.max)?.rate || 37;
  return { tax, breakdown, marginal };
}

function calcSETax(netSEIncome: number) {
  const seBase = netSEIncome * SE_FACTOR;
  const ss = Math.min(seBase, SS_CAP) * SS_RATE_SE;
  let medicare = seBase * MEDICARE_RATE_SE;
  const additionalMedicare = seBase > MEDICARE_ADDITIONAL_THRESHOLD
    ? (seBase - MEDICARE_ADDITIONAL_THRESHOLD) * MEDICARE_ADDITIONAL_RATE
    : 0;
  medicare += additionalMedicare;
  const total = ss + medicare;
  const deductibleHalf = total / 2;
  return { seBase, ss, medicare, additionalMedicare, total, deductibleHalf };
}

function calcStateTax(income: number, stateCode: string) {
  const s = states[stateCode];
  if (!s || s.rate === 0) return 0;
  return Math.max(0, income) * (s.rate / 100);
}

// Donut chart
function DonutChart({ slices, size = 220 }: { slices: { label: string; value: number; color: string }[]; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = slices.reduce((a, s) => a + s.value, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || total === 0) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const innerR = outerR * 0.6;

    let startAngle = -Math.PI / 2;
    for (const slice of slices) {
      if (slice.value <= 0) continue;
      const sweep = (slice.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep);
      ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      startAngle += sweep;
    }

    // Center text
    const taxTotal = slices.filter(s => s.label !== "Take-Home").reduce((a, s) => a + s.value, 0);
    const taxPct = total > 0 ? ((taxTotal / total) * 100).toFixed(1) : "0";
    ctx.fillStyle = "#f4f4f5";
    ctx.font = "bold 20px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${taxPct}%`, cx, cy - 8);
    ctx.font = "11px system-ui";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("Total Tax Rate", cx, cy + 12);
  }, [slices, total, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

// Horizontal stacked bar
function StackedBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex rounded-lg overflow-hidden h-8">
        {segments.map((s, i) => {
          const w = (s.value / total) * 100;
          if (w < 0.5) return null;
          return (
            <div
              key={i}
              className="flex items-center justify-center text-xs font-medium text-white transition-all duration-300"
              style={{ width: `${w}%`, backgroundColor: s.color, minWidth: w > 3 ? undefined : "2px" }}
              title={`${s.label}: ${fmt(Math.round(s.value))} (${pct(w)})`}
            >
              {w > 10 ? `${pct(w)}` : ""}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            {s.label}: {fmt(Math.round(s.value))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SelfEmploymentTaxCalculator() {
  const [grossIncome, setGrossIncome] = useState(100000);
  const [expenses, setExpenses] = useState(15000);
  const [filing, setFiling] = useState<"single" | "married" | "hoh">("single");
  const [stateCode, setStateCode] = useState("TX");
  const [otherIncome, setOtherIncome] = useState(0);
  const [taxCredits, setTaxCredits] = useState(0);
  const [retirement, setRetirement] = useState(0);

  const result = useMemo(() => {
    // Net SE income
    const netSE = Math.max(0, grossIncome - expenses);

    // SE tax
    const se = calcSETax(netSE);

    // AGI calculation
    const agi = netSE + otherIncome - se.deductibleHalf - retirement;

    // Taxable income after standard deduction
    const deduction = stdDeduction[filing];
    const taxableIncome = Math.max(0, agi - deduction);

    // Federal income tax
    const federal = calcFedTax(taxableIncome, filing);

    // State tax (on AGI minus reasonable deduction proxy)
    const stateTax = calcStateTax(Math.max(0, agi - deduction), stateCode);

    // Apply tax credits
    const federalAfterCredits = Math.max(0, federal.tax - taxCredits);

    // Totals
    const totalTax = se.total + federalAfterCredits + stateTax;
    const quarterlyPayment = totalTax / 4;
    const takeHome = grossIncome - expenses - totalTax;
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

    // W-2 comparison: if same gross pay, employer covers half FICA
    const w2Gross = netSE + otherIncome;
    const w2SS = Math.min(w2Gross, SS_CAP) * SS_RATE_W2;
    const w2Medicare = w2Gross * MEDICARE_RATE_W2 +
      (w2Gross > MEDICARE_ADDITIONAL_THRESHOLD ? (w2Gross - MEDICARE_ADDITIONAL_THRESHOLD) * MEDICARE_ADDITIONAL_RATE : 0);
    const w2FICA = w2SS + w2Medicare;
    const w2TaxableIncome = Math.max(0, w2Gross - retirement - deduction);
    const w2Federal = calcFedTax(w2TaxableIncome, filing);
    const w2State = calcStateTax(Math.max(0, w2Gross - deduction), stateCode);
    const w2Total = w2FICA + w2Federal.tax + w2State - taxCredits;
    const w2Difference = totalTax - Math.max(0, w2Total);

    // Retirement tax savings
    const noRetirementAGI = netSE + otherIncome - se.deductibleHalf;
    const noRetirementTaxable = Math.max(0, noRetirementAGI - deduction);
    const noRetirementFed = calcFedTax(noRetirementTaxable, filing);
    const noRetirementState = calcStateTax(Math.max(0, noRetirementAGI - deduction), stateCode);
    const noRetirementTotal = se.total + Math.max(0, noRetirementFed.tax - taxCredits) + noRetirementState;
    const retirementSavings = noRetirementTotal - totalTax;

    // QBI deduction estimate (20% of qualified business income, simplified)
    const qbiDeduction = Math.min(netSE * 0.2, taxableIncome * 0.2);

    return {
      netSE,
      se,
      agi,
      deduction,
      taxableIncome,
      federal,
      federalAfterCredits,
      stateTax,
      totalTax,
      quarterlyPayment,
      takeHome,
      effectiveRate,
      w2Difference,
      w2Total: Math.max(0, w2Total),
      retirementSavings,
      qbiDeduction,
      monthly: takeHome / 12,
      weekly: takeHome / 52,
    };
  }, [grossIncome, expenses, filing, stateCode, otherIncome, taxCredits, retirement]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5";

  const donutSlices = [
    { label: "SE Tax", value: result.se.total, color: "#ef4444" },
    { label: "Federal", value: result.federalAfterCredits, color: "#f97316" },
    { label: "State", value: result.stateTax, color: "#eab308" },
    { label: "Take-Home", value: Math.max(0, result.takeHome), color: "#22c55e" },
  ];

  const barSegments = [
    { label: "Social Security", value: result.se.ss, color: "#ef4444" },
    { label: "Medicare", value: result.se.medicare, color: "#f87171" },
    { label: "Federal Income", value: result.federalAfterCredits, color: "#f97316" },
    { label: "State Income", value: result.stateTax, color: "#eab308" },
    { label: "Take-Home", value: Math.max(0, result.takeHome), color: "#22c55e" },
  ];

  const quarterlyDates = [
    { period: "Q1 (Jan 1 - Mar 31)", due: "April 15, 2026" },
    { period: "Q2 (Apr 1 - May 31)", due: "June 15, 2026" },
    { period: "Q3 (Jun 1 - Aug 31)", due: "September 15, 2026" },
    { period: "Q4 (Sep 1 - Dec 31)", due: "January 15, 2027" },
  ];

  const stateInfo = states[stateCode];

  // Personalized advice
  const advice = useMemo(() => {
    const tips: string[] = [];
    if (retirement === 0 && result.netSE > 30000) {
      const maxSep = Math.min(result.netSE * 0.25, 69000);
      tips.push(`You could contribute up to ${fmt(Math.round(maxSep))} to a SEP-IRA and save significantly on taxes. Even ${fmt(10000)} would save roughly ${fmt(Math.round(10000 * result.federal.marginal / 100))} in federal taxes alone.`);
    }
    if (result.effectiveRate > 30) {
      tips.push("Your effective tax rate is above 30%. Consider maximizing retirement contributions, timing income/expenses across tax years, and exploring an S-Corp election which can reduce SE tax on distributions.");
    }
    if (expenses / grossIncome < 0.1 && grossIncome > 50000) {
      tips.push("Your business expenses are less than 10% of gross income. Make sure you're capturing all deductible expenses: home office, internet, phone, software, professional development, mileage, health insurance premiums, and business insurance.");
    }
    if (stateInfo && stateInfo.rate >= 6) {
      tips.push(`${stateInfo.name} has a relatively high state tax rate of ${stateInfo.rate}%. If location flexibility is an option, states like Florida, Texas, or Wyoming have no state income tax.`);
    }
    if (tips.length === 0) {
      tips.push("You're in good shape! Keep tracking all business expenses, make quarterly estimated payments to avoid penalties, and consider consulting a tax professional for advanced strategies like the QBI deduction or S-Corp election.");
    }
    return tips;
  }, [retirement, result.netSE, result.effectiveRate, result.federal.marginal, expenses, grossIncome, stateInfo]);

  return (
    <ToolLayout
      title="Self-Employment Tax Calculator"
      description="Calculate self-employment tax, estimated quarterly payments, and total tax burden for freelancers, 1099 contractors, and gig workers. Includes SE tax, federal income tax, and state taxes for 2026."
      slug="self-employment-tax-calculator"
      category="Finance"
      keywords={[
        "self employment tax calculator",
        "1099 tax calculator",
        "freelance tax calculator",
        "quarterly tax calculator",
        "self employed tax estimator",
        "independent contractor tax calculator",
        "gig worker tax calculator",
      ]}
      faqs={[
        {
          question: "How much is self-employment tax?",
          answer: "Self-employment tax is 15.3% of 92.35% of your net self-employment income. This consists of 12.4% for Social Security (on the first $176,100 in 2026) and 2.9% for Medicare. If you earn over $200,000, you also pay an additional 0.9% Medicare surcharge. The 92.35% factor accounts for the employer-equivalent portion of SE tax. You can deduct half of your SE tax from your adjusted gross income.",
        },
        {
          question: "How do I calculate quarterly estimated taxes?",
          answer: "Divide your total expected tax liability (self-employment tax + federal income tax + state income tax) by four. Quarterly payments are due April 15, June 15, September 15, and January 15 of the following year. You must pay at least 90% of your current year's tax or 100% of last year's tax (110% if AGI exceeds $150,000) to avoid underpayment penalties. Use Form 1040-ES to make payments.",
        },
        {
          question: "What expenses can I deduct as self-employed?",
          answer: "Common deductible business expenses include: home office (dedicated space), internet and phone (business percentage), computer equipment and software, professional development and courses, business travel and mileage (67 cents/mile in 2024), health insurance premiums, office supplies, marketing and advertising, professional services (accounting, legal), business insurance, and retirement plan contributions (SEP-IRA, Solo 401k). Keep detailed records and receipts for all deductions.",
        },
        {
          question: "Do I have to pay self-employment tax on all my income?",
          answer: "You pay SE tax on net self-employment earnings (gross income minus business expenses) if that amount is $400 or more. The tax is calculated on 92.35% of your net earnings. Only self-employment income is subject to SE tax — W-2 wages, investment income, and rental income are generally excluded. If you have both W-2 and SE income, your W-2 wages count toward the Social Security cap.",
        },
        {
          question: "What is the QBI deduction?",
          answer: "The Qualified Business Income (QBI) deduction allows eligible self-employed individuals and small business owners to deduct up to 20% of their qualified business income from their taxable income. This deduction is taken on your personal return and can significantly reduce your federal income tax. There are income phase-out thresholds and limitations for certain service businesses. The QBI deduction does not reduce self-employment tax — only income tax.",
        },
        {
          question: "How much should I set aside for taxes as a freelancer?",
          answer: "A common rule of thumb is to set aside 25-30% of your gross income for taxes, but the exact amount depends on your income level, expenses, filing status, and state. At $100,000 gross income with $15,000 in expenses, a single filer in a no-tax state would owe roughly 25-27% in combined SE and federal taxes. In a high-tax state like California, it could be 32-35%. Use this calculator to find your exact percentage, then automatically transfer that amount to a separate savings account with each payment you receive.",
        },
      ]}
      relatedTools={[
        { name: "Tax Calculator", href: "/tools/tax-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
        { name: "Invoice Generator", href: "/tools/invoice-generator" },
      ]}
      guide={
        <div className="space-y-4 text-zinc-300 leading-relaxed">
          <p>
            Self-employment tax is the Social Security and Medicare tax that self-employed individuals pay on their net earnings. Unlike W-2 employees who split FICA taxes 50/50 with their employer, freelancers and independent contractors are responsible for both the employee and employer portions — a combined 15.3% (12.4% Social Security + 2.9% Medicare). The tax is calculated on 92.35% of your net self-employment earnings, and you can deduct half of it when calculating your adjusted gross income, which provides some relief on your income tax.
          </p>
          <p>
            Because self-employed individuals don't have taxes withheld from their income, the IRS requires quarterly estimated tax payments throughout the year. These payments cover both self-employment tax and income tax. The four deadlines are April 15, June 15, September 15, and January 15 of the following year. Failing to make adequate quarterly payments can result in underpayment penalties, even if you pay the full amount when filing your return. To avoid penalties, you must pay at least 90% of your current year&apos;s tax liability or 100% of your prior year&apos;s tax (110% if your AGI exceeds $150,000).
          </p>
          <p>
            Smart tax planning can significantly reduce your self-employment tax burden. Maximize business expense deductions to lower your net income — including home office, vehicle expenses, health insurance, and professional development. Contributing to a SEP-IRA (up to 25% of net earnings, max $69,000) or Solo 401(k) reduces your taxable income while building retirement savings. Consider the QBI deduction, which can reduce your taxable income by up to 20% of qualified business income. For higher earners, forming an S-Corporation can reduce SE tax by paying yourself a reasonable salary and taking the rest as distributions, which aren&apos;t subject to self-employment tax.
          </p>
        </div>
      }
    >
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        {/* ── Inputs ── */}
        <div className="space-y-4">
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Income &amp; Expenses</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Gross 1099 Income</label>
                <input
                  type="number"
                  className={inputCls}
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={1000}
                />
              </div>
              <div>
                <label className={labelCls}>Business Expenses</label>
                <input
                  type="number"
                  className={inputCls}
                  value={expenses}
                  onChange={(e) => setExpenses(Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={500}
                />
              </div>
              <div>
                <label className={labelCls}>Other Income (W-2, etc.)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={1000}
                />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Filing Details</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Filing Status</label>
                <select
                  className={inputCls}
                  value={filing}
                  onChange={(e) => setFiling(e.target.value as "single" | "married" | "hoh")}
                >
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                  <option value="hoh">Head of Household</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>State</label>
                <select
                  className={inputCls}
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                >
                  {statesSorted.map(([code, s]) => (
                    <option key={code} value={code}>
                      {s.name}{s.rate === 0 ? " (no tax)" : ` (${s.rate}%)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Deductions &amp; Credits</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Retirement Contributions (SEP-IRA / Solo 401k)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={retirement}
                  onChange={(e) => setRetirement(Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={1000}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  SEP-IRA max: {fmt(Math.round(Math.min(result.netSE * 0.25, 69000)))} (25% of net SE income, up to $69,000)
                </p>
              </div>
              <div>
                <label className={labelCls}>Estimated Tax Credits</label>
                <input
                  type="number"
                  className={inputCls}
                  value={taxCredits}
                  onChange={(e) => setTaxCredits(Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={500}
                />
              </div>
            </div>
          </div>

          {/* Quick Summary on mobile */}
          <div className={`${cardCls} lg:hidden bg-blue-950/30 border-blue-800/50`}>
            <div className="text-center">
              <div className="text-sm text-zinc-400 mb-1">Total Annual Tax</div>
              <div className="text-3xl font-bold text-blue-400">{fmt(Math.round(result.totalTax))}</div>
              <div className="text-sm text-zinc-400 mt-2">Quarterly Payment</div>
              <div className="text-2xl font-bold text-blue-300">{fmt(Math.round(result.quarterlyPayment))}</div>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="space-y-5">
          {/* Hero numbers */}
          <div className={`${cardCls} bg-gradient-to-br from-blue-950/40 to-zinc-800/50 border-blue-800/40`}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="text-center sm:text-left">
                <div className="text-sm text-zinc-400 mb-1">Total Annual Tax</div>
                <div className="text-4xl font-bold text-blue-400">{fmt(Math.round(result.totalTax))}</div>
                <div className="text-sm text-zinc-500 mt-1">
                  Effective rate: {pct(result.effectiveRate)} of gross income
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-sm text-zinc-400 mb-1">Quarterly Estimated Payment</div>
                <div className="text-4xl font-bold text-blue-300">{fmt(Math.round(result.quarterlyPayment))}</div>
                <div className="text-sm text-zinc-500 mt-1">
                  Due 4x per year to the IRS
                </div>
              </div>
            </div>
          </div>

          {/* Tax Breakdown Table */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Tax Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-700">
                    <th className="text-left py-2 font-medium">Tax Type</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium">% of Gross</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-zinc-700/50">
                    <td className="py-2">
                      Social Security (12.4%)
                      <span className="block text-xs text-zinc-500">On {fmt(Math.round(result.se.seBase))} SE base (up to {fmt(SS_CAP)})</span>
                    </td>
                    <td className="text-right py-2">{fmt(Math.round(result.se.ss))}</td>
                    <td className="text-right py-2 text-zinc-500">{pct(grossIncome > 0 ? (result.se.ss / grossIncome) * 100 : 0)}</td>
                  </tr>
                  <tr className="border-b border-zinc-700/50">
                    <td className="py-2">
                      Medicare (2.9%{result.se.additionalMedicare > 0 ? " + 0.9% additional" : ""})
                    </td>
                    <td className="text-right py-2">{fmt(Math.round(result.se.medicare))}</td>
                    <td className="text-right py-2 text-zinc-500">{pct(grossIncome > 0 ? (result.se.medicare / grossIncome) * 100 : 0)}</td>
                  </tr>
                  <tr className="border-b border-zinc-700/50 font-medium text-red-400">
                    <td className="py-2">Total Self-Employment Tax</td>
                    <td className="text-right py-2">{fmt(Math.round(result.se.total))}</td>
                    <td className="text-right py-2">{pct(grossIncome > 0 ? (result.se.total / grossIncome) * 100 : 0)}</td>
                  </tr>
                  <tr className="border-b border-zinc-700/50">
                    <td className="py-2">
                      Federal Income Tax
                      <span className="block text-xs text-zinc-500">{result.federal.marginal}% marginal bracket</span>
                    </td>
                    <td className="text-right py-2">{fmt(Math.round(result.federalAfterCredits))}</td>
                    <td className="text-right py-2 text-zinc-500">{pct(grossIncome > 0 ? (result.federalAfterCredits / grossIncome) * 100 : 0)}</td>
                  </tr>
                  <tr className="border-b border-zinc-700/50">
                    <td className="py-2">
                      {stateInfo?.name || "State"} Income Tax
                      {stateInfo?.rate === 0 && <span className="ml-1 text-xs text-green-500">(no state tax)</span>}
                    </td>
                    <td className="text-right py-2">{fmt(Math.round(result.stateTax))}</td>
                    <td className="text-right py-2 text-zinc-500">{pct(grossIncome > 0 ? (result.stateTax / grossIncome) * 100 : 0)}</td>
                  </tr>
                  <tr className="font-bold text-zinc-100 border-t border-zinc-600">
                    <td className="py-3">Total Tax</td>
                    <td className="text-right py-3">{fmt(Math.round(result.totalTax))}</td>
                    <td className="text-right py-3">{pct(result.effectiveRate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Where Each Dollar Goes</h3>
            <StackedBar segments={barSegments} />
            <div className="flex justify-center mt-5">
              <DonutChart slices={donutSlices} size={200} />
            </div>
          </div>

          {/* Take-Home Pay */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Take-Home Pay</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{fmt(Math.round(result.takeHome))}</div>
                <div className="text-xs text-zinc-500 mt-1">Annual</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{fmt(Math.round(result.monthly))}</div>
                <div className="text-xs text-zinc-500 mt-1">Monthly</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{fmt(Math.round(result.weekly))}</div>
                <div className="text-xs text-zinc-500 mt-1">Weekly</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-700 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Gross Income</span>
                <span className="text-zinc-200">{fmt(grossIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Business Expenses</span>
                <span className="text-red-400">-{fmt(expenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Tax</span>
                <span className="text-red-400">-{fmt(Math.round(result.totalTax))}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-zinc-300">Net Take-Home</span>
                <span className="text-green-400">{fmt(Math.round(result.takeHome))}</span>
              </div>
            </div>
          </div>

          {/* W-2 Comparison */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Self-Employed vs W-2 Comparison</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-900/50 rounded-lg p-4">
                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Self-Employed (You)</div>
                <div className="text-xl font-bold text-zinc-100">{fmt(Math.round(result.totalTax))}</div>
                <div className="text-xs text-zinc-500">Total tax on {fmt(result.netSE)} net income</div>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4">
                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">W-2 Employee</div>
                <div className="text-xl font-bold text-zinc-100">{fmt(Math.round(result.w2Total))}</div>
                <div className="text-xs text-zinc-500">Employer covers half of FICA</div>
              </div>
            </div>
            {result.w2Difference > 0 && (
              <div className="mt-3 p-3 bg-amber-950/30 border border-amber-800/30 rounded-lg text-sm text-amber-300">
                As self-employed, you pay approximately <strong>{fmt(Math.round(result.w2Difference))}</strong> more per year than a W-2 employee earning the same amount, because you cover both halves of Social Security and Medicare taxes.
              </div>
            )}
          </div>

          {/* Deduction Summary */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Deduction Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-zinc-700/50">
                <span className="text-zinc-400">Half of SE Tax Deduction</span>
                <span className="text-green-400">-{fmt(Math.round(result.se.deductibleHalf))}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-700/50">
                <span className="text-zinc-400">Standard Deduction ({filing === "married" ? "MFJ" : filing === "hoh" ? "HoH" : "Single"})</span>
                <span className="text-green-400">-{fmt(result.deduction)}</span>
              </div>
              {retirement > 0 && (
                <div className="flex justify-between py-1.5 border-b border-zinc-700/50">
                  <span className="text-zinc-400">Retirement Contributions</span>
                  <span className="text-green-400">-{fmt(retirement)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-zinc-700/50">
                <span className="text-zinc-400">Adjusted Gross Income (AGI)</span>
                <span className="text-zinc-200">{fmt(Math.round(result.agi))}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-400">Federal Taxable Income</span>
                <span className="text-zinc-200">{fmt(Math.round(result.taxableIncome))}</span>
              </div>
              <div className="mt-3 p-3 bg-blue-950/30 border border-blue-800/30 rounded-lg text-xs text-blue-300">
                <strong>QBI Deduction Note:</strong> You may also qualify for the Qualified Business Income (QBI) deduction of up to 20% of your qualified business income ({fmt(Math.round(result.qbiDeduction))} estimated). This deduction is not included in the calculations above — consult a tax professional to determine your eligibility, as phase-outs and limitations may apply.
              </div>
            </div>
          </div>

          {/* Quarterly Payment Schedule */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Quarterly Payment Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-700">
                    <th className="text-left py-2 font-medium">Period</th>
                    <th className="text-left py-2 font-medium">Due Date</th>
                    <th className="text-right py-2 font-medium">Amount (1040-ES)</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  {quarterlyDates.map((q, i) => (
                    <tr key={i} className="border-b border-zinc-700/50">
                      <td className="py-2">{q.period}</td>
                      <td className="py-2 font-medium text-blue-400">{q.due}</td>
                      <td className="text-right py-2 font-mono">{fmt(Math.round(result.quarterlyPayment))}</td>
                    </tr>
                  ))}
                  <tr className="font-bold text-zinc-100 border-t border-zinc-600">
                    <td className="py-2" colSpan={2}>Total Estimated Payments</td>
                    <td className="text-right py-2 font-mono">{fmt(Math.round(result.totalTax))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Retirement Impact */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Retirement Contribution Impact</h3>
            {retirement > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Your Contribution</span>
                  <span className="text-zinc-200">{fmt(retirement)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Tax Savings</span>
                  <span className="text-green-400">{fmt(Math.round(result.retirementSavings))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Effective Cost (after tax savings)</span>
                  <span className="text-zinc-200">{fmt(Math.round(retirement - result.retirementSavings))}</span>
                </div>
                <div className="p-3 bg-green-950/30 border border-green-800/30 rounded-lg text-xs text-green-300">
                  Your {fmt(retirement)} retirement contribution saves you {fmt(Math.round(result.retirementSavings))} in taxes, making the effective cost only {fmt(Math.round(retirement - result.retirementSavings))}. That&apos;s like getting a {pct(retirement > 0 ? (result.retirementSavings / retirement) * 100 : 0)} discount on your retirement savings.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">You haven&apos;t entered any retirement contributions. Here&apos;s what you could save:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-zinc-500 border-b border-zinc-700">
                        <th className="text-left py-2 font-medium">Contribution</th>
                        <th className="text-right py-2 font-medium">Est. Tax Savings</th>
                        <th className="text-right py-2 font-medium">Effective Cost</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-300">
                      {[5000, 10000, 20000, Math.round(Math.min(result.netSE * 0.25, 69000))].filter((v, i, a) => a.indexOf(v) === i && v > 0).map((amount) => {
                        const savings = amount * (result.federal.marginal / 100) + (stateInfo ? amount * stateInfo.rate / 100 : 0);
                        return (
                          <tr key={amount} className="border-b border-zinc-700/50">
                            <td className="py-2">{fmt(amount)}</td>
                            <td className="text-right py-2 text-green-400">{fmt(Math.round(savings))}</td>
                            <td className="text-right py-2">{fmt(Math.round(amount - savings))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Personalized Advice */}
          <div className={`${cardCls} bg-gradient-to-br from-indigo-950/30 to-zinc-800/50 border-indigo-800/30`}>
            <h3 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Personalized Tax Insights
            </h3>
            <ul className="space-y-2">
              {advice.map((tip, i) => (
                <li key={i} className="text-sm text-zinc-300 pl-4 border-l-2 border-indigo-500/50 py-1">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Set-Aside Reminder */}
          <div className={`${cardCls} border-amber-800/30 bg-amber-950/20`}>
            <div className="flex items-start gap-3">
              <div className="text-amber-400 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-300 mb-1">Set Aside {pct(result.effectiveRate)} of Every Payment</h4>
                <p className="text-xs text-zinc-400">
                  Based on your numbers, set aside <strong className="text-amber-300">{pct(result.effectiveRate)}</strong> of every payment you receive into a separate savings account for taxes. On a {fmt(5000)} invoice, that&apos;s {fmt(Math.round(5000 * result.effectiveRate / 100))} for taxes. This ensures you always have enough for quarterly payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
