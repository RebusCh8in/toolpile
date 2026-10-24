"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── Formatting helpers ── */
function fmtD(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}
function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── 2026 Federal Tax Brackets ── */
type Filing = "single" | "mfj" | "mfs" | "hoh";

const TAX_BRACKETS: Record<Filing, { min: number; max: number; rate: number }[]> = {
  single: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
  mfj: [
    { min: 0, max: 23850, rate: 10 },
    { min: 23850, max: 96950, rate: 12 },
    { min: 96950, max: 206700, rate: 22 },
    { min: 206700, max: 394600, rate: 24 },
    { min: 394600, max: 501050, rate: 32 },
    { min: 501050, max: 752800, rate: 35 },
    { min: 752800, max: Infinity, rate: 37 },
  ],
  mfs: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 376400, rate: 35 },
    { min: 376400, max: Infinity, rate: 37 },
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

/* ── Phaseout thresholds ── */
const PHASEOUT_START: Record<Filing, number> = {
  single: 100000,
  mfj: 200000,
  mfs: 100000,
  hoh: 100000,
};
const PHASEOUT_END: Record<Filing, number> = {
  single: 150000,
  mfj: 300000,
  mfs: 150000,
  hoh: 150000,
};

const ANNUAL_CAP = 10000;

/* ── Get marginal tax rate from MAGI ── */
function getMarginalRate(magi: number, filing: Filing): number {
  const brackets = TAX_BRACKETS[filing];
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (magi > brackets[i].min) return brackets[i].rate;
  }
  return brackets[0].rate;
}

/* ── Phaseout calculation (per the OBBBA formula) ── */
function calcPhaseout(interestPaid: number, magi: number, filing: Filing) {
  const threshold = PHASEOUT_START[filing];
  const capped = Math.min(interestPaid, ANNUAL_CAP);
  if (magi <= threshold) return { deduction: capped, reduction: 0, status: "full" as const };
  const excess = magi - threshold;
  const reduction = Math.ceil(excess / 1000) * 200;
  const deduction = Math.max(0, capped - reduction);
  if (deduction <= 0) return { deduction: 0, reduction, status: "none" as const };
  return { deduction, reduction, status: "partial" as const };
}

/* ── Amortization math ── */
function calcAmortization(principal: number, annualRate: number, termMonths: number, startDate: Date) {
  const monthlyRate = annualRate / 100 / 12;
  if (principal <= 0 || termMonths <= 0) return [];

  const payment = monthlyRate === 0
    ? principal / termMonths
    : (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

  const schedule: { month: number; year: number; calYear: number; payment: number; interest: number; principal: number; balance: number }[] = [];
  let balance = principal;

  for (let i = 0; i < termMonths; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + 1 + i, 1);
    const interest = balance * monthlyRate;
    const princ = Math.min(payment - interest, balance);
    balance = Math.max(0, balance - princ);
    schedule.push({
      month: i + 1,
      year: d.getFullYear(),
      calYear: d.getFullYear(),
      payment,
      interest,
      principal: princ,
      balance,
    });
  }
  return schedule;
}

const FILING_LABELS: Record<Filing, string> = {
  single: "Single",
  mfj: "Married Filing Jointly",
  mfs: "Married Filing Separately",
  hoh: "Head of Household",
};

export default function Page() {
  /* ── Inputs ── */
  const [loanAmount, setLoanAmount] = useState(35000);
  const [interestRate, setInterestRate] = useState(5.9);
  const [loanTerm, setLoanTerm] = useState(60);
  const [purchaseMonth, setPurchaseMonth] = useState("2025-06");
  const [isNewVehicle, setIsNewVehicle] = useState(true);
  const [vehicleType, setVehicleType] = useState("car");
  const [filingStatus, setFilingStatus] = useState<Filing>("single");
  const [magi, setMagi] = useState(85000);
  const [useAutoRate, setUseAutoRate] = useState(true);
  const [manualRate, setManualRate] = useState(22);

  /* ── Computed results ── */
  const results = useMemo(() => {
    const [y, m] = purchaseMonth.split("-").map(Number);
    const startDate = new Date(y, m - 1, 1);
    const schedule = calcAmortization(loanAmount, interestRate, loanTerm, startDate);

    const marginalRate = useAutoRate ? getMarginalRate(magi, filingStatus) : manualRate;

    // Sum interest by calendar year (2025-2028 only)
    const yearlyInterest: Record<number, number> = {};
    for (const row of schedule) {
      if (row.calYear >= 2025 && row.calYear <= 2028) {
        yearlyInterest[row.calYear] = (yearlyInterest[row.calYear] || 0) + row.interest;
      }
    }

    const yearResults: {
      year: number;
      interestPaid: number;
      cappedInterest: number;
      deduction: number;
      reduction: number;
      status: "full" | "partial" | "none";
      taxSavings: number;
    }[] = [];

    let totalSavings = 0;

    for (let yr = 2025; yr <= 2028; yr++) {
      const interest = yearlyInterest[yr] || 0;
      if (interest <= 0) {
        yearResults.push({ year: yr, interestPaid: 0, cappedInterest: 0, deduction: 0, reduction: 0, status: "none", taxSavings: 0 });
        continue;
      }
      const ph = calcPhaseout(interest, magi, filingStatus);
      const savings = isNewVehicle ? ph.deduction * (marginalRate / 100) : 0;
      totalSavings += savings;
      yearResults.push({
        year: yr,
        interestPaid: interest,
        cappedInterest: Math.min(interest, ANNUAL_CAP),
        deduction: isNewVehicle ? ph.deduction : 0,
        reduction: ph.reduction,
        status: isNewVehicle ? ph.status : "none",
        taxSavings: savings,
      });
    }

    // First 12 months of amortization
    const amortSnippet = schedule.slice(0, 12);

    // Monthly payment
    const monthlyPayment = schedule.length > 0 ? schedule[0].payment : 0;
    const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);

    // Current year (first year with interest)
    const currentYearResult = yearResults.find(r => r.interestPaid > 0) || yearResults[0];

    return { yearResults, totalSavings, amortSnippet, marginalRate, monthlyPayment, totalInterest, currentYearResult };
  }, [loanAmount, interestRate, loanTerm, purchaseMonth, isNewVehicle, filingStatus, magi, useAutoRate, manualRate]);

  /* ── Qualification checklist ── */
  const checks = [
    { label: "Vehicle is NEW (first transfer to buyer)", pass: isNewVehicle },
    { label: "Loan is for personal use (not business)", pass: true },
    { label: "Tax year is 2025-2028", pass: true },
    { label: "Income within phaseout range", pass: magi <= PHASEOUT_END[filingStatus] },
  ];

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4";

  /* ── Phaseout bar ── */
  const phaseStart = PHASEOUT_START[filingStatus];
  const phaseEnd = PHASEOUT_END[filingStatus];
  const phaseProgress = magi <= phaseStart ? 0 : magi >= phaseEnd ? 100 : ((magi - phaseStart) / (phaseEnd - phaseStart)) * 100;

  return (
    <ToolLayout
      title="Car Loan Interest Deduction Calculator"
      description="Calculate your OBBBA car loan interest tax deduction for 2025-2028. See how much you'll save on taxes with the new auto loan interest deduction."
      slug="car-loan-interest-deduction-calculator"
      category="Finance"
      keywords={[
        "car loan interest deduction calculator",
        "auto loan interest tax deduction",
        "OBBBA car loan deduction",
        "car loan interest deduction 2026",
        "new car tax deduction calculator",
        "auto loan tax savings",
        "can I deduct car loan interest",
        "vehicle loan interest deduction",
        "car interest write off calculator",
        "Schedule 1-A auto loan",
      ]}
      faqs={[
        {
          question: "Can I deduct car loan interest on my taxes?",
          answer: "Yes, under the One Big Beautiful Bill Act (OBBBA), you can deduct interest paid on loans for NEW motor vehicles purchased during tax years 2025 through 2028. This is an above-the-line deduction reported on Schedule 1-A, meaning you do not need to itemize deductions to claim it. The maximum deduction is $10,000 per year, subject to income phaseouts.",
        },
        {
          question: "What is the maximum car loan interest deduction?",
          answer: "The maximum car loan interest deduction under the OBBBA is $10,000 per year. If you paid less than $10,000 in interest during the tax year, your deduction is limited to the amount you actually paid. The deduction may be further reduced if your Modified Adjusted Gross Income (MAGI) exceeds the phaseout threshold for your filing status.",
        },
        {
          question: "Does the car loan interest deduction apply to used cars?",
          answer: "No. The OBBBA car loan interest deduction only applies to NEW vehicles — specifically, the first transfer of the vehicle from the manufacturer or dealer to the buyer. Interest on loans for used or pre-owned vehicles does not qualify for this deduction.",
        },
        {
          question: "What is the income limit for the car loan interest deduction?",
          answer: "The deduction phases out based on your Modified Adjusted Gross Income (MAGI). For Single and Head of Household filers, the phaseout begins at $100,000 MAGI and is fully eliminated at $150,000. For Married Filing Jointly, it begins at $200,000 and phases out at $300,000. For Married Filing Separately, the phaseout is $100,000 to $150,000. The deduction decreases by $200 for every $1,000 (or fraction thereof) of MAGI above the threshold.",
        },
        {
          question: "Do I need to itemize to claim the car loan interest deduction?",
          answer: "No. The car loan interest deduction is an above-the-line deduction, meaning it reduces your Adjusted Gross Income (AGI) directly. It is reported on Schedule 1-A and flows to Form 1040 line 13b. You can claim it regardless of whether you take the standard deduction or itemize.",
        },
        {
          question: "Does the car need to be assembled in the US to qualify?",
          answer: "No. The OBBBA car loan interest deduction does not have a domestic assembly requirement. That requirement applies to the Clean Vehicle (EV) Tax Credit under Section 30D, which is a completely separate provision. Any new motor vehicle qualifies for the loan interest deduction regardless of where it was manufactured.",
        },
        {
          question: "Can I deduct interest on a car lease?",
          answer: "No. The OBBBA deduction applies only to interest paid on loans (financing) for new motor vehicles. Lease payments are not loan interest and do not qualify. If you lease a vehicle, the implicit financing cost embedded in your lease payments is not deductible under this provision.",
        },
        {
          question: "How long does the car loan interest deduction last?",
          answer: "The car loan interest deduction is available for tax years 2025 through 2028 — a total of four tax years. Interest paid outside of this window (before 2025 or after 2028) does not qualify, even if the loan was originated during the eligible period.",
        },
      ]}
      relatedTools={[
        { name: "Auto Loan Calculator", href: "/tools/auto-loan-calculator" },
        { name: "OBBBA Tax Calculator", href: "/tools/obbba-tax-calculator" },
        { name: "Tax Calculator", href: "/tools/tax-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
      ]}
      guide={<>
        <h2>OBBBA Car Loan Interest Tax Deduction: Complete Guide</h2>

        <h3>What Is the Car Loan Interest Deduction?</h3>
        <p>The One Big Beautiful Bill Act (OBBBA) introduced a new above-the-line tax deduction for interest paid on loans for new motor vehicles. This deduction is available for tax years 2025 through 2028 and allows eligible taxpayers to deduct up to <strong>$10,000 per year</strong> in auto loan interest from their taxable income.</p>
        <p>Because it is an above-the-line deduction (reported on Schedule 1-A, flowing to Form 1040 line 13b), you do <strong>not</strong> need to itemize your deductions to claim it. It directly reduces your Adjusted Gross Income (AGI).</p>

        <h3>Who Qualifies?</h3>
        <p>To qualify for the car loan interest deduction, you must meet all of the following requirements:</p>
        <ul>
          <li><strong>New vehicle only:</strong> The vehicle must be new — the first transfer from the manufacturer or dealer to the buyer. Used, pre-owned, and certified pre-owned vehicles do not qualify.</li>
          <li><strong>Personal use:</strong> The vehicle must be primarily for personal use. Business vehicles are excluded because business owners already have existing deductions for vehicle expenses (Section 179, MACRS depreciation, etc.).</li>
          <li><strong>Motor vehicle:</strong> The vehicle must be a motor vehicle — cars, trucks, SUVs, vans, and motorcycles all qualify.</li>
          <li><strong>Loan financing:</strong> You must have financed the purchase with a loan. Leases and cash purchases do not qualify.</li>
          <li><strong>Tax year 2025-2028:</strong> The interest must be paid during tax years 2025 through 2028.</li>
        </ul>

        <h3>Income Phaseout Rules</h3>
        <p>The deduction phases out for higher-income taxpayers based on Modified Adjusted Gross Income (MAGI):</p>
        <ul>
          <li><strong>Single / Head of Household:</strong> Phaseout begins at $100,000 MAGI, fully eliminated at $150,000</li>
          <li><strong>Married Filing Jointly:</strong> Phaseout begins at $200,000 MAGI, fully eliminated at $300,000</li>
          <li><strong>Married Filing Separately:</strong> Phaseout begins at $100,000 MAGI, fully eliminated at $150,000</li>
        </ul>
        <p>The formula reduces the deduction by $200 for every $1,000 (or fraction thereof) of MAGI above the starting threshold. For example, a Single filer with $125,000 MAGI would have their deduction reduced by $200 x 25 = $5,000.</p>

        <h3>How to Calculate Your Tax Savings</h3>
        <p>Your actual tax savings depend on three factors:</p>
        <ol>
          <li><strong>Interest paid:</strong> How much loan interest you paid during the tax year (determined by your loan amount, interest rate, and loan term using standard amortization).</li>
          <li><strong>Deduction amount:</strong> The lesser of your interest paid or $10,000, minus any phaseout reduction based on your income.</li>
          <li><strong>Marginal tax rate:</strong> Your federal tax bracket determines how much each dollar of deduction saves you. A $5,000 deduction in the 22% bracket saves $1,100 in taxes.</li>
        </ol>

        <h3>Example Calculation</h3>
        <p>A Single filer with $85,000 MAGI finances a $35,000 new car at 5.9% APR for 60 months. In the first full year, they pay approximately $1,850 in interest. Since their MAGI is below the $100,000 phaseout threshold, they can deduct the full $1,850. At a 22% marginal rate, this saves them about $407 in federal taxes.</p>

        <h3>How to Claim the Deduction</h3>
        <p>Report the deduction on <strong>Schedule 1-A</strong> of your federal tax return. The amount flows to <strong>Form 1040, line 13b</strong>. Your lender will provide Form 1098 showing interest paid during the year, similar to mortgage interest reporting. Keep records of your vehicle purchase (showing it was new) and your loan documents.</p>

        <h3>Important Notes</h3>
        <ul>
          <li>There is <strong>no requirement</strong> for the vehicle to be assembled in the United States. That requirement applies only to the EV tax credit (Section 30D), not the loan interest deduction.</li>
          <li>This deduction can be claimed <strong>in addition to</strong> the Clean Vehicle Tax Credit if you purchase an eligible electric vehicle.</li>
          <li>The deduction is <strong>per return</strong>, not per vehicle. If you have multiple qualifying loans, the combined interest is still subject to the $10,000 annual cap.</li>
        </ul>
      </>}
    >
      <div className="space-y-6">
        {/* ── Hero result card ── */}
        {isNewVehicle && results.currentYearResult && results.currentYearResult.interestPaid > 0 && (
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-2xl p-6 text-center">
            <p className="text-sm text-blue-300 mb-1">Your Estimated Tax Savings ({results.currentYearResult.year})</p>
            <p className="text-5xl font-bold text-blue-400">{fmtD(results.currentYearResult.taxSavings)}</p>
            <p className="text-sm text-zinc-400 mt-2">
              {fmtD(results.currentYearResult.deduction)} deduction at {results.marginalRate}% marginal rate
            </p>
            {results.totalSavings > results.currentYearResult.taxSavings && (
              <p className="text-sm text-zinc-500 mt-1">Total savings across all eligible years: <span className="text-blue-300 font-semibold">{fmtD(results.totalSavings)}</span></p>
            )}
          </div>
        )}

        {/* ── Warnings ── */}
        {!isNewVehicle && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-red-400 text-xl mt-0.5">&#9888;</span>
            <div>
              <p className="text-red-300 font-semibold">Used vehicles do not qualify</p>
              <p className="text-zinc-400 text-sm">The OBBBA car loan interest deduction only applies to NEW vehicles (first transfer from manufacturer/dealer to buyer). Used, pre-owned, and CPO vehicles are not eligible.</p>
            </div>
          </div>
        )}
        {magi > PHASEOUT_END[filingStatus] && isNewVehicle && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-amber-400 text-xl mt-0.5">&#9888;</span>
            <div>
              <p className="text-amber-300 font-semibold">Income exceeds phaseout limit</p>
              <p className="text-zinc-400 text-sm">
                Your MAGI of {fmtD(magi)} exceeds the {fmtD(PHASEOUT_END[filingStatus])} full phaseout threshold for {FILING_LABELS[filingStatus]} filers. The deduction is fully eliminated at this income level.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Left column: Inputs ── */}
          <div className="space-y-6">
            {/* Loan Details */}
            <div className={cardCls}>
              <h3 className="text-zinc-200 font-semibold mb-4">Loan Details</h3>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Loan Amount ($)</label>
                  <input type="number" value={loanAmount} onChange={e => setLoanAmount(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
                </div>
                <div>
                  <label className={labelCls}>Interest Rate (APR %)</label>
                  <input type="number" value={interestRate} onChange={e => setInterestRate(Math.max(0, +e.target.value))} className={inputCls} min={0} max={30} step={0.1} />
                </div>
                <div>
                  <label className={labelCls}>Loan Term</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[36, 48, 60, 72].map(m => (
                      <button key={m} onClick={() => setLoanTerm(m)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${loanTerm === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"}`}>{m} mo</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Purchase Month</label>
                  <input type="month" value={purchaseMonth} onChange={e => setPurchaseMonth(e.target.value)} className={inputCls} min="2025-01" max="2028-12" />
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className={cardCls}>
              <h3 className="text-zinc-200 font-semibold mb-4">Vehicle Info</h3>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Vehicle Condition</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setIsNewVehicle(true)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${isNewVehicle ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"}`}>New</button>
                    <button onClick={() => setIsNewVehicle(false)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${!isNewVehicle ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"}`}>Used</button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Vehicle Type</label>
                  <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} className={inputCls}>
                    <option value="car">Car / Sedan</option>
                    <option value="suv">SUV / Crossover</option>
                    <option value="truck">Truck / Pickup</option>
                    <option value="van">Van / Minivan</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tax Info */}
            <div className={cardCls}>
              <h3 className="text-zinc-200 font-semibold mb-4">Tax Info</h3>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Filing Status</label>
                  <select value={filingStatus} onChange={e => setFilingStatus(e.target.value as Filing)} className={inputCls}>
                    <option value="single">Single</option>
                    <option value="mfj">Married Filing Jointly</option>
                    <option value="mfs">Married Filing Separately</option>
                    <option value="hoh">Head of Household</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Modified Adjusted Gross Income (MAGI)</label>
                  <input type="number" value={magi} onChange={e => setMagi(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
                </div>
                <div>
                  <label className={labelCls}>Marginal Tax Rate</label>
                  <div className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                      <input type="checkbox" checked={useAutoRate} onChange={e => setUseAutoRate(e.target.checked)} className="rounded bg-zinc-700 border-zinc-600 text-blue-500 focus:ring-blue-500" />
                      Auto-calculate from MAGI
                    </label>
                  </div>
                  {useAutoRate ? (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 text-sm">
                      {results.marginalRate}% (based on 2026 brackets for {FILING_LABELS[filingStatus]})
                    </div>
                  ) : (
                    <input type="number" value={manualRate} onChange={e => setManualRate(Math.max(0, Math.min(50, +e.target.value)))} className={inputCls} min={0} max={50} step={1} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column: Results ── */}
          <div className="space-y-6">
            {/* Qualification checklist */}
            <div className={cardCls}>
              <h3 className="text-zinc-200 font-semibold mb-3">Do You Qualify?</h3>
              <ul className="space-y-2">
                {checks.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className={`text-lg ${c.pass ? "text-green-400" : "text-red-400"}`}>{c.pass ? "\u2713" : "\u2717"}</span>
                    <span className={c.pass ? "text-zinc-300" : "text-red-300"}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phaseout visualization */}
            <div className={cardCls}>
              <h3 className="text-zinc-200 font-semibold mb-3">Income Phaseout Status</h3>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Full deduction</span>
                  <span>Phaseout range</span>
                  <span>No deduction</span>
                </div>
                <div className="relative h-4 bg-zinc-700 rounded-full overflow-hidden">
                  {/* Green zone: 0 to start */}
                  <div className="absolute inset-y-0 left-0 bg-green-600/50 rounded-l-full" style={{ width: "33.3%" }} />
                  {/* Yellow zone: start to end */}
                  <div className="absolute inset-y-0 bg-amber-600/50" style={{ left: "33.3%", width: "33.4%" }} />
                  {/* Red zone: end+ */}
                  <div className="absolute inset-y-0 right-0 bg-red-600/50 rounded-r-full" style={{ width: "33.3%" }} />
                  {/* Marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white rounded shadow-lg shadow-white/50 transition-all duration-300"
                    style={{
                      left: `${magi <= phaseStart ? Math.min(33.3, (magi / phaseStart) * 33.3) : magi >= phaseEnd ? Math.min(100, 66.7 + ((magi - phaseEnd) / phaseEnd) * 33.3) : 33.3 + phaseProgress * 0.334}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>$0</span>
                  <span>{fmtD(phaseStart)}</span>
                  <span>{fmtD(phaseEnd)}</span>
                </div>
              </div>
              <p className="text-sm mt-2">
                {magi <= phaseStart ? (
                  <span className="text-green-400 font-medium">Full deduction available. Your MAGI is below the phaseout threshold.</span>
                ) : magi >= phaseEnd ? (
                  <span className="text-red-400 font-medium">No deduction available. Your MAGI exceeds the phaseout limit.</span>
                ) : (
                  <span className="text-amber-400 font-medium">Partial deduction. Your deduction is reduced by {fmtD(results.currentYearResult.reduction)} due to income phaseout.</span>
                )}
              </p>
            </div>

            {/* Year-by-year breakdown */}
            <div className={cardCls}>
              <h3 className="text-zinc-200 font-semibold mb-3">Year-by-Year Breakdown (2025-2028)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 text-zinc-400 text-left">
                      <th className="pb-2 pr-3">Year</th>
                      <th className="pb-2 pr-3 text-right">Interest Paid</th>
                      <th className="pb-2 pr-3 text-right">Deduction</th>
                      <th className="pb-2 text-right">Tax Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearResults.map(yr => (
                      <tr key={yr.year} className="border-b border-zinc-800">
                        <td className="py-2 pr-3 text-zinc-300 font-medium">{yr.year}</td>
                        <td className="py-2 pr-3 text-right text-zinc-400">{yr.interestPaid > 0 ? fmtD(yr.interestPaid) : "—"}</td>
                        <td className="py-2 pr-3 text-right">
                          {yr.deduction > 0 ? (
                            <span className="text-green-400">{fmtD(yr.deduction)}</span>
                          ) : yr.interestPaid > 0 ? (
                            <span className="text-red-400">$0</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {yr.taxSavings > 0 ? (
                            <span className="text-blue-400 font-semibold">{fmtD(yr.taxSavings)}</span>
                          ) : yr.interestPaid > 0 ? (
                            <span className="text-zinc-500">$0</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-zinc-600">
                      <td className="py-2 pr-3 text-zinc-200 font-semibold">Total</td>
                      <td className="py-2 pr-3 text-right text-zinc-300 font-semibold">{fmtD(results.yearResults.reduce((s, r) => s + r.interestPaid, 0))}</td>
                      <td className="py-2 pr-3 text-right text-green-400 font-semibold">{fmtD(results.yearResults.reduce((s, r) => s + r.deduction, 0))}</td>
                      <td className="py-2 text-right text-blue-400 font-bold">{fmtD(results.totalSavings)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Loan summary */}
            <div className={cardCls}>
              <h3 className="text-zinc-200 font-semibold mb-3">Loan Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Monthly Payment</p>
                  <p className="text-lg text-zinc-200 font-semibold">{fmtC(results.monthlyPayment)}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Interest</p>
                  <p className="text-lg text-zinc-200 font-semibold">{fmtD(results.totalInterest)}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Deduction (4 yr)</p>
                  <p className="text-lg text-green-400 font-semibold">{fmtD(results.yearResults.reduce((s, r) => s + r.deduction, 0))}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Tax Savings</p>
                  <p className="text-lg text-blue-400 font-semibold">{fmtD(results.totalSavings)}</p>
                </div>
              </div>
            </div>

            {/* Amortization snippet */}
            <div className={cardCls}>
              <h3 className="text-zinc-200 font-semibold mb-3">First 12 Months Amortization</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-700 text-zinc-400 text-left">
                      <th className="pb-2 pr-2">Mo</th>
                      <th className="pb-2 pr-2 text-right">Payment</th>
                      <th className="pb-2 pr-2 text-right">Interest</th>
                      <th className="pb-2 pr-2 text-right">Principal</th>
                      <th className="pb-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.amortSnippet.map(row => (
                      <tr key={row.month} className="border-b border-zinc-800/50">
                        <td className="py-1.5 pr-2 text-zinc-400">{row.month}</td>
                        <td className="py-1.5 pr-2 text-right text-zinc-300">{fmtC(row.payment)}</td>
                        <td className="py-1.5 pr-2 text-right text-amber-400">{fmtC(row.interest)}</td>
                        <td className="py-1.5 pr-2 text-right text-green-400">{fmtC(row.principal)}</td>
                        <td className="py-1.5 text-right text-zinc-400">{fmtC(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-zinc-800/30 border border-zinc-700/30 rounded-xl p-4 text-xs text-zinc-500">
          <p><strong className="text-zinc-400">Disclaimer:</strong> This calculator provides estimates based on the OBBBA car loan interest deduction provisions for tax years 2025-2028. Results are for informational purposes only and do not constitute tax advice. Actual tax savings depend on your complete tax situation. Consult a qualified tax professional for advice specific to your circumstances. Tax brackets shown are for 2026; other years may differ slightly due to inflation adjustments.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
