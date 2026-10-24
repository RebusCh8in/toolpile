"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtP(n: number) {
  return n.toFixed(2) + "%";
}

type CompoundFreq = "daily" | "monthly" | "quarterly" | "annually";
type TermUnit = "months" | "years";

interface CDOption {
  id: number;
  label: string;
  deposit: number;
  apy: number;
  termMonths: number;
}

const COMPOUND_PER_YEAR: Record<CompoundFreq, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

function calcCD(deposit: number, apy: number, termMonths: number, compounding: CompoundFreq) {
  const n = COMPOUND_PER_YEAR[compounding];
  const years = termMonths / 12;
  // APY -> APR conversion: APR = n * ((1 + APY)^(1/n) - 1)
  const apr = n * (Math.pow(1 + apy / 100, 1 / n) - 1) * 100;
  const finalBalance = deposit * Math.pow(1 + apr / 100 / n, n * years);
  const totalInterest = finalBalance - deposit;
  return { finalBalance, totalInterest, apr, apy };
}

function calcGrowthData(deposit: number, apy: number, termMonths: number, compounding: CompoundFreq) {
  const n = COMPOUND_PER_YEAR[compounding];
  const apr = n * (Math.pow(1 + apy / 100, 1 / n) - 1) * 100;
  const ratePerPeriod = apr / 100 / n;
  const totalPeriods = Math.round(n * (termMonths / 12));
  const points: { month: number; balance: number }[] = [{ month: 0, balance: deposit }];

  let balance = deposit;
  for (let p = 1; p <= totalPeriods; p++) {
    balance = balance * (1 + ratePerPeriod);
    const monthEquiv = Math.round((p / n) * 12);
    if (monthEquiv > (points[points.length - 1]?.month ?? -1)) {
      points.push({ month: monthEquiv, balance });
    }
  }
  // Ensure the final month is included
  if (points[points.length - 1].month < termMonths) {
    points.push({ month: termMonths, balance });
  }
  return points;
}

export default function Page() {
  // Main CD inputs
  const [deposit, setDeposit] = useState(10000);
  const [apy, setApy] = useState(5.0);
  const [termValue, setTermValue] = useState(12);
  const [termUnit, setTermUnit] = useState<TermUnit>("months");
  const [compounding, setCompounding] = useState<CompoundFreq>("daily");

  // Tab state
  const [activeTab, setActiveTab] = useState<"calculator" | "ladder" | "compare" | "penalty">("calculator");

  // Ladder settings
  const [ladderDeposit, setLadderDeposit] = useState(25000);
  const [ladderRates, setLadderRates] = useState([4.5, 4.75, 5.0, 5.1, 5.25]);

  // Comparison table
  const [compareOptions, setCompareOptions] = useState<CDOption[]>([
    { id: 1, label: "Bank A", deposit: 10000, apy: 5.0, termMonths: 12 },
    { id: 2, label: "Bank B", deposit: 10000, apy: 4.75, termMonths: 24 },
    { id: 3, label: "Bank C", deposit: 10000, apy: 5.25, termMonths: 6 },
  ]);
  const [nextId, setNextId] = useState(4);

  // Penalty settings
  const [penaltyDeposit, setPenaltyDeposit] = useState(10000);
  const [penaltyApy, setPenaltyApy] = useState(5.0);
  const [penaltyTermMonths, setPenaltyTermMonths] = useState(12);
  const [withdrawMonth, setWithdrawMonth] = useState(6);

  const termMonths = termUnit === "years" ? termValue * 12 : termValue;

  // Main calculator results
  const result = useMemo(() => {
    return calcCD(deposit, apy, termMonths, compounding);
  }, [deposit, apy, termMonths, compounding]);

  // Growth data for chart
  const growthData = useMemo(() => {
    return calcGrowthData(deposit, apy, termMonths, compounding);
  }, [deposit, apy, termMonths, compounding]);

  // Ladder results
  const ladderResults = useMemo(() => {
    const terms = [12, 24, 36, 48, 60]; // 1-5 year CDs
    const perCD = ladderDeposit / 5;
    let totalInterest = 0;
    const cds = terms.map((t, i) => {
      const r = ladderRates[i];
      const res = calcCD(perCD, r, t, "daily");
      totalInterest += res.totalInterest;
      return { term: t, rate: r, deposit: perCD, ...res };
    });
    const totalFinal = cds.reduce((sum, cd) => sum + cd.finalBalance, 0);
    // Compare to single CD: put all into the longest term
    const singleCD = calcCD(ladderDeposit, ladderRates[4], 60, "daily");
    return { cds, totalInterest, totalFinal, perCD, singleCD };
  }, [ladderDeposit, ladderRates]);

  // Comparison results
  const compareResults = useMemo(() => {
    return compareOptions.map(opt => ({
      ...opt,
      ...calcCD(opt.deposit, opt.apy, opt.termMonths, "daily"),
    }));
  }, [compareOptions]);

  // Penalty results
  const penaltyResults = useMemo(() => {
    const penalties = [
      { label: "3 months interest", months: 3 },
      { label: "6 months interest", months: 6 },
      { label: "9 months interest", months: 9 },
      { label: "12 months interest", months: 12 },
    ];
    const earned = calcCD(penaltyDeposit, penaltyApy, withdrawMonth, "daily");
    const full = calcCD(penaltyDeposit, penaltyApy, penaltyTermMonths, "daily");
    const dailyRate = penaltyApy / 100 / 365;

    return penalties.map(p => {
      const penaltyAmount = penaltyDeposit * dailyRate * (p.months * 30.44);
      const netInterest = Math.max(earned.totalInterest - penaltyAmount, -penaltyDeposit);
      const netBalance = penaltyDeposit + netInterest;
      return {
        ...p,
        penaltyAmount,
        interestEarned: earned.totalInterest,
        netInterest,
        netBalance,
        lostVsFull: full.totalInterest - netInterest,
      };
    });
  }, [penaltyDeposit, penaltyApy, penaltyTermMonths, withdrawMonth]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const selectCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none";

  const tabCls = (tab: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`;

  // Chart rendering
  const chartHeight = 200;
  const chartWidth = 600;
  const maxBal = Math.max(...growthData.map(d => d.balance));
  const minBal = deposit;
  const range = maxBal - minBal || 1;

  return (
    <ToolLayout
      title="CD Calculator"
      description="Calculate Certificate of Deposit earnings, compare CD rates from multiple banks, plan a CD ladder strategy, and estimate early withdrawal penalties. Free and instant."
      slug="cd-calculator"
      category="Finance"
      keywords={[
        "cd calculator",
        "certificate of deposit calculator",
        "cd interest calculator",
        "cd rate calculator",
        "cd ladder calculator",
        "cd early withdrawal penalty calculator",
        "best cd rates calculator",
        "cd maturity calculator",
        "cd earnings calculator",
        "cd comparison tool",
      ]}
      faqs={[
        {
          question: "What is a Certificate of Deposit (CD) and how does it work?",
          answer: "A Certificate of Deposit is a savings product offered by banks and credit unions where you deposit money for a fixed period (the term) at a guaranteed interest rate. In exchange for locking up your money, you typically earn a higher interest rate than a regular savings account. When the CD matures (reaches the end of its term), you receive your original deposit plus all accrued interest. Terms range from as short as 1 month to as long as 10 years.",
        },
        {
          question: "What is the difference between APY and APR for CDs?",
          answer: "APY (Annual Percentage Yield) reflects the total amount of interest you earn in a year including the effect of compounding. APR (Annual Percentage Rate) is the simple interest rate without compounding factored in. Because CDs compound interest, the APY is always slightly higher than the APR. Banks are required to advertise APY, making it easier to compare offers. For example, a 5.00% APR compounded daily yields an APY of approximately 5.13%.",
        },
        {
          question: "What is a CD ladder strategy and why should I use one?",
          answer: "A CD ladder involves splitting your total investment across multiple CDs with staggered maturity dates (e.g., 1-year, 2-year, 3-year, 4-year, and 5-year CDs). As each shorter-term CD matures, you can reinvest it at the longest term to capture higher rates, or access the cash if needed. This strategy balances liquidity with higher long-term rates, reducing the risk of locking all your money away at a single rate while still earning more than a savings account.",
        },
        {
          question: "What are typical early withdrawal penalties for CDs?",
          answer: "Early withdrawal penalties vary by bank and CD term. Common penalties include 3 months of interest for CDs with terms under 1 year, 6 months of interest for 1-year CDs, and 12 months or more of interest for longer-term CDs. Some banks charge a flat fee instead. In extreme cases, the penalty can eat into your principal if you withdraw very early. Always check your bank's specific penalty terms before opening a CD.",
        },
        {
          question: "How does compounding frequency affect my CD earnings?",
          answer: "Compounding frequency determines how often earned interest is added to your balance to earn additional interest. Daily compounding yields the most because interest is calculated and added every day. Monthly, quarterly, and annual compounding produce progressively less total interest. However, the differences are relatively small. For example, on a $10,000 CD at 5% APY for 1 year, the difference between daily and annual compounding is typically only a few dollars.",
        },
        {
          question: "Are CDs safe? Is my money insured?",
          answer: "CDs from FDIC-insured banks are insured up to $250,000 per depositor, per bank, per ownership category. Credit union CDs (called share certificates) are similarly insured by the NCUA. This makes CDs one of the safest investment options available. The trade-off is that CD rates are generally lower than potential stock market returns, but your principal is guaranteed and the interest rate is locked in for the term.",
        },
        {
          question: "When is the best time to open a CD?",
          answer: "The best time to open a CD is when interest rates are high relative to historical norms, or when you expect rates to decline. Locking in a high rate before the Federal Reserve cuts rates means you benefit from that rate for the entire CD term. If rates are expected to rise, shorter-term CDs or a CD ladder strategy lets you reinvest at higher rates as they become available.",
        },
      ]}
      relatedTools={[
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "APR Calculator", href: "/tools/apr-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
      ]}
      guide={
        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xl font-semibold text-zinc-100">How to Use the CD Calculator</h2>
          <p>
            Enter your initial deposit amount, the APY offered by your bank, the CD term length, and how often interest compounds.
            The calculator instantly shows your total interest earned, final balance at maturity, and the equivalent APR.
          </p>
          <h3 className="text-lg font-semibold text-zinc-100">CD Ladder Strategy</h3>
          <p>
            Use the Ladder tab to see how dividing your deposit across five CDs with staggered terms of 1 through 5 years
            can balance liquidity and returns. Adjust the rates for each rung to match current offerings from your bank.
          </p>
          <h3 className="text-lg font-semibold text-zinc-100">Comparing CD Offers</h3>
          <p>
            The Compare tab lets you enter CD offers from different banks side by side. Add as many options as you need
            and instantly see which one earns the most interest for your deposit.
          </p>
          <h3 className="text-lg font-semibold text-zinc-100">Early Withdrawal Penalties</h3>
          <p>
            Before opening a CD, understand the cost of withdrawing early. The Penalty tab estimates how much you would
            forfeit under common penalty structures (3, 6, 9, or 12 months of interest) based on when you withdraw.
          </p>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveTab("calculator")} className={tabCls("calculator")}>Calculator</button>
        <button onClick={() => setActiveTab("ladder")} className={tabCls("ladder")}>CD Ladder</button>
        <button onClick={() => setActiveTab("compare")} className={tabCls("compare")}>Compare CDs</button>
        <button onClick={() => setActiveTab("penalty")} className={tabCls("penalty")}>Early Withdrawal</button>
      </div>

      {/* ===== CALCULATOR TAB ===== */}
      {activeTab === "calculator" && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Initial Deposit ($)</label>
                <input type="number" value={deposit} onChange={e => setDeposit(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
              </div>
              <div>
                <label className={labelCls}>APY (%)</label>
                <input type="number" value={apy} onChange={e => setApy(Math.max(0, +e.target.value))} className={inputCls} min={0} max={20} step={0.05} />
              </div>
              <div>
                <label className={labelCls}>CD Term</label>
                <div className="flex gap-2">
                  <input type="number" value={termValue} onChange={e => setTermValue(Math.max(1, +e.target.value))} className={inputCls} min={1} step={1} />
                  <select value={termUnit} onChange={e => setTermUnit(e.target.value as TermUnit)} className={selectCls + " w-32 flex-shrink-0"}>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[3, 6, 12, 18, 24, 36, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => { setTermValue(m); setTermUnit("months"); }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${termMonths === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                    >
                      {m >= 12 ? `${m / 12}yr` : `${m}mo`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Compounding Frequency</label>
                <select value={compounding} onChange={e => setCompounding(e.target.value as CompoundFreq)} className={selectCls}>
                  <option value="daily">Daily (365/yr)</option>
                  <option value="monthly">Monthly (12/yr)</option>
                  <option value="quarterly">Quarterly (4/yr)</option>
                  <option value="annually">Annually (1/yr)</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Balance at Maturity</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(result.finalBalance)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Interest Earned</p>
                  <p className="text-lg font-semibold text-green-400">{fmtC(result.totalInterest)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Initial Deposit</p>
                  <p className="text-lg font-semibold text-zinc-300">{fmtC(deposit)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">APY (advertised)</p>
                  <p className="text-lg font-semibold text-yellow-400">{fmtP(apy)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Equivalent APR</p>
                  <p className="text-lg font-semibold text-yellow-400">{fmtP(result.apr)}</p>
                </div>
              </div>
              {/* Deposit vs Interest bar */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-2">Deposit vs Interest</p>
                <div className="flex rounded-full overflow-hidden h-4">
                  <div className="bg-zinc-500" style={{ width: `${(deposit / result.finalBalance) * 100}%` }} />
                  <div className="bg-green-500" style={{ width: `${(result.totalInterest / result.finalBalance) * 100}%` }} />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-500" />Deposit ({((deposit / result.finalBalance) * 100).toFixed(1)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Interest ({((result.totalInterest / result.finalBalance) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Balance Growth Over Time</h3>
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-auto" style={{ minWidth: 320 }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(frac => {
                  const y = chartHeight - frac * chartHeight;
                  const val = minBal + frac * range;
                  return (
                    <g key={frac}>
                      <line x1={50} y1={y} x2={chartWidth - 10} y2={y} stroke="#3f3f46" strokeWidth={1} />
                      <text x={46} y={y + 4} textAnchor="end" fill="#71717a" fontSize={10}>{fmtC(val)}</text>
                    </g>
                  );
                })}
                {/* Area fill */}
                <path
                  d={
                    `M ${50} ${chartHeight} ` +
                    growthData.map(d => {
                      const x = 50 + ((d.month / termMonths) * (chartWidth - 60));
                      const y = chartHeight - ((d.balance - minBal) / range) * chartHeight;
                      return `L ${x} ${y}`;
                    }).join(" ") +
                    ` L ${chartWidth - 10} ${chartHeight} Z`
                  }
                  fill="url(#cdGradient)"
                />
                <defs>
                  <linearGradient id="cdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                {/* Line */}
                <polyline
                  points={growthData.map(d => {
                    const x = 50 + ((d.month / termMonths) * (chartWidth - 60));
                    const y = chartHeight - ((d.balance - minBal) / range) * chartHeight;
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                />
                {/* X-axis labels */}
                {growthData.filter((_, i, arr) => {
                  const step = Math.max(1, Math.floor(arr.length / 6));
                  return i % step === 0 || i === arr.length - 1;
                }).map(d => {
                  const x = 50 + ((d.month / termMonths) * (chartWidth - 60));
                  const label = d.month >= 12 ? `${(d.month / 12).toFixed(d.month % 12 === 0 ? 0 : 1)}yr` : `${d.month}mo`;
                  return (
                    <text key={d.month} x={x} y={chartHeight + 20} textAnchor="middle" fill="#71717a" fontSize={10}>{label}</text>
                  );
                })}
                {/* End point */}
                {growthData.length > 0 && (() => {
                  const last = growthData[growthData.length - 1];
                  const x = 50 + ((last.month / termMonths) * (chartWidth - 60));
                  const y = chartHeight - ((last.balance - minBal) / range) * chartHeight;
                  return <circle cx={x} cy={y} r={4} fill="#3b82f6" />;
                })()}
              </svg>
            </div>
          </div>

          {/* Compounding Comparison */}
          <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Compounding Frequency Comparison</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {(["daily", "monthly", "quarterly", "annually"] as CompoundFreq[]).map(freq => {
                const res = calcCD(deposit, apy, termMonths, freq);
                const isActive = freq === compounding;
                return (
                  <div key={freq} className={`rounded-lg px-3 py-2 text-center ${isActive ? "bg-blue-600/20 border border-blue-500/30" : "bg-zinc-900"}`}>
                    <p className="text-zinc-500 capitalize">{freq}</p>
                    <p className={`font-medium ${isActive ? "text-blue-400" : "text-zinc-200"}`}>{fmtC(res.finalBalance)}</p>
                    <p className="text-xs text-zinc-500 mt-1">+{fmtC(res.totalInterest)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ===== LADDER TAB ===== */}
      {activeTab === "ladder" && (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-4">
              A CD ladder splits your total deposit evenly across 5 CDs with terms of 1, 2, 3, 4, and 5 years. As each CD matures, you can reinvest or access the cash.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Total Amount to Invest ($)</label>
                <input type="number" value={ladderDeposit} onChange={e => setLadderDeposit(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
              </div>
              <div>
                <label className={labelCls}>Per CD: {fmtC(ladderDeposit / 5)}</label>
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-500 text-sm">
                  Split evenly across 5 CDs
                </div>
              </div>
            </div>
          </div>

          {/* Ladder rungs */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((yr, i) => {
              const cd = ladderResults.cds[i];
              return (
                <div key={yr} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
                  <div>
                    <p className="text-xs text-zinc-500">Rung {yr}</p>
                    <p className="text-sm font-semibold text-zinc-200">{yr}-Year CD</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">APY (%)</label>
                    <input
                      type="number"
                      value={ladderRates[i]}
                      onChange={e => {
                        const next = [...ladderRates];
                        next[i] = +e.target.value;
                        setLadderRates(next);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                      min={0}
                      max={20}
                      step={0.05}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Deposit</p>
                    <p className="text-sm text-zinc-300">{fmtC(cd.deposit)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Interest</p>
                    <p className="text-sm text-green-400">{fmtC(cd.totalInterest)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Maturity Value</p>
                    <p className="text-sm font-semibold text-blue-400">{fmtC(cd.finalBalance)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ladder summary */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <p className="text-xs text-zinc-500">Ladder Total Interest</p>
              <p className="text-2xl font-bold text-green-400">{fmtC(ladderResults.totalInterest)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <p className="text-xs text-zinc-500">Ladder Total Value</p>
              <p className="text-2xl font-bold text-blue-400">{fmtC(ladderResults.totalFinal)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <p className="text-xs text-zinc-500">vs. Single 5-Year CD</p>
              <p className="text-sm text-zinc-400 mt-1">
                Single CD earns {fmtC(ladderResults.singleCD.totalInterest)} interest
              </p>
              <p className={`text-sm font-semibold mt-1 ${ladderResults.totalInterest >= ladderResults.singleCD.totalInterest ? "text-green-400" : "text-red-400"}`}>
                Ladder {ladderResults.totalInterest >= ladderResults.singleCD.totalInterest ? "earns" : "costs"}{" "}
                {fmtC(Math.abs(ladderResults.totalInterest - ladderResults.singleCD.totalInterest))}{" "}
                {ladderResults.totalInterest >= ladderResults.singleCD.totalInterest ? "more" : "less"}
              </p>
            </div>
          </div>

          {/* Ladder visual timeline */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Maturity Timeline</h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((yr, i) => (
                <div key={yr} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-16 flex-shrink-0">Year {yr}</span>
                  <div className="flex-1 h-6 bg-zinc-900 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-blue-600/40 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(yr / 5) * 100}%` }}
                    >
                      <span className="text-xs text-blue-300 whitespace-nowrap">{fmtC(ladderResults.cds[i].finalBalance)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== COMPARE TAB ===== */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          <p className="text-sm text-zinc-400">Add CD offers from different banks to compare them side by side.</p>

          <div className="space-y-3">
            {compareOptions.map((opt, idx) => (
              <div key={opt.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="text-xs text-zinc-500">Label</label>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={e => {
                      const next = [...compareOptions];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setCompareOptions(next);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Deposit ($)</label>
                  <input
                    type="number"
                    value={opt.deposit}
                    onChange={e => {
                      const next = [...compareOptions];
                      next[idx] = { ...next[idx], deposit: +e.target.value };
                      setCompareOptions(next);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    min={0}
                    step={1000}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">APY (%)</label>
                  <input
                    type="number"
                    value={opt.apy}
                    onChange={e => {
                      const next = [...compareOptions];
                      next[idx] = { ...next[idx], apy: +e.target.value };
                      setCompareOptions(next);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    min={0}
                    max={20}
                    step={0.05}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Term (months)</label>
                  <input
                    type="number"
                    value={opt.termMonths}
                    onChange={e => {
                      const next = [...compareOptions];
                      next[idx] = { ...next[idx], termMonths: +e.target.value };
                      setCompareOptions(next);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    min={1}
                    step={1}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setCompareOptions(compareOptions.filter((_, j) => j !== idx))}
                    className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                    disabled={compareOptions.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setCompareOptions([...compareOptions, { id: nextId, label: `Bank ${String.fromCharCode(65 + compareOptions.length)}`, deposit: 10000, apy: 5.0, termMonths: 12 }]);
              setNextId(nextId + 1);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            + Add CD Option
          </button>

          {/* Comparison results table */}
          {compareResults.length > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800">
                    <tr className="text-zinc-400 text-left">
                      <th className="px-4 py-3">CD Option</th>
                      <th className="px-4 py-3">Deposit</th>
                      <th className="px-4 py-3">APY</th>
                      <th className="px-4 py-3">Term</th>
                      <th className="px-4 py-3">Interest Earned</th>
                      <th className="px-4 py-3">Final Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareResults.map((r, i) => {
                      const best = Math.max(...compareResults.map(c => c.totalInterest));
                      const isBest = Math.abs(r.totalInterest - best) < 0.01;
                      return (
                        <tr key={r.id} className={`border-t border-zinc-700 ${isBest ? "bg-blue-600/10" : ""}`}>
                          <td className="px-4 py-2 text-zinc-200 font-medium">
                            {r.label}
                            {isBest && <span className="ml-2 text-xs text-blue-400 bg-blue-600/20 px-1.5 py-0.5 rounded">Best</span>}
                          </td>
                          <td className="px-4 py-2 text-zinc-300">{fmtC(r.deposit)}</td>
                          <td className="px-4 py-2 text-zinc-300">{fmtP(r.apy)}</td>
                          <td className="px-4 py-2 text-zinc-300">{r.termMonths >= 12 ? `${r.termMonths / 12}yr` : `${r.termMonths}mo`}</td>
                          <td className="px-4 py-2 text-green-400 font-medium">{fmtC(r.totalInterest)}</td>
                          <td className="px-4 py-2 text-blue-400 font-medium">{fmtC(r.finalBalance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visual bar comparison */}
          {compareResults.length > 1 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-3">Interest Earned Comparison</h3>
              <div className="space-y-2">
                {compareResults.map(r => {
                  const maxInterest = Math.max(...compareResults.map(c => c.totalInterest));
                  return (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400 w-16 flex-shrink-0 truncate">{r.label}</span>
                      <div className="flex-1 h-7 bg-zinc-900 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-green-600/40 rounded-lg flex items-center px-2"
                          style={{ width: `${maxInterest > 0 ? (r.totalInterest / maxInterest) * 100 : 0}%`, minWidth: 60 }}
                        >
                          <span className="text-xs text-green-300 whitespace-nowrap">{fmtC(r.totalInterest)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== PENALTY TAB ===== */}
      {activeTab === "penalty" && (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-4">
              Estimate the cost of withdrawing from a CD before it matures. Most banks charge a penalty based on several months of interest.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Deposit Amount ($)</label>
                <input type="number" value={penaltyDeposit} onChange={e => setPenaltyDeposit(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
              </div>
              <div>
                <label className={labelCls}>APY (%)</label>
                <input type="number" value={penaltyApy} onChange={e => setPenaltyApy(Math.max(0, +e.target.value))} className={inputCls} min={0} max={20} step={0.05} />
              </div>
              <div>
                <label className={labelCls}>Original CD Term (months)</label>
                <input type="number" value={penaltyTermMonths} onChange={e => setPenaltyTermMonths(Math.max(1, +e.target.value))} className={inputCls} min={1} step={1} />
              </div>
              <div>
                <label className={labelCls}>Withdraw After (months)</label>
                <input type="number" value={withdrawMonth} onChange={e => setWithdrawMonth(Math.max(1, Math.min(+e.target.value, penaltyTermMonths - 1)))} className={inputCls} min={1} max={penaltyTermMonths - 1} step={1} />
                <p className="text-xs text-zinc-500 mt-1">Early withdrawal at month {withdrawMonth} of {penaltyTermMonths}</p>
              </div>
            </div>
          </div>

          {/* Penalty comparison */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800">
                  <tr className="text-zinc-400 text-left">
                    <th className="px-4 py-3">Penalty Type</th>
                    <th className="px-4 py-3">Penalty Amount</th>
                    <th className="px-4 py-3">Interest Earned</th>
                    <th className="px-4 py-3">Net Interest</th>
                    <th className="px-4 py-3">You Receive</th>
                  </tr>
                </thead>
                <tbody>
                  {penaltyResults.map(p => (
                    <tr key={p.label} className="border-t border-zinc-700">
                      <td className="px-4 py-2 text-zinc-200 font-medium">{p.label}</td>
                      <td className="px-4 py-2 text-red-400">-{fmtC(p.penaltyAmount)}</td>
                      <td className="px-4 py-2 text-zinc-300">{fmtC(p.interestEarned)}</td>
                      <td className={`px-4 py-2 font-medium ${p.netInterest >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtC(p.netInterest)}</td>
                      <td className={`px-4 py-2 font-medium ${p.netBalance >= penaltyDeposit ? "text-blue-400" : "text-red-400"}`}>{fmtC(p.netBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Penalty warnings */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">If held to maturity ({penaltyTermMonths} months)</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(calcCD(penaltyDeposit, penaltyApy, penaltyTermMonths, "daily").totalInterest)} earned</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Interest earned by month {withdrawMonth}</p>
              <p className="text-lg font-semibold text-yellow-400">{fmtC(calcCD(penaltyDeposit, penaltyApy, withdrawMonth, "daily").totalInterest)} earned</p>
            </div>
          </div>

          {penaltyResults.some(p => p.netInterest < 0) && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4">
              <p className="text-sm text-red-300">
                <span className="font-semibold">Warning:</span> Some penalty scenarios result in a net loss, meaning the penalty exceeds interest earned. You would receive less than your original deposit.
              </p>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
