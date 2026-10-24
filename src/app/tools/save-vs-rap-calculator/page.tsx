"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ──────────────── Helpers ──────────────── */
function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fmtC2(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtP(n: number) {
  return n.toFixed(1) + "%";
}

/* ──────────────── 2026 Federal Poverty Level ──────────────── */
const fpl2026: Record<number, number> = {
  1: 15960, 2: 21640, 3: 27320, 4: 33000,
  5: 38680, 6: 44360, 7: 50040, 8: 55720,
};
function getFPL(size: number): number {
  if (size <= 8) return fpl2026[size];
  return fpl2026[8] + (size - 8) * 5680;
}

/* ──────────────── Plan Calculations ──────────────── */

type LoanType = "undergrad" | "grad" | "mixed";

interface PlanResult {
  name: string;
  badge: string;
  badgeColor: string;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  forgivenAmount: number;
  forgivenessYears: number;
  balanceGrows: boolean;
  paidOffEarly: boolean;
  payoffMonths: number;
}

function calcStandard10Year(balance: number, annualRate: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return balance / 120;
  return balance * (r * Math.pow(1 + r, 120)) / (Math.pow(1 + r, 120) - 1);
}

function calcRAP(agi: number, dependents: number): number {
  let payment: number;
  if (agi <= 10000) {
    payment = 10;
  } else if (agi <= 20000) {
    payment = (0.01 * agi) / 12;
  } else if (agi <= 30000) {
    payment = (0.02 * agi) / 12;
  } else if (agi <= 40000) {
    payment = (0.03 * agi) / 12;
  } else if (agi <= 50000) {
    payment = (0.04 * agi) / 12;
  } else if (agi <= 60000) {
    payment = (0.05 * agi) / 12;
  } else if (agi <= 70000) {
    payment = (0.06 * agi) / 12;
  } else if (agi <= 80000) {
    payment = (0.07 * agi) / 12;
  } else if (agi <= 90000) {
    payment = (0.08 * agi) / 12;
  } else if (agi <= 100000) {
    payment = (0.09 * agi) / 12;
  } else {
    payment = (0.10 * agi) / 12;
  }
  payment -= 50 * dependents;
  return Math.max(10, payment);
}

function calcSAVE(agi: number, householdSize: number, loanType: LoanType): number {
  const fplThreshold = getFPL(householdSize) * 2.25;
  const discretionary = Math.max(0, agi - fplThreshold);
  let rate: number;
  if (loanType === "undergrad") rate = 0.05;
  else if (loanType === "grad") rate = 0.10;
  else rate = 0.075; // mixed 50/50
  return Math.max(0, (discretionary * rate) / 12);
}

function calcIBRNew(agi: number, householdSize: number, stdPayment: number): number {
  const fplThreshold = getFPL(householdSize) * 1.50;
  const discretionary = Math.max(0, agi - fplThreshold);
  return Math.min(stdPayment, Math.max(0, (discretionary * 0.10) / 12));
}

function calcIBROld(agi: number, householdSize: number, stdPayment: number): number {
  const fplThreshold = getFPL(householdSize) * 1.50;
  const discretionary = Math.max(0, agi - fplThreshold);
  return Math.min(stdPayment, Math.max(0, (discretionary * 0.15) / 12));
}

/** Simulate loan over time. Returns { totalPaid, totalInterest, forgivenAmount, paidOffEarly, payoffMonths } */
function simulateLoan(
  balance: number,
  annualRate: number,
  monthlyPayment: number,
  maxMonths: number,
  interestWaived: boolean,
  principalMatch: boolean = false,
): { totalPaid: number; totalInterest: number; forgivenAmount: number; paidOffEarly: boolean; payoffMonths: number } {
  let remaining = balance;
  let totalPaid = 0;
  let totalInterest = 0;
  const monthlyRate = annualRate / 100 / 12;

  for (let m = 1; m <= maxMonths; m++) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;

    const payment = Math.min(monthlyPayment, remaining + (interestWaived ? 0 : interest));
    totalPaid += payment;

    if (interestWaived) {
      // interest is waived — payment goes entirely to principal
      let principalReduction = payment;
      // RAP $50 principal match: if borrower's principal payment < $50, gov matches up to $50
      if (principalMatch && principalReduction < 50 && remaining > 0) {
        const match = Math.min(50 - principalReduction, remaining - principalReduction);
        principalReduction += Math.max(0, match);
      }
      remaining = Math.max(0, remaining - principalReduction);
    } else {
      // interest accrues normally
      remaining = remaining + interest - payment;
      if (remaining < 0) remaining = 0;
    }

    if (remaining <= 0.01) {
      return { totalPaid, totalInterest, forgivenAmount: 0, paidOffEarly: true, payoffMonths: m };
    }
  }

  return { totalPaid, totalInterest, forgivenAmount: Math.max(0, remaining), paidOffEarly: false, payoffMonths: maxMonths };
}

function buildPlanResult(
  name: string,
  badge: string,
  badgeColor: string,
  monthlyPayment: number,
  balance: number,
  annualRate: number,
  forgivenessYears: number,
  interestWaived: boolean,
  principalMatch: boolean = false,
): PlanResult {
  const maxMonths = forgivenessYears * 12;
  const sim = simulateLoan(balance, annualRate, monthlyPayment, maxMonths, interestWaived, principalMatch);
  return {
    name,
    badge,
    badgeColor,
    monthlyPayment,
    totalPaid: sim.totalPaid,
    totalInterest: sim.totalInterest,
    forgivenAmount: sim.forgivenAmount,
    forgivenessYears,
    balanceGrows: !interestWaived && monthlyPayment < (balance * annualRate / 100 / 12),
    paidOffEarly: sim.paidOffEarly,
    payoffMonths: sim.payoffMonths,
  };
}

/* ──────────────── Component ──────────────── */
export default function Page() {
  const [balance, setBalance] = useState(35000);
  const [rate, setRate] = useState(6.53);
  const [agi, setAgi] = useState(50000);
  const [householdSize, setHouseholdSize] = useState(1);
  const [dependents, setDependents] = useState(0);
  const [loanType, setLoanType] = useState<LoanType>("undergrad");
  const [filingStatus, setFilingStatus] = useState("single");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const results = useMemo(() => {
    const stdPayment = calcStandard10Year(balance, rate);

    const rapPayment = calcRAP(agi, dependents);
    const savePayment = calcSAVE(agi, householdSize, loanType);
    const ibrNewPayment = calcIBRNew(agi, householdSize, stdPayment);
    const ibrOldPayment = calcIBROld(agi, householdSize, stdPayment);

    const saveForgivenessYears = loanType === "grad" ? 25 : 20;

    const rap = buildPlanResult("RAP", "Starts July 2026", "bg-blue-600", rapPayment, balance, rate, 30, true, true);
    const save = buildPlanResult("SAVE", "Struck Down", "bg-red-600", savePayment, balance, rate, saveForgivenessYears, true);
    const ibrNew = buildPlanResult("IBR (New)", "Post-July 2014", "bg-emerald-600", ibrNewPayment, balance, rate, 20, false);
    const ibrOld = buildPlanResult("IBR (Old)", "Pre-July 2014", "bg-amber-600", ibrOldPayment, balance, rate, 25, false);
    const standard = buildPlanResult("Standard 10-Year", "Default Plan", "bg-zinc-600", stdPayment, balance, rate, 10, false);

    return { rap, save, ibrNew, ibrOld, standard };
  }, [balance, rate, agi, householdSize, dependents, loanType]);

  const plans = [results.rap, results.save, results.ibrNew, results.ibrOld, results.standard];

  // Draw bar chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const maxPayment = Math.max(...plans.map((p) => p.monthlyPayment), 1);
    const barHeight = 32;
    const gap = 16;
    const labelWidth = 120;
    const valueWidth = 80;
    const chartLeft = labelWidth;
    const chartRight = w - valueWidth - 10;
    const chartWidth = chartRight - chartLeft;

    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#71717a"];

    plans.forEach((plan, i) => {
      const y = 10 + i * (barHeight + gap);

      // Label
      ctx.fillStyle = "#d4d4d8";
      ctx.font = "13px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(plan.name, chartLeft - 10, y + barHeight / 2);

      // Bar
      const barW = Math.max(2, (plan.monthlyPayment / maxPayment) * chartWidth);
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.roundRect(chartLeft, y, barW, barHeight, 4);
      ctx.fill();

      // Value
      ctx.fillStyle = "#e4e4e7";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(fmtC2(plan.monthlyPayment) + "/mo", chartLeft + barW + 8, y + barHeight / 2);
    });
  }, [plans]);

  const paymentDiff = results.rap.monthlyPayment - results.save.monthlyPayment;
  const paymentPctChange = results.save.monthlyPayment > 0
    ? ((paymentDiff / results.save.monthlyPayment) * 100)
    : (results.rap.monthlyPayment > 0 ? 100 : 0);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const sectionCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-5";
  const headingCls = "text-lg font-semibold text-zinc-100 mb-4";

  return (
    <ToolLayout
      title="SAVE vs RAP Student Loan Payment Calculator"
      description="The SAVE plan is dead. Compare your monthly student loan payments under the new RAP plan, IBR, and standard repayment. See how much more you'll pay and plan ahead."
      slug="save-vs-rap-calculator"
      category="Finance"
      keywords={[
        "save vs rap calculator",
        "rap student loan calculator",
        "save plan replacement",
        "repayment assistance plan calculator",
        "student loan payment comparison",
        "rap vs ibr",
      ]}
      faqs={[
        {
          question: "What happened to the SAVE plan?",
          answer: "The SAVE (Saving on a Valuable Education) plan was struck down by the 8th Circuit Court of Appeals on March 9, 2026. Seven Republican-led states sued, arguing the Department of Education exceeded its authority in creating SAVE. The Trump administration agreed to a settlement permanently ending the plan. Borrowers were placed in administrative forbearance starting in mid-2024 when the initial injunction hit, and remain in forbearance until RAP launches July 1, 2026.",
        },
        {
          question: "What is the RAP plan?",
          answer: "RAP (Repayment Assistance Plan) is the replacement for SAVE, created by the One Big Beautiful Bill Act (OBBBA, Public Law 119-21). It uses a sliding scale based on your adjusted gross income (AGI) to determine your monthly payment, ranging from 1% to 10% of AGI divided by 12. It also provides a $50 per month reduction for each dependent and a $50/month government principal match. The minimum payment is $10 per month, and forgiveness occurs after 30 years (360 payments).",
        },
        {
          question: "When does RAP start?",
          answer: "RAP is scheduled to begin on July 1, 2026. Borrowers currently in SAVE forbearance will be automatically enrolled in RAP on that date unless they choose a different repayment plan before then. The months spent in SAVE forbearance do NOT count toward RAP forgiveness.",
        },
        {
          question: "How is the RAP payment calculated?",
          answer: "RAP uses a sliding scale based on your AGI: $0-$10,000 AGI pays a flat $10/month; $10,001-$20,000 pays 1% of AGI divided by 12; $20,001-$30,000 pays 2%; and so on up to $100,001+ which pays 10% of AGI divided by 12. Then $50 is subtracted for each dependent. The minimum payment is always $10/month.",
        },
        {
          question: "Is RAP better or worse than SAVE?",
          answer: "For most borrowers, RAP results in higher monthly payments than SAVE would have. SAVE used 5% of discretionary income (above 225% of the federal poverty level) for undergraduate loans and 10% for graduate loans. RAP uses a flat percentage of total AGI on a sliding scale. Lower-income borrowers may see similar or lower payments, but middle and higher-income borrowers will generally pay more under RAP.",
        },
        {
          question: "Can I still enroll in IBR instead of RAP?",
          answer: "Yes. Income-Based Repayment (IBR) remains available. New IBR (for loans after July 1, 2014) uses 10% of discretionary income above 150% of FPL with forgiveness after 20 years. Old IBR (for loans before July 1, 2014) uses 15% of discretionary income with forgiveness after 25 years. You should compare all available plans to find the lowest payment and total cost for your situation.",
        },
        {
          question: "Will my balance grow under RAP?",
          answer: "No. RAP waives 100% of unpaid interest. If your monthly payment does not cover the full interest charge, the remaining interest is waived and your balance does not grow. This is the same interest benefit that SAVE provided. However, IBR does NOT waive unpaid interest, so your balance can grow under IBR if your payment is less than the monthly interest.",
        },
        {
          question: "Is RAP forgiveness taxable?",
          answer: "Under current law (as of 2026), yes. The American Rescue Plan Act temporarily excluded student loan forgiveness from taxable income through 2025, but that provision has expired. Forgiveness under RAP after 30 years will be treated as taxable income. Use our Student Loan Tax Bomb Calculator to estimate the tax impact.",
        },
        {
          question: "What happens if I don't choose a plan?",
          answer: "If you are currently in SAVE forbearance and do not actively select a repayment plan before July 1, 2026, you will be automatically enrolled in the RAP plan. Your first payment under RAP will be due based on your most recent income certification. If you have not certified your income, you may be placed on a plan based on the available income data.",
        },
        {
          question: "Are Parent PLUS loans eligible for RAP?",
          answer: "No. Parent PLUS loans are not eligible for RAP, just as they were not eligible for SAVE. Parent PLUS borrowers can access income-contingent repayment (ICR) by consolidating into a Direct Consolidation Loan. ICR charges 20% of discretionary income or what you would pay on a 12-year fixed plan, whichever is less, with forgiveness after 25 years.",
        },
      ]}
      relatedTools={[
        { name: "Student Loan Calculator", href: "/tools/student-loan-calculator" },
        { name: "Student Loan Tax Bomb Calculator", href: "/tools/student-loan-tax-bomb-calculator" },
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
      ]}
      guide={
        <>
          <h2>How to Use the SAVE vs RAP Calculator</h2>
          <p>
            This calculator compares your monthly student loan payments across five repayment plans: the new RAP plan,
            the defunct SAVE plan, IBR (New and Old), and the Standard 10-Year plan. Follow these steps:
          </p>
          <ol>
            <li><strong>Enter your loan balance</strong> &mdash; the total federal student loan balance you currently owe.</li>
            <li><strong>Set your interest rate</strong> &mdash; the weighted average interest rate across your loans. You can find this on studentaid.gov.</li>
            <li><strong>Enter your AGI</strong> &mdash; your adjusted gross income from your most recent tax return (Form 1040, line 11).</li>
            <li><strong>Set household size and dependents</strong> &mdash; household size affects the poverty level threshold used by SAVE and IBR. Dependents affect the RAP calculation ($50/month reduction per dependent).</li>
            <li><strong>Choose your loan type</strong> &mdash; this affects the SAVE payment rate (5% for undergrad, 10% for grad) and forgiveness timeline.</li>
            <li><strong>Review the comparison</strong> &mdash; look at monthly payments, total cost, forgiveness amounts, and the SAVE-to-RAP transition card.</li>
          </ol>

          <h2>Understanding Each Repayment Plan</h2>

          <h3>RAP (Repayment Assistance Plan)</h3>
          <p>
            RAP replaces the SAVE plan starting July 1, 2026. It uses a simple sliding scale based on your total AGI
            rather than discretionary income. Payments range from $10/month (for AGI under $10,000) to 10% of AGI divided
            by 12 (for AGI over $100,000). Each dependent reduces your payment by $50/month. The minimum payment is $10.
            Unpaid interest is fully waived, so your balance never grows. Forgiveness comes after 30 years of payments.
          </p>

          <h3>SAVE (Saving on a Valuable Education)</h3>
          <p>
            SAVE was struck down by the 8th Circuit Court of Appeals on March 9, 2026, and is no longer available. It calculated payments based on
            discretionary income (AGI minus 225% of the federal poverty level) at a rate of 5% for undergraduate loans
            and 10% for graduate loans. Forgiveness was after 20 years for undergrad and 25 years for grad loans.
            Like RAP, it waived unpaid interest. This calculator shows SAVE for comparison purposes only.
          </p>

          <h3>IBR (Income-Based Repayment)</h3>
          <p>
            IBR comes in two versions. New IBR (for loans originated after July 1, 2014) uses 10% of discretionary income
            above 150% of FPL with forgiveness after 20 years. Old IBR (for loans before July 1, 2014) uses 15% of
            discretionary income with forgiveness after 25 years. Both are capped at the standard 10-year payment amount.
            Unlike RAP and SAVE, IBR does NOT waive unpaid interest, so your balance can grow if payments do not cover interest.
          </p>

          <h3>Standard 10-Year</h3>
          <p>
            The default repayment plan with fixed monthly payments over 10 years. This results in the highest monthly
            payment but the lowest total cost since you pay off the full balance with interest and receive no forgiveness.
          </p>

          <h2>Important Caveats About the SAVE-to-RAP Transition</h2>
          <ul>
            <li><strong>Forbearance months do not count.</strong> Time spent in SAVE forbearance does not count toward forgiveness under any plan.</li>
            <li><strong>Interest capitalization risk.</strong> If you switch from SAVE forbearance to IBR before transitioning to RAP, any accrued interest during forbearance may capitalize (be added to your principal balance). If you wait for automatic RAP enrollment, interest during forbearance is waived.</li>
            <li><strong>Income recertification.</strong> You will need to recertify your income when RAP begins. Your payment will be based on your most recent AGI.</li>
            <li><strong>Tax bomb.</strong> Forgiveness under RAP after 30 years is taxable income under current law. Plan ahead for the potential tax bill by using our Student Loan Tax Bomb Calculator.</li>
            <li><strong>PSLF remains available.</strong> If you work for a qualifying public service employer, Public Service Loan Forgiveness (PSLF) still provides tax-free forgiveness after 120 qualifying payments. You can make qualifying PSLF payments while on RAP or IBR.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* ──── Inputs ──── */}
        <div className={sectionCls}>
          <h2 className={headingCls}>Your Loan Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Loan Balance */}
            <div>
              <label className={labelCls}>Loan Balance</label>
              <input
                type="number"
                className={inputCls}
                value={balance}
                min={0}
                step={1000}
                onChange={(e) => setBalance(Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Interest Rate */}
            <div>
              <label className={labelCls}>Interest Rate: {rate.toFixed(2)}%</label>
              <input
                type="range"
                className="w-full accent-blue-500"
                min={3}
                max={10}
                step={0.01}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>3%</span>
                <span>10%</span>
              </div>
            </div>

            {/* AGI */}
            <div>
              <label className={labelCls}>Adjusted Gross Income (AGI)</label>
              <input
                type="number"
                className={inputCls}
                value={agi}
                min={0}
                step={1000}
                onChange={(e) => setAgi(Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Household Size */}
            <div>
              <label className={labelCls}>Household Size</label>
              <select className={inputCls} value={householdSize} onChange={(e) => setHouseholdSize(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Dependents */}
            <div>
              <label className={labelCls}>Number of Dependents</label>
              <select className={inputCls} value={dependents} onChange={(e) => setDependents(Number(e.target.value))}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Loan Type */}
            <div>
              <label className={labelCls}>Loan Type</label>
              <select className={inputCls} value={loanType} onChange={(e) => setLoanType(e.target.value as LoanType)}>
                <option value="undergrad">Undergraduate Only</option>
                <option value="grad">Graduate Only</option>
                <option value="mixed">Mixed (50/50)</option>
              </select>
            </div>

            {/* Filing Status */}
            <div>
              <label className={labelCls}>Filing Status</label>
              <select className={inputCls} value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)}>
                <option value="single">Single</option>
                <option value="mfj">Married Filing Jointly</option>
              </select>
            </div>
          </div>
        </div>

        {/* ──── SAVE → RAP Highlight ──── */}
        <div className={`${sectionCls} border-2 ${paymentDiff > 0 ? "border-red-500/40" : "border-emerald-500/40"}`}>
          <h2 className={headingCls}>Your SAVE &rarr; RAP Payment Change</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">SAVE Payment</p>
              <p className="text-xl font-bold text-zinc-300">{fmtC2(results.save.monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">RAP Payment</p>
              <p className="text-xl font-bold text-zinc-100">{fmtC2(results.rap.monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Difference</p>
              <p className={`text-xl font-bold ${paymentDiff > 0 ? "text-red-400" : paymentDiff < 0 ? "text-emerald-400" : "text-zinc-300"}`}>
                {paymentDiff > 0 ? "+" : ""}{fmtC2(paymentDiff)}/mo
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">% Change</p>
              <p className={`text-xl font-bold ${paymentDiff > 0 ? "text-red-400" : paymentDiff < 0 ? "text-emerald-400" : "text-zinc-300"}`}>
                {paymentDiff > 0 ? "+" : ""}{paymentPctChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* ──── Plan Comparison Cards ──── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.name} className={sectionCls}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-zinc-100">{plan.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Monthly Payment</span>
                  <span className="text-zinc-100 font-medium">{fmtC2(plan.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Paid</span>
                  <span className="text-zinc-100 font-medium">{fmtC(plan.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Interest</span>
                  <span className="text-zinc-100 font-medium">{fmtC(plan.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Forgiven Amount</span>
                  <span className={`font-medium ${plan.forgivenAmount > 0 ? "text-emerald-400" : "text-zinc-500"}`}>
                    {plan.forgivenAmount > 0 ? fmtC(plan.forgivenAmount) : "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Forgiveness Timeline</span>
                  <span className="text-zinc-100 font-medium">
                    {plan.paidOffEarly
                      ? `Paid off in ${Math.ceil(plan.payoffMonths / 12)} years`
                      : `${plan.forgivenessYears} years`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Balance Grows?</span>
                  <span className={`font-medium ${plan.balanceGrows ? "text-red-400" : "text-emerald-400"}`}>
                    {plan.balanceGrows ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ──── Payment Comparison Bar Chart ──── */}
        <div className={sectionCls}>
          <h2 className={headingCls}>Monthly Payment Comparison</h2>
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{ height: `${plans.length * 48 + 20}px` }}
          />
        </div>

        {/* ──── Total Cost Comparison ──── */}
        <div className={sectionCls}>
          <h2 className={headingCls}>Total Cost Comparison</h2>
          <p className="text-xs text-zinc-500 mb-4">
            Includes total payments made. Forgiven amounts may be taxable under current law &mdash; see our{" "}
            <a href="/tools/student-loan-tax-bomb-calculator" className="text-blue-400 underline">
              Student Loan Tax Bomb Calculator
            </a>{" "}
            to estimate the tax impact.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="text-left py-2 pr-4">Plan</th>
                  <th className="text-right py-2 px-2">Monthly</th>
                  <th className="text-right py-2 px-2">Total Paid</th>
                  <th className="text-right py-2 px-2">Forgiven</th>
                  <th className="text-right py-2 px-2">Timeline</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.name} className="border-b border-zinc-800">
                    <td className="py-2 pr-4 text-zinc-100 font-medium">{plan.name}</td>
                    <td className="py-2 px-2 text-right text-zinc-300">{fmtC2(plan.monthlyPayment)}</td>
                    <td className="py-2 px-2 text-right text-zinc-300">{fmtC(plan.totalPaid)}</td>
                    <td className="py-2 px-2 text-right text-emerald-400">
                      {plan.forgivenAmount > 0 ? fmtC(plan.forgivenAmount) : "--"}
                    </td>
                    <td className="py-2 px-2 text-right text-zinc-300">
                      {plan.paidOffEarly ? `${Math.ceil(plan.payoffMonths / 12)} yr` : `${plan.forgivenessYears} yr`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
