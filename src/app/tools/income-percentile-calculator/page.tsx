"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── U.S. Household Income Distribution (2024) ──
   Source: U.S. Census Bureau, Current Population Survey (CPS ASEC)
   Interpolated into cumulative percentile brackets. */
const INCOME_BRACKETS: [number, number][] = [
  [0, 0],
  [5000, 2.8],
  [10000, 6.1],
  [15000, 10.3],
  [20000, 14.5],
  [25000, 19.0],
  [30000, 23.2],
  [35000, 27.5],
  [40000, 31.5],
  [45000, 35.3],
  [50000, 39.2],
  [55000, 42.7],
  [60000, 46.1],
  [65000, 49.3],
  [70000, 52.3],
  [75000, 55.2],
  [80000, 57.9],
  [85000, 60.4],
  [90000, 62.7],
  [95000, 64.9],
  [100000, 67.0],
  [110000, 70.8],
  [120000, 74.1],
  [130000, 76.9],
  [140000, 79.3],
  [150000, 81.4],
  [175000, 85.8],
  [200000, 89.0],
  [250000, 93.0],
  [300000, 95.3],
  [400000, 97.3],
  [500000, 98.4],
  [750000, 99.3],
  [1000000, 99.6],
  [2000000, 99.9],
  [10000000, 100],
];

/* ── Individual Income Distribution (2024) ── */
const INDIVIDUAL_BRACKETS: [number, number][] = [
  [0, 0],
  [5000, 7.5],
  [10000, 14.8],
  [15000, 22.0],
  [20000, 28.5],
  [25000, 34.8],
  [30000, 40.2],
  [35000, 45.1],
  [40000, 49.6],
  [45000, 53.5],
  [50000, 57.2],
  [55000, 60.4],
  [60000, 63.3],
  [65000, 65.9],
  [70000, 68.3],
  [75000, 70.5],
  [80000, 72.5],
  [85000, 74.3],
  [90000, 76.0],
  [95000, 77.5],
  [100000, 78.9],
  [110000, 81.4],
  [120000, 83.5],
  [130000, 85.3],
  [140000, 86.8],
  [150000, 88.1],
  [175000, 90.8],
  [200000, 92.8],
  [250000, 95.3],
  [300000, 96.8],
  [400000, 98.1],
  [500000, 98.8],
  [750000, 99.4],
  [1000000, 99.7],
  [2000000, 99.9],
  [10000000, 100],
];

function interpolate(income: number, brackets: [number, number][]): number {
  if (income <= 0) return 0;
  for (let i = 1; i < brackets.length; i++) {
    if (income <= brackets[i][0]) {
      const [lo, loPct] = brackets[i - 1];
      const [hi, hiPct] = brackets[i];
      const ratio = (income - lo) / (hi - lo);
      return loPct + ratio * (hiPct - loPct);
    }
  }
  return 99.9;
}

function fmt(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toLocaleString();
}

function ordinal(n: number): string {
  const r = Math.round(n);
  if (r >= 11 && r <= 13) return r + "th";
  const last = r % 10;
  if (last === 1) return r + "st";
  if (last === 2) return r + "nd";
  if (last === 3) return r + "rd";
  return r + "th";
}

/* ── Key income thresholds for context ── */
const THRESHOLDS = [
  { label: "Federal Poverty Line (single)", value: 15060 },
  { label: "Median Individual Income", value: 50000 },
  { label: "Median Household Income", value: 80610 },
  { label: "Top 10% Household", value: 200000 },
  { label: "Top 5% Household", value: 280000 },
  { label: "Top 1% Household", value: 600000 },
];

export default function Page() {
  const [income, setIncome] = useState(75000);
  const [type, setType] = useState<"household" | "individual">("household");

  const result = useMemo(() => {
    const brackets = type === "household" ? INCOME_BRACKETS : INDIVIDUAL_BRACKETS;
    const percentile = interpolate(income, brackets);
    const topPercent = 100 - percentile;
    return { percentile, topPercent };
  }, [income, type]);

  // Find where common benchmarks fall
  const benchmarks = useMemo(() => {
    const brackets = type === "household" ? INCOME_BRACKETS : INDIVIDUAL_BRACKETS;
    return [
      { label: "25th percentile", income: findIncome(25, brackets) },
      { label: "Median (50th)", income: findIncome(50, brackets) },
      { label: "75th percentile", income: findIncome(75, brackets) },
      { label: "90th percentile", income: findIncome(90, brackets) },
      { label: "95th percentile", income: findIncome(95, brackets) },
      { label: "99th percentile", income: findIncome(99, brackets) },
    ];
  }, [type]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  // Bar width for visual
  const barWidth = Math.min(Math.max(result.percentile, 1), 100);

  return (
    <ToolLayout
      title="Income Percentile Calculator"
      description="Find out where your income ranks compared to all Americans. Uses U.S. Census Bureau data for both household and individual income percentiles."
      slug="income-percentile-calculator"
      category="Finance"
      keywords={["income percentile calculator", "what income percentile am i", "household income percentile", "salary percentile", "income rank", "income distribution", "am i middle class", "top 10 percent income", "top 1 percent income", "income comparison"]}
      faqs={[
        { question: "What is the median household income in the U.S.?", answer: "The median U.S. household income is approximately $80,610 as of 2024. This means half of all households earn more and half earn less. Median is more meaningful than average because extremely high earners skew the average upward to about $114,000." },
        { question: "What income puts you in the top 1%?", answer: "A household income of roughly $600,000 or more puts you in the top 1% of U.S. earners. For individual income, the threshold is around $400,000. These figures are based on adjusted gross income from IRS and Census data." },
        { question: "What is considered middle class income?", answer: "The Pew Research Center defines middle class as households earning between two-thirds and double the median income. For 2024, that's roughly $54,000 to $161,000 for a household. However, cost of living varies dramatically by location — $80K in rural Ohio stretches much further than $80K in San Francisco." },
        { question: "Does this include all types of income?", answer: "This calculator uses total money income, which includes wages, salaries, self-employment income, Social Security, pensions, investment income, and other regular payments before taxes. It does not include capital gains, non-cash benefits, or one-time payments." },
        { question: "Why does household vs individual matter?", answer: "Household income counts all earners in a home. A household with two people each earning $50K has a $100K household income (68th percentile) but each individual is at the 57th percentile. Use household to compare family financial standing, individual to benchmark your personal earnings." },
        { question: "How does income percentile vary by age?", answer: "Income typically peaks between ages 45-54 when the median household income reaches about $97,000. Younger households (under 25) have a median around $40,000, while those 65+ have a median around $55,000. Your percentile relative to your age group may differ significantly from the overall percentile." },
      ]}
      relatedTools={[
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Inflation Calculator", href: "/tools/inflation-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "Net Worth Calculator", href: "/tools/net-worth-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
      ]}
    >
      {/* Type toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setType("household")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "household" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
          Household Income
        </button>
        <button onClick={() => setType("individual")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "individual" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
          Individual Income
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Annual {type === "household" ? "Household" : "Individual"} Income (before tax)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <input
                type="number"
                value={income}
                onChange={e => setIncome(Math.max(0, +e.target.value))}
                className={inputCls + " pl-7"}
                min={0}
                step={1000}
              />
            </div>
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {[30000, 50000, 75000, 100000, 150000, 200000, 300000, 500000].map(v => (
              <button
                key={v}
                onClick={() => setIncome(v)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${income === v ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
              >
                {fmt(v)}
              </button>
            ))}
          </div>

          {/* Key thresholds */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Key Income Thresholds (2024)</p>
            <div className="space-y-1.5">
              {THRESHOLDS.map(t => {
                const isAbove = income >= t.value;
                return (
                  <div key={t.label} className={`flex justify-between text-xs px-2 py-1 rounded ${isAbove ? "bg-green-500/10 text-green-400" : "text-zinc-500"}`}>
                    <span>{t.label}</span>
                    <span>{fmt(t.value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Your Income Percentile</p>
            <p className="text-5xl font-bold text-blue-400">{ordinal(result.percentile)}</p>
            <p className="text-sm text-zinc-500 mt-2">
              You earn more than {result.percentile.toFixed(1)}% of {type === "household" ? "U.S. households" : "U.S. individuals"}
            </p>
          </div>

          {/* Visual bar */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>0%</span>
              <span>You: {result.percentile.toFixed(1)}%</span>
              <span>100%</span>
            </div>
            <div className="w-full h-6 bg-zinc-700 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-blue-400"
                style={{ width: barWidth + "%" }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-600 mt-1">
              <span>Lower income</span>
              <span>Higher income</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Top</p>
              <p className="text-xl font-semibold text-orange-400">{result.topPercent.toFixed(1)}%</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Out of every 100 {type === "household" ? "households" : "people"}</p>
              <p className="text-xl font-semibold text-zinc-100">You earn more than {Math.round(result.percentile)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
        <p className="text-blue-300 text-sm leading-relaxed">
          {result.percentile >= 99 ? (
            <>A {type} income of {fmt(income)} places you in the top 1% of earners in the United States. Fewer than 1 in 100 {type === "household" ? "households" : "individuals"} earn this much.</>
          ) : result.percentile >= 90 ? (
            <>A {type} income of {fmt(income)} puts you in the top {(100 - result.percentile).toFixed(0)}% of U.S. earners. About {Math.round(100 - result.percentile)} out of every 100 {type === "household" ? "households" : "people"} earn as much or more than you.</>
          ) : result.percentile >= 50 ? (
            <>A {type} income of {fmt(income)} is above the U.S. median. You earn more than roughly {Math.round(result.percentile)} out of every 100 {type === "household" ? "households" : "people"}. To reach the top 10%, you would need about {fmt(findIncome(90, type === "household" ? INCOME_BRACKETS : INDIVIDUAL_BRACKETS))}.</>
          ) : (
            <>A {type} income of {fmt(income)} falls below the U.S. median of {fmt(type === "household" ? 80610 : 50000)}. About {Math.round(100 - result.percentile)}% of {type === "household" ? "households" : "individuals"} earn as much or more.</>
          )}
        </p>
      </div>

      {/* Percentile benchmarks */}
      <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-300">{type === "household" ? "Household" : "Individual"} Income Percentiles (2024)</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-500">
              <th className="text-left p-3">Percentile</th>
              <th className="text-right p-3">Income</th>
              <th className="text-right p-3">Your Position</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b, i) => {
              const isNear = Math.abs(result.percentile - parseFloat(b.label)) < 5;
              return (
                <tr key={i} className={`border-b border-zinc-800 ${isNear ? "bg-blue-500/10" : ""}`}>
                  <td className="p-3 text-zinc-300">{b.label}</td>
                  <td className="text-right p-3 text-zinc-100 font-medium">{fmt(b.income)}</td>
                  <td className="text-right p-3">
                    {income >= b.income ? (
                      <span className="text-green-400 text-xs">Above</span>
                    ) : (
                      <span className="text-zinc-600 text-xs">Below</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ToolLayout>
  );
}

/* ── Find income at a given percentile via reverse interpolation ── */
function findIncome(targetPct: number, brackets: [number, number][]): number {
  for (let i = 1; i < brackets.length; i++) {
    if (targetPct <= brackets[i][1]) {
      const [lo, loPct] = brackets[i - 1];
      const [hi, hiPct] = brackets[i];
      const ratio = (targetPct - loPct) / (hiPct - loPct);
      return Math.round(lo + ratio * (hi - lo));
    }
  }
  return brackets[brackets.length - 1][0];
}
