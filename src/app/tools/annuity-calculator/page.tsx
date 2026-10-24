"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fmtC2(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n: number) {
  return n.toFixed(2) + "%";
}

type Mode = "accumulation" | "payout";
type PayoutFreq = "monthly" | "quarterly" | "annually";

export default function Page() {
  const [mode, setMode] = useState<Mode>("accumulation");

  // Accumulation inputs
  const [initialInvestment, setInitialInvestment] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [accRate, setAccRate] = useState(6);
  const [accYears, setAccYears] = useState(20);

  // Payout inputs
  const [payoutBalance, setPayoutBalance] = useState(500000);
  const [payoutRate, setPayoutRate] = useState(5);
  const [payoutYears, setPayoutYears] = useState(25);
  const [payoutFreq, setPayoutFreq] = useState<PayoutFreq>("monthly");

  // Tax comparison
  const [taxRate, setTaxRate] = useState(25);

  const accResult = useMemo(() => {
    const r = accRate / 100 / 12;
    const n = accYears * 12;
    const yearly: { year: number; balance: number; contributions: number; interest: number; fixedBal: number; variableBal: number }[] = [];

    let balance = initialInvestment;
    let totalContributions = initialInvestment;
    let totalInterest = 0;

    // Fixed annuity: guaranteed rate
    let fixedBal = initialInvestment;
    const fixedR = accRate / 100 / 12;

    // Variable annuity: fluctuates around rate with volatility
    let variableBal = initialInvestment;
    const varAvgR = (accRate + 1.5) / 100 / 12; // slightly higher avg for variable
    // Precompute a deterministic "variable" pattern using sine wave to simulate fluctuation
    const varVolatility = 0.03; // 3% annual volatility spread

    for (let y = 1; y <= accYears; y++) {
      for (let m = 0; m < 12; m++) {
        const monthIndex = (y - 1) * 12 + m;
        const interest = balance * r;
        balance += interest + monthlyContribution;
        totalInterest += interest;
        totalContributions += monthlyContribution;

        // Fixed
        const fInt = fixedBal * fixedR;
        fixedBal += fInt + monthlyContribution;

        // Variable: sine-wave modulated return
        const varR = varAvgR + (varVolatility / 12) * Math.sin(monthIndex * 0.5);
        const vInt = variableBal * varR;
        variableBal += vInt + monthlyContribution;
      }
      yearly.push({
        year: y,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(totalInterest),
        fixedBal: Math.round(fixedBal),
        variableBal: Math.round(variableBal),
      });
    }

    // Tax-deferred advantage: compare to taxable account
    let taxableBal = initialInvestment;
    const afterTaxR = (accRate / 100) * (1 - taxRate / 100) / 12;
    for (let m = 0; m < n; m++) {
      taxableBal += taxableBal * afterTaxR + monthlyContribution;
    }
    const taxDeferredAdvantage = balance - taxableBal;

    return {
      futureValue: balance,
      totalContributions,
      totalInterest,
      fixedFV: fixedBal,
      variableFV: variableBal,
      taxableFV: taxableBal,
      taxDeferredAdvantage,
      yearly,
    };
  }, [initialInvestment, monthlyContribution, accRate, accYears, taxRate]);

  const payResult = useMemo(() => {
    const periodsPerYear = payoutFreq === "monthly" ? 12 : payoutFreq === "quarterly" ? 4 : 1;
    const totalPeriods = payoutYears * periodsPerYear;
    const rPeriod = payoutRate / 100 / periodsPerYear;

    // Annuity payout formula: PMT = PV * r / (1 - (1+r)^-n)
    let payoutAmount: number;
    if (rPeriod === 0) {
      payoutAmount = payoutBalance / totalPeriods;
    } else {
      payoutAmount = payoutBalance * rPeriod / (1 - Math.pow(1 + rPeriod, -totalPeriods));
    }

    const totalPayout = payoutAmount * totalPeriods;
    const totalPayoutInterest = totalPayout - payoutBalance;

    // Year-by-year depletion schedule
    const yearly: { year: number; startBal: number; payouts: number; interest: number; endBal: number }[] = [];
    let bal = payoutBalance;
    for (let y = 1; y <= payoutYears; y++) {
      const startBal = bal;
      let yearPayouts = 0;
      let yearInterest = 0;
      for (let p = 0; p < periodsPerYear; p++) {
        const interest = bal * rPeriod;
        yearInterest += interest;
        bal += interest - payoutAmount;
        yearPayouts += payoutAmount;
      }
      yearly.push({
        year: y,
        startBal: Math.round(startBal),
        payouts: Math.round(yearPayouts),
        interest: Math.round(yearInterest),
        endBal: Math.max(0, Math.round(bal)),
      });
    }

    return {
      payoutAmount,
      totalPayout,
      totalPayoutInterest,
      periodsPerYear,
      yearly,
    };
  }, [payoutBalance, payoutRate, payoutYears, payoutFreq]);

  // SVG chart
  const chartData = useMemo(() => {
    if (mode === "accumulation") {
      return accResult.yearly.map((r) => ({
        label: `Yr ${r.year}`,
        value: r.balance,
        contributions: r.contributions,
        interest: r.interest,
      }));
    } else {
      return payResult.yearly.map((r) => ({
        label: `Yr ${r.year}`,
        value: Math.max(0, r.endBal),
        contributions: 0,
        interest: 0,
      }));
    }
  }, [mode, accResult, payResult]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const tabCls = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
      active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
    }`;

  const freqLabel = payoutFreq === "monthly" ? "Monthly" : payoutFreq === "quarterly" ? "Quarterly" : "Annual";

  // SVG dimensions
  const svgW = 700;
  const svgH = 280;
  const pad = { top: 20, right: 20, bottom: 30, left: 70 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const maxVal = Math.max(...chartData.map((d) => d.value), 1);
  const points = chartData.map((d, i) => {
    const x = pad.left + (chartData.length === 1 ? plotW / 2 : (i / (chartData.length - 1)) * plotW);
    const y = pad.top + plotH - (d.value / maxVal) * plotH;
    return { x, y, ...d };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = linePath + ` L${points[points.length - 1]?.x ?? pad.left},${pad.top + plotH} L${points[0]?.x ?? pad.left},${pad.top + plotH} Z`;

  // Y-axis labels
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = (maxVal / yTicks) * i;
    return { val, y: pad.top + plotH - (val / maxVal) * plotH };
  });

  return (
    <ToolLayout
      title="Annuity Calculator"
      description="Calculate annuity growth during accumulation or income payouts during distribution. Compare fixed vs variable annuities and see the tax-deferred growth advantage."
      slug="annuity-calculator"
      category="Finance"
      keywords={[
        "annuity calculator",
        "annuity payout calculator",
        "fixed annuity calculator",
        "variable annuity calculator",
        "annuity income calculator",
        "retirement annuity calculator",
        "tax-deferred annuity calculator",
      ]}
      faqs={[
        {
          question: "What is an annuity and how does it work?",
          answer:
            "An annuity is a financial contract between you and an insurance company. During the accumulation phase, you invest money that grows tax-deferred. During the payout (annuitization) phase, the insurer pays you a regular income stream. Annuities are commonly used for retirement planning to guarantee income you cannot outlive.",
        },
        {
          question: "What is the difference between a fixed and variable annuity?",
          answer:
            "A fixed annuity offers a guaranteed interest rate and predictable growth, making it lower risk. A variable annuity invests in sub-accounts similar to mutual funds, so returns fluctuate with the market. Variable annuities have higher growth potential but also more risk. This calculator models both so you can compare projected outcomes.",
        },
        {
          question: "How does tax-deferred growth benefit an annuity?",
          answer:
            "In a tax-deferred annuity, you don't pay taxes on investment gains each year. This lets your entire balance compound without tax drag. Over decades, this advantage can be substantial. For example, at a 6% return and 25% tax rate over 20 years, tax deferral can result in tens of thousands of dollars more in your account compared to a taxable investment.",
        },
        {
          question: "How is my annuity payout amount calculated?",
          answer:
            "Payout amounts are calculated using the present value of an annuity formula: PMT = PV x r / (1 - (1 + r)^-n), where PV is your account balance, r is the interest rate per period, and n is the total number of payment periods. This ensures your balance is fully distributed over the chosen payout period while continuing to earn interest.",
        },
        {
          question: "When should I consider buying an annuity?",
          answer:
            "Annuities are worth considering if you've maxed out other tax-advantaged accounts (401k, IRA), want guaranteed retirement income, or are concerned about outliving your savings. They work best as part of a diversified retirement strategy. Deferred annuities are most effective when purchased 10-30 years before retirement to maximize tax-deferred compounding.",
        },
        {
          question: "What fees are typically associated with annuities?",
          answer:
            "Common annuity fees include mortality and expense charges (1-1.5%), administrative fees, fund management fees for variable annuities (0.5-2%), and surrender charges for early withdrawal (typically 5-10% declining over 5-10 years). This calculator shows gross returns before fees. Subtract roughly 1-2.5% from the interest rate to estimate after-fee performance for variable annuities.",
        },
      ]}
      relatedTools={[
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
      ]}
      guide={
        <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
          <h2 className="text-xl font-semibold text-zinc-100">How to Use the Annuity Calculator</h2>
          <p>
            This calculator has two modes. <strong className="text-zinc-200">Accumulation</strong> mode
            shows how your annuity grows over time with regular contributions and compound interest.{" "}
            <strong className="text-zinc-200">Payout</strong> mode calculates how much income you will
            receive from an existing annuity balance over a chosen distribution period.
          </p>
          <h3 className="text-lg font-semibold text-zinc-200">Accumulation Phase</h3>
          <p>
            Enter your initial investment, monthly contribution, expected annual interest rate, and the
            number of years until you begin withdrawals. The calculator projects your future value, total
            contributions, total interest earned, and compares fixed vs. variable annuity outcomes. It
            also shows the tax-deferred growth advantage versus a taxable account.
          </p>
          <h3 className="text-lg font-semibold text-zinc-200">Payout Phase</h3>
          <p>
            Enter your current annuity balance, the interest rate during distribution, payout period in
            years, and how often you want to receive payments (monthly, quarterly, or annually). The
            calculator determines your periodic payout amount and shows a year-by-year depletion
            schedule.
          </p>
        </div>
      }
    >
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button className={tabCls(mode === "accumulation")} onClick={() => setMode("accumulation")}>
          Accumulation Phase
        </button>
        <button className={tabCls(mode === "payout")} onClick={() => setMode("payout")}>
          Payout Phase
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {mode === "accumulation" ? (
            <>
              <div>
                <label className={labelCls}>Initial Investment ($)</label>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(+e.target.value)}
                  className={inputCls}
                  min={0}
                  step={1000}
                />
              </div>
              <div>
                <label className={labelCls}>Monthly Contribution ($)</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(+e.target.value)}
                  className={inputCls}
                  min={0}
                  step={50}
                />
              </div>
              <div>
                <label className={labelCls}>Annual Interest Rate (%)</label>
                <input
                  type="number"
                  value={accRate}
                  onChange={(e) => setAccRate(+e.target.value)}
                  className={inputCls}
                  min={0}
                  max={20}
                  step={0.25}
                />
              </div>
              <div>
                <label className={labelCls}>Years to Grow</label>
                <input
                  type="number"
                  value={accYears}
                  onChange={(e) => setAccYears(+e.target.value)}
                  className={inputCls}
                  min={1}
                  max={50}
                />
              </div>
              <div>
                <label className={labelCls}>Your Marginal Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(+e.target.value)}
                  className={inputCls}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>Account Balance ($)</label>
                <input
                  type="number"
                  value={payoutBalance}
                  onChange={(e) => setPayoutBalance(+e.target.value)}
                  className={inputCls}
                  min={0}
                  step={1000}
                />
              </div>
              <div>
                <label className={labelCls}>Annual Interest Rate (%)</label>
                <input
                  type="number"
                  value={payoutRate}
                  onChange={(e) => setPayoutRate(+e.target.value)}
                  className={inputCls}
                  min={0}
                  max={15}
                  step={0.25}
                />
              </div>
              <div>
                <label className={labelCls}>Payout Period (years)</label>
                <input
                  type="number"
                  value={payoutYears}
                  onChange={(e) => setPayoutYears(+e.target.value)}
                  className={inputCls}
                  min={1}
                  max={50}
                />
              </div>
              <div>
                <label className={labelCls}>Payout Frequency</label>
                <select
                  value={payoutFreq}
                  onChange={(e) => setPayoutFreq(e.target.value as PayoutFreq)}
                  className={inputCls}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {mode === "accumulation" ? (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Future Value After {accYears} Years</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(accResult.futureValue)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Contributions</p>
                  <p className="text-lg font-semibold text-zinc-100">{fmtC(accResult.totalContributions)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Interest Earned</p>
                  <p className="text-lg font-semibold text-green-400">{fmtC(accResult.totalInterest)}</p>
                </div>
              </div>

              {/* Fixed vs Variable comparison */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <p className="text-sm font-medium text-zinc-300 mb-3">Fixed vs Variable Annuity</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Fixed Annuity</p>
                    <p className="text-lg font-semibold text-blue-400">{fmtC(accResult.fixedFV)}</p>
                    <p className="text-xs text-zinc-600">Guaranteed {fmtPct(accRate)} rate</p>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Variable Annuity</p>
                    <p className="text-lg font-semibold text-purple-400">{fmtC(accResult.variableFV)}</p>
                    <p className="text-xs text-zinc-600">Avg ~{fmtPct(accRate + 1.5)} with volatility</p>
                  </div>
                </div>
              </div>

              {/* Tax-deferred advantage */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">Tax-Deferred Growth Advantage</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">Tax-Deferred (Annuity)</p>
                    <p className="text-lg font-semibold text-green-400">{fmtC(accResult.futureValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Taxable Account</p>
                    <p className="text-lg font-semibold text-zinc-400">{fmtC(accResult.taxableFV)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <p className="text-xs text-zinc-500">Tax-Deferral Benefit</p>
                  <p className={`text-lg font-bold ${accResult.taxDeferredAdvantage >= 0 ? "text-green-400" : "text-red-400"}`}>
                    +{fmtC(accResult.taxDeferredAdvantage)}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    At {taxRate}% marginal tax rate, deferring taxes on gains saves you{" "}
                    {fmtC(accResult.taxDeferredAdvantage)} over {accYears} years of compounding.
                  </p>
                </div>
              </div>

              {/* Composition bar */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-2">Savings Composition</p>
                <div className="flex rounded-full overflow-hidden h-4">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(accResult.totalContributions / accResult.futureValue) * 100}%` }}
                  />
                  <div
                    className="bg-green-500"
                    style={{ width: `${(accResult.totalInterest / accResult.futureValue) * 100}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Contributions ({((accResult.totalContributions / accResult.futureValue) * 100).toFixed(1)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Interest ({((accResult.totalInterest / accResult.futureValue) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">{freqLabel} Payout Amount</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC2(payResult.payoutAmount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Payouts</p>
                  <p className="text-lg font-semibold text-zinc-100">{fmtC(payResult.totalPayout)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Interest Earned During Payout</p>
                  <p className="text-lg font-semibold text-green-400">{fmtC(payResult.totalPayoutInterest)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Starting Balance</p>
                  <p className="text-lg font-semibold text-zinc-100">{fmtC(payoutBalance)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Payout Period</p>
                  <p className="text-lg font-semibold text-zinc-100">
                    {payoutYears} yrs / {freqLabel.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Composition bar */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-2">Payout Composition</p>
                <div className="flex rounded-full overflow-hidden h-4">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(payoutBalance / payResult.totalPayout) * 100}%` }}
                  />
                  <div
                    className="bg-green-500"
                    style={{ width: `${(payResult.totalPayoutInterest / payResult.totalPayout) * 100}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Principal ({((payoutBalance / payResult.totalPayout) * 100).toFixed(1)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Interest ({((payResult.totalPayoutInterest / payResult.totalPayout) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      {chartData.length > 1 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            {mode === "accumulation" ? "Balance Growth Over Time" : "Balance Depletion Over Time"}
          </h3>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 overflow-x-auto">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ minWidth: 400 }}>
              {/* Grid lines and Y labels */}
              {yLabels.map((t, i) => (
                <g key={i}>
                  <line x1={pad.left} y1={t.y} x2={svgW - pad.right} y2={t.y} stroke="#3f3f46" strokeWidth={0.5} />
                  <text x={pad.left - 8} y={t.y + 4} textAnchor="end" fill="#71717a" fontSize={10}>
                    {t.val >= 1_000_000
                      ? `$${(t.val / 1_000_000).toFixed(1)}M`
                      : t.val >= 1_000
                      ? `$${(t.val / 1_000).toFixed(0)}K`
                      : `$${t.val.toFixed(0)}`}
                  </text>
                </g>
              ))}
              {/* X labels */}
              {points.filter((_, i) => {
                const step = Math.max(1, Math.floor(points.length / 10));
                return i % step === 0 || i === points.length - 1;
              }).map((p, i) => (
                <text key={i} x={p.x} y={svgH - 5} textAnchor="middle" fill="#71717a" fontSize={10}>
                  {p.label}
                </text>
              ))}
              {/* Area */}
              <path d={areaPath} fill="url(#annuityGrad)" opacity={0.3} />
              {/* Line */}
              <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinejoin="round" />
              {/* Dots */}
              {points.filter((_, i) => {
                const step = Math.max(1, Math.floor(points.length / 15));
                return i % step === 0 || i === points.length - 1;
              }).map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} fill="#3b82f6" stroke="#1e3a5f" strokeWidth={1.5} />
              ))}
              <defs>
                <linearGradient id="annuityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}

      {/* Year-by-year schedule */}
      {mode === "accumulation" && accResult.yearly.length > 0 && (
        <details className="mt-8">
          <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
            Year-by-Year Accumulation Schedule ({accYears} years)
          </summary>
          <div className="mt-4 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-800">
                <tr className="text-zinc-400 text-left">
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Balance</th>
                  <th className="px-3 py-2">Contributions</th>
                  <th className="px-3 py-2">Interest</th>
                  <th className="px-3 py-2">Fixed</th>
                  <th className="px-3 py-2">Variable</th>
                </tr>
              </thead>
              <tbody>
                {accResult.yearly.map((row) => (
                  <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                    <td className="px-3 py-1.5">{row.year}</td>
                    <td className="px-3 py-1.5">{fmtC(row.balance)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.contributions)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.interest)}</td>
                    <td className="px-3 py-1.5 text-blue-400">{fmtC(row.fixedBal)}</td>
                    <td className="px-3 py-1.5 text-purple-400">{fmtC(row.variableBal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {mode === "payout" && payResult.yearly.length > 0 && (
        <details className="mt-8">
          <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
            Year-by-Year Payout Schedule ({payoutYears} years)
          </summary>
          <div className="mt-4 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-800">
                <tr className="text-zinc-400 text-left">
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Start Balance</th>
                  <th className="px-3 py-2">Payouts</th>
                  <th className="px-3 py-2">Interest</th>
                  <th className="px-3 py-2">End Balance</th>
                </tr>
              </thead>
              <tbody>
                {payResult.yearly.map((row) => (
                  <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                    <td className="px-3 py-1.5">{row.year}</td>
                    <td className="px-3 py-1.5">{fmtC(row.startBal)}</td>
                    <td className="px-3 py-1.5 text-red-400">-{fmtC(row.payouts)}</td>
                    <td className="px-3 py-1.5 text-green-400">+{fmtC(row.interest)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.endBal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </ToolLayout>
  );
}
