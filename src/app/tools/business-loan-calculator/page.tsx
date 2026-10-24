"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtK(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

type LoanType = "term" | "sba7a" | "sba504" | "equipment" | "loc";

interface LoanPreset {
  label: string;
  rateRange: [number, number];
  defaultRate: number;
  termRange: [number, number]; // months
  defaultTerm: number;
  description: string;
}

const LOAN_PRESETS: Record<LoanType, LoanPreset> = {
  term: {
    label: "Term Loan",
    rateRange: [7, 25],
    defaultRate: 10,
    termRange: [12, 60],
    defaultTerm: 60,
    description: "Fixed payments over a set period. Best for established businesses with predictable needs.",
  },
  sba7a: {
    label: "SBA 7(a)",
    rateRange: [8.5, 11],
    defaultRate: 9.75,
    termRange: [60, 300],
    defaultTerm: 120,
    description: "Government-backed loans with favorable terms. Up to $5M for various business purposes.",
  },
  sba504: {
    label: "SBA 504",
    rateRange: [5.5, 6.5],
    defaultRate: 6.0,
    termRange: [120, 300],
    defaultTerm: 240,
    description: "Fixed-asset financing for real estate and major equipment. Lower rates, longer terms.",
  },
  equipment: {
    label: "Equipment Loan",
    rateRange: [6, 16],
    defaultRate: 9,
    termRange: [12, 84],
    defaultTerm: 60,
    description: "Secured by equipment being purchased. Term typically matches asset useful life.",
  },
  loc: {
    label: "Line of Credit",
    rateRange: [8, 24],
    defaultRate: 12,
    termRange: [6, 60],
    defaultTerm: 12,
    description: "Revolving credit you draw as needed. Interest only on amount used.",
  },
};

interface ScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function calcLoan(amount: number, annualRate: number, termMonths: number, originationPct: number) {
  const monthlyRate = annualRate / 100 / 12;
  const fee = amount * (originationPct / 100);

  if (amount <= 0 || termMonths <= 0) return null;

  let monthly: number;
  if (annualRate <= 0) {
    monthly = amount / termMonths;
  } else {
    monthly =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const totalPaid = monthly * termMonths;
  const totalInterest = totalPaid - amount;
  const totalCost = totalPaid + fee;

  // APR including fees (Newton's method)
  let apr = annualRate;
  if (fee > 0 && annualRate > 0) {
    const netProceeds = amount - fee;
    for (let iter = 0; iter < 100; iter++) {
      const r = apr / 100 / 12;
      const pv = r === 0 ? monthly * termMonths : (monthly * (1 - Math.pow(1 + r, -termMonths))) / r;
      const dpv = r === 0 ? 0 : (monthly / (r * r)) * (1 - Math.pow(1 + r, -termMonths)) - (monthly * termMonths * Math.pow(1 + r, -termMonths - 1)) / (12 * 100);
      const diff = pv - netProceeds;
      if (Math.abs(diff) < 0.01) break;
      // Numerical derivative
      const r2 = (apr + 0.001) / 100 / 12;
      const pv2 = (monthly * (1 - Math.pow(1 + r2, -termMonths))) / r2;
      const deriv = (pv2 - pv) / 0.001;
      if (Math.abs(deriv) < 1e-10) break;
      apr = apr - diff / deriv;
    }
  }

  const schedule: ScheduleRow[] = [];
  let balance = amount;
  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * monthlyRate;
    const principal = monthly - interest;
    balance = Math.max(0, balance - principal);
    schedule.push({ month: i, payment: monthly, principal, interest, balance });
  }

  return { monthly, totalInterest, totalCost, totalPaid, fee, apr, schedule };
}

export default function Page() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(8.0);
  const [termMonths, setTermMonths] = useState(60);
  const [loanType, setLoanType] = useState<LoanType>("term");
  const [originationFee, setOriginationFee] = useState(1.0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(25000);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-fill when loan type changes
  const handleLoanType = useCallback((type: LoanType) => {
    setLoanType(type);
    const p = LOAN_PRESETS[type];
    setRate(p.defaultRate);
    setTermMonths(p.defaultTerm);
  }, []);

  const result = useMemo(() => calcLoan(amount, rate, termMonths, originationFee), [amount, rate, termMonths, originationFee]);

  // Comparison table across all loan types
  const comparison = useMemo(() => {
    return (Object.keys(LOAN_PRESETS) as LoanType[]).map((type) => {
      const p = LOAN_PRESETS[type];
      const low = calcLoan(amount, p.rateRange[0], p.defaultTerm, originationFee);
      const high = calcLoan(amount, p.rateRange[1], p.defaultTerm, originationFee);
      const mid = calcLoan(amount, p.defaultRate, p.defaultTerm, originationFee);
      return { type, preset: p, low, high, mid };
    });
  }, [amount, originationFee]);

  // Qualification
  const qualResult = useMemo(() => {
    if (!result || monthlyRevenue <= 0) return null;
    const dscr = monthlyRevenue / result.monthly;
    const pctRevenue = (result.monthly / monthlyRevenue) * 100;
    let status: "strong" | "moderate" | "weak";
    let message: string;
    if (dscr >= 1.5) {
      status = "strong";
      message = `Strong position. Your DSCR is ${dscr.toFixed(2)}x (lenders typically want 1.25x+). Payment is ${pctRevenue.toFixed(1)}% of revenue.`;
    } else if (dscr >= 1.15) {
      status = "moderate";
      message = `Moderate position. Your DSCR is ${dscr.toFixed(2)}x. Payment is ${pctRevenue.toFixed(1)}% of revenue. Some lenders may require additional collateral.`;
    } else {
      status = "weak";
      message = `Challenging qualification. Your DSCR is ${dscr.toFixed(2)}x (below 1.15x). Payment would be ${pctRevenue.toFixed(1)}% of revenue. Consider a smaller loan or longer term.`;
    }
    return { dscr, pctRevenue, status, message };
  }, [result, monthlyRevenue]);

  // Draw amortization chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result || result.schedule.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    const pad = { top: 20, right: 20, bottom: 40, left: 60 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    const maxPayment = result.schedule[0].payment;
    const n = result.schedule.length;

    // Build cumulative data
    const principalCum: number[] = [];
    const interestCum: number[] = [];
    let pSum = 0, iSum = 0;
    for (const row of result.schedule) {
      pSum += row.principal;
      iSum += row.interest;
      principalCum.push(pSum);
      interestCum.push(iSum);
    }
    const maxTotal = pSum + iSum;

    // Grid lines
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + cw, y);
      ctx.stroke();
    }

    // Interest area (top)
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + ch);
    for (let i = 0; i < n; i++) {
      const x = pad.left + (cw * i) / (n - 1);
      const y = pad.top + ch - (ch * (principalCum[i] + interestCum[i])) / maxTotal;
      if (i === 0) ctx.moveTo(x, pad.top + ch);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(pad.left + cw, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = "rgba(234, 179, 8, 0.3)";
    ctx.fill();

    // Principal area (bottom)
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + ch);
    for (let i = 0; i < n; i++) {
      const x = pad.left + (cw * i) / (n - 1);
      const y = pad.top + ch - (ch * principalCum[i]) / maxTotal;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(pad.left + cw, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
    ctx.fill();

    // Principal line
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (cw * i) / (n - 1);
      const y = pad.top + ch - (ch * principalCum[i]) / maxTotal;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Total line
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (cw * i) / (n - 1);
      const y = pad.top + ch - (ch * (principalCum[i] + interestCum[i])) / maxTotal;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Axes labels
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";

    // X axis
    const labelCount = Math.min(6, n);
    for (let i = 0; i <= labelCount; i++) {
      const idx = Math.floor((i * (n - 1)) / labelCount);
      const x = pad.left + (cw * idx) / (n - 1);
      const mo = result.schedule[idx].month;
      ctx.fillText(mo >= 12 ? `Yr ${Math.round(mo / 12)}` : `Mo ${mo}`, x, pad.top + ch + 20);
    }

    // Y axis
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const val = maxTotal * (1 - i / 4);
      const y = pad.top + (ch * i) / 4;
      ctx.fillText(fmtK(val), pad.left - 8, y + 4);
    }

    // Legend
    ctx.textAlign = "left";
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(pad.left + 10, pad.top + 6, 12, 4);
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("Principal", pad.left + 28, pad.top + 12);

    ctx.fillStyle = "#eab308";
    ctx.fillRect(pad.left + 100, pad.top + 6, 12, 4);
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("Interest", pad.left + 118, pad.top + 12);
  }, [result]);

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const preset = LOAN_PRESETS[loanType];

  return (
    <ToolLayout
      title="Business Loan Calculator"
      description="Calculate business loan payments, total interest, and compare SBA, term, and line of credit options. See amortization schedules and the true cost of borrowing."
      slug="business-loan-calculator"
      category="Finance"
      keywords={[
        "business loan calculator",
        "small business loan calculator",
        "SBA loan calculator",
        "business loan payment calculator",
        "commercial loan calculator",
        "business financing calculator",
      ]}
      faqs={[
        {
          question: "How much can I borrow for a business loan?",
          answer:
            "Borrowing limits depend on the loan type and your business financials. SBA 7(a) loans go up to $5 million, SBA 504 up to $5.5 million, and conventional term loans vary by lender. Most lenders look at your annual revenue, cash flow, time in business, and credit score. A common rule of thumb is that you can borrow 10-30% of your annual revenue for unsecured loans, or more with collateral.",
        },
        {
          question: "What is an SBA loan?",
          answer:
            "SBA loans are partially guaranteed by the U.S. Small Business Administration, which reduces risk for lenders and allows them to offer lower rates and longer terms. The SBA 7(a) is the most common, covering working capital, equipment, and real estate. The SBA 504 is specifically for fixed assets like commercial real estate and heavy equipment. SBA loans typically require 10-20% down and a credit score of 680+.",
        },
        {
          question: "What credit score do I need for a business loan?",
          answer:
            "Requirements vary by loan type. SBA loans generally require 680+. Conventional bank term loans usually need 700+. Online lenders may approve scores as low as 550-600, but at higher interest rates. Equipment loans may be more flexible since the equipment serves as collateral. A higher score gets you lower rates and better terms.",
        },
        {
          question: "How do business loan interest rates work?",
          answer:
            "Business loan rates can be fixed or variable. Fixed rates stay the same for the loan term. Variable rates are tied to a benchmark like the prime rate (currently around 8.5%) plus a margin. SBA 7(a) rates are typically prime + 2.25% to 2.75%. The rate you get depends on your credit score, time in business, revenue, collateral, and the loan type.",
        },
        {
          question: "What is the difference between SBA 7(a) and SBA 504?",
          answer:
            "SBA 7(a) is a general-purpose loan up to $5M for working capital, equipment, real estate, or refinancing. SBA 504 is specifically for major fixed assets — commercial real estate and large equipment — up to $5.5M, with lower fixed rates and longer terms (10-25 years). SBA 504 loans require working with a Certified Development Company (CDC) and typically have a 10% down payment from the borrower.",
        },
        {
          question: "Should I get a term loan or line of credit?",
          answer:
            "Term loans provide a lump sum with fixed monthly payments — best for one-time investments like equipment, expansion, or real estate. Lines of credit give you flexible access to funds you can draw and repay as needed — best for managing cash flow gaps, seasonal expenses, or unexpected costs. Term loans usually have lower rates but less flexibility. Many businesses benefit from having both.",
        },
      ]}
      relatedTools={[
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "ROI Calculator", href: "/tools/roi-calculator" },
        { name: "Break Even Calculator", href: "/tools/break-even-calculator" },
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
      ]}
      guide={
        <>
          <h2>Types of Business Loans</h2>
          <p>
            Business financing comes in several forms, each suited to different needs. <strong>Term loans</strong> provide
            a lump sum repaid over a fixed schedule and work well for capital investments, expansions, and large purchases.{" "}
            <strong>SBA loans</strong> (7(a) and 504) offer government-backed favorable terms — lower rates and longer
            repayment periods — but involve more paperwork and slower approval. <strong>Equipment loans</strong> use the
            purchased equipment as collateral, often making them easier to qualify for. <strong>Lines of credit</strong>{" "}
            provide revolving access to funds for cash flow management and short-term needs, with interest charged only on
            the amount drawn.
          </p>
          <h2>How to Qualify for a Business Loan</h2>
          <p>
            Lenders evaluate several factors: your personal and business credit scores, annual revenue and profitability,
            time in business (at least 2 years for most bank loans), and available collateral. The most critical metric is
            your <strong>Debt Service Coverage Ratio (DSCR)</strong> — your net operating income divided by your total debt
            payments. Most lenders require a DSCR of at least 1.25x, meaning your income is 25% higher than your debt
            obligations. This calculator estimates your DSCR based on the monthly revenue you provide.
          </p>
          <h2>Understanding the True Cost: APR vs. Interest Rate</h2>
          <p>
            The interest rate alone does not tell the whole story. Origination fees, SBA guarantee fees, closing costs, and
            other charges increase the effective cost. The <strong>Annual Percentage Rate (APR)</strong> includes these fees
            and gives you a more accurate picture for comparison. A loan at 7% with a 3% origination fee can cost more than
            a loan at 8% with no fees, depending on the term. Always compare APR, total cost, and monthly payment together
            to find the best deal for your business.
          </p>
        </>
      }
    >
      {/* Loan Type Selector */}
      <div className="mb-6">
        <label className={labelCls}>Loan Type</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LOAN_PRESETS) as LoanType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleLoanType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                loanType === type
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              {LOAN_PRESETS[type].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">{preset.description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Loan Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              className={inputCls}
              min={0}
              step={5000}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[50000, 100000, 250000, 500000, 1000000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    amount === v
                      ? "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                      : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border border-zinc-700"
                  }`}
                >
                  {fmtK(v)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Annual Interest Rate (%)
              <span className="text-zinc-600 ml-1">
                typical: {preset.rateRange[0]}–{preset.rateRange[1]}%
              </span>
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(+e.target.value)}
              className={inputCls}
              min={0}
              max={50}
              step={0.25}
            />
          </div>

          <div>
            <label className={labelCls}>
              Loan Term (months)
              <span className="text-zinc-600 ml-1">
                typical: {preset.termRange[0]}–{preset.termRange[1]} mo
              </span>
            </label>
            <input
              type="number"
              value={termMonths}
              onChange={(e) => setTermMonths(+e.target.value)}
              className={inputCls}
              min={1}
              max={360}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[12, 24, 36, 60, 84, 120, 240].filter(m => m >= preset.termRange[0] && m <= preset.termRange[1]).map((m) => (
                <button
                  key={m}
                  onClick={() => setTermMonths(m)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    termMonths === m
                      ? "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                      : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border border-zinc-700"
                  }`}
                >
                  {m >= 12 ? `${m / 12}yr` : `${m}mo`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Origination Fee (%)</label>
            <input
              type="number"
              value={originationFee}
              onChange={(e) => setOriginationFee(+e.target.value)}
              className={inputCls}
              min={0}
              max={10}
              step={0.25}
            />
          </div>

          <div>
            <label className={labelCls}>Monthly Revenue ($) — for qualification estimate</label>
            <input
              type="number"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(+e.target.value)}
              className={inputCls}
              min={0}
              step={1000}
            />
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Hero: Monthly Payment */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <p className="text-sm text-zinc-400 mb-1">Monthly Payment</p>
              <p className="text-5xl font-bold text-blue-400 tracking-tight">{fmtC(result.monthly)}</p>
              <p className="text-xs text-zinc-500 mt-2">
                {preset.label} &middot; {termMonths} months &middot; {rate}% APR
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Interest</p>
                <p className="text-sm font-semibold text-yellow-400">{fmtC(result.totalInterest)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Cost</p>
                <p className="text-sm font-semibold text-zinc-100">{fmtC(result.totalCost)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Origination Fee</p>
                <p className="text-sm font-semibold text-zinc-100">{fmtC(result.fee)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Effective APR</p>
                <p className="text-sm font-semibold text-zinc-100">{result.apr.toFixed(2)}%</p>
              </div>
            </div>

            {/* Payment Breakdown Bar */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Payment Breakdown</p>
              <div className="flex rounded-full overflow-hidden h-5">
                <div
                  className="bg-blue-500 flex items-center justify-center text-[10px] font-medium text-white"
                  style={{ width: `${(amount / result.totalCost) * 100}%` }}
                >
                  {((amount / result.totalCost) * 100).toFixed(0)}%
                </div>
                <div
                  className="bg-yellow-500 flex items-center justify-center text-[10px] font-medium text-zinc-900"
                  style={{ width: `${(result.totalInterest / result.totalCost) * 100}%` }}
                >
                  {((result.totalInterest / result.totalCost) * 100).toFixed(0)}%
                </div>
                {result.fee > 0 && (
                  <div
                    className="bg-orange-500 flex items-center justify-center text-[10px] font-medium text-white"
                    style={{ width: `${(result.fee / result.totalCost) * 100}%` }}
                  />
                )}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Principal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Interest
                </span>
                {result.fee > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Fees
                  </span>
                )}
              </div>
            </div>

            {/* Qualification Indicator */}
            {qualResult && (
              <div
                className={`border rounded-lg p-3 ${
                  qualResult.status === "strong"
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : qualResult.status === "moderate"
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <p className="text-xs font-medium mb-1">
                  <span
                    className={
                      qualResult.status === "strong"
                        ? "text-emerald-400"
                        : qualResult.status === "moderate"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    {qualResult.status === "strong"
                      ? "Strong Qualification"
                      : qualResult.status === "moderate"
                      ? "Moderate Qualification"
                      : "Challenging Qualification"}
                  </span>
                </p>
                <p className="text-xs text-zinc-400">{qualResult.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amortization Chart */}
      {result && result.schedule.length > 1 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Cumulative Principal vs Interest</h3>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <canvas ref={canvasRef} className="w-full" style={{ height: 260 }} />
          </div>
        </div>
      )}

      {/* Loan Comparison Table */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">
          Loan Type Comparison — {fmtK(amount)} Loan
        </h3>
        <div className="overflow-x-auto border border-zinc-700 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800">
              <tr className="text-zinc-400 text-left text-xs">
                <th className="px-4 py-3">Loan Type</th>
                <th className="px-4 py-3">Rate Range</th>
                <th className="px-4 py-3">Typical Term</th>
                <th className="px-4 py-3">Est. Payment</th>
                <th className="px-4 py-3">Total Interest</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr
                  key={row.type}
                  className={`border-t border-zinc-800 ${
                    row.type === loanType ? "bg-blue-600/10" : "hover:bg-zinc-800/50"
                  }`}
                >
                  <td className="px-4 py-2.5 text-zinc-200 font-medium">
                    {row.preset.label}
                    {row.type === loanType && (
                      <span className="ml-2 text-[10px] bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded">
                        selected
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">
                    {row.preset.rateRange[0]}–{row.preset.rateRange[1]}%
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">
                    {row.preset.defaultTerm >= 12
                      ? `${(row.preset.defaultTerm / 12).toFixed(0)} yr`
                      : `${row.preset.defaultTerm} mo`}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300">
                    {row.low && row.high
                      ? `${fmtC(row.high.monthly)} – ${fmtC(row.low.monthly)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">
                    {row.mid ? fmtC(row.mid.totalInterest) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Callout */}
      {result && (
        <div className="mt-6 bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-blue-300 font-medium mb-1">Insight</p>
          <p className="text-sm text-zinc-400">
            {result.totalInterest > amount * 0.5
              ? `Over the life of this loan, you'll pay ${fmtC(result.totalInterest)} in interest — that's ${((result.totalInterest / amount) * 100).toFixed(0)}% of your loan amount. Consider a shorter term or larger payments to significantly reduce interest costs.`
              : result.totalInterest > amount * 0.2
              ? `Your total interest of ${fmtC(result.totalInterest)} represents ${((result.totalInterest / amount) * 100).toFixed(0)}% of the loan. ${loanType === "loc" ? "Remember that with a line of credit, you only pay interest on the amount you actually draw." : "Making occasional extra payments can reduce both the term and total interest."}`
              : `At ${((result.totalInterest / amount) * 100).toFixed(0)}% of the loan amount, your total interest of ${fmtC(result.totalInterest)} is quite reasonable. ${loanType.startsWith("sba") ? "SBA loans offer some of the best rates available to small businesses." : "You're getting competitive terms for this loan type."}`}
          </p>
        </div>
      )}

      {/* Amortization Table */}
      {result && result.schedule.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Amortization Schedule</h3>
          <div className="max-h-[400px] overflow-y-auto border border-zinc-700 rounded-xl">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-800">
                <tr className="text-zinc-400 text-left text-xs">
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Principal</th>
                  <th className="px-3 py-2">Interest</th>
                  <th className="px-3 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(showFullSchedule ? result.schedule : result.schedule.slice(0, 12)).map((row) => (
                  <tr key={row.month} className="border-t border-zinc-800 text-zinc-300">
                    <td className="px-3 py-1.5">{row.month}</td>
                    <td className="px-3 py-1.5">{fmtC(row.payment)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.principal)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.interest)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.schedule.length > 12 && (
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showFullSchedule
                ? "Show first 12 months"
                : `Show all ${result.schedule.length} months`}
            </button>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
