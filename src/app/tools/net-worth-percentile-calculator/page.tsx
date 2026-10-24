"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── U.S. Net Worth Distribution by Age Group (2024) ──
   Source: Federal Reserve Survey of Consumer Finances (SCF)
   Format: [netWorth, cumulativePercentile] */
const ALL_AGES: [number, number][] = [
  [-50000, 0], [0, 10.5], [5000, 18.2], [10000, 22.5], [25000, 28.8],
  [50000, 35.2], [75000, 39.5], [100000, 43.3], [150000, 49.8],
  [200000, 54.5], [250000, 58.3], [300000, 61.5], [400000, 66.7],
  [500000, 70.8], [750000, 78.2], [1000000, 83.5], [1500000, 88.8],
  [2000000, 91.8], [3000000, 95.0], [5000000, 97.5], [10000000, 99.0],
  [30000000, 99.8], [100000000, 100],
];

const AGE_UNDER_35: [number, number][] = [
  [-50000, 0], [0, 22.0], [5000, 35.5], [10000, 42.0], [25000, 52.0],
  [50000, 60.5], [75000, 66.0], [100000, 70.5], [150000, 77.0],
  [200000, 81.0], [250000, 84.0], [300000, 86.2], [400000, 89.5],
  [500000, 91.8], [750000, 95.0], [1000000, 96.8], [1500000, 98.2],
  [2000000, 98.9], [5000000, 99.7], [10000000, 99.9], [100000000, 100],
];

const AGE_35_44: [number, number][] = [
  [-50000, 0], [0, 12.0], [5000, 19.5], [10000, 24.0], [25000, 30.5],
  [50000, 37.0], [75000, 41.5], [100000, 45.5], [150000, 52.0],
  [200000, 57.0], [250000, 61.0], [300000, 64.2], [400000, 69.5],
  [500000, 73.5], [750000, 80.5], [1000000, 85.5], [1500000, 90.2],
  [2000000, 93.0], [3000000, 95.8], [5000000, 97.8], [10000000, 99.2],
  [30000000, 99.8], [100000000, 100],
];

const AGE_45_54: [number, number][] = [
  [-50000, 0], [0, 8.5], [5000, 14.5], [10000, 18.5], [25000, 24.0],
  [50000, 30.0], [75000, 34.0], [100000, 37.8], [150000, 44.0],
  [200000, 49.0], [250000, 53.0], [300000, 56.2], [400000, 61.5],
  [500000, 65.8], [750000, 73.5], [1000000, 79.0], [1500000, 85.5],
  [2000000, 89.2], [3000000, 93.0], [5000000, 96.2], [10000000, 98.5],
  [30000000, 99.6], [100000000, 100],
];

const AGE_55_64: [number, number][] = [
  [-50000, 0], [0, 7.0], [5000, 12.0], [10000, 15.5], [25000, 20.5],
  [50000, 26.0], [75000, 30.0], [100000, 33.5], [150000, 39.5],
  [200000, 44.5], [250000, 48.5], [300000, 51.8], [400000, 57.0],
  [500000, 61.5], [750000, 69.5], [1000000, 75.5], [1500000, 82.5],
  [2000000, 87.0], [3000000, 91.5], [5000000, 95.2], [10000000, 98.0],
  [30000000, 99.5], [100000000, 100],
];

const AGE_65_74: [number, number][] = [
  [-50000, 0], [0, 6.0], [5000, 10.5], [10000, 14.0], [25000, 19.0],
  [50000, 24.5], [75000, 28.5], [100000, 32.0], [150000, 38.0],
  [200000, 43.0], [250000, 47.5], [300000, 51.0], [400000, 56.5],
  [500000, 61.0], [750000, 69.0], [1000000, 75.0], [1500000, 82.0],
  [2000000, 86.5], [3000000, 91.0], [5000000, 95.0], [10000000, 98.0],
  [30000000, 99.5], [100000000, 100],
];

const AGE_75_PLUS: [number, number][] = [
  [-50000, 0], [0, 5.0], [5000, 10.0], [10000, 14.0], [25000, 20.0],
  [50000, 27.0], [75000, 32.0], [100000, 36.5], [150000, 43.5],
  [200000, 49.0], [250000, 53.5], [300000, 57.0], [400000, 62.5],
  [500000, 67.0], [750000, 74.5], [1000000, 80.0], [1500000, 86.0],
  [2000000, 89.5], [3000000, 93.0], [5000000, 96.0], [10000000, 98.5],
  [30000000, 99.6], [100000000, 100],
];

type AgeGroup = "all" | "under35" | "35-44" | "45-54" | "55-64" | "65-74" | "75+";
const AGE_DATA: Record<AgeGroup, [number, number][]> = {
  all: ALL_AGES, under35: AGE_UNDER_35, "35-44": AGE_35_44, "45-54": AGE_45_54,
  "55-64": AGE_55_64, "65-74": AGE_65_74, "75+": AGE_75_PLUS,
};
const AGE_LABELS: Record<AgeGroup, string> = {
  all: "All Ages", under35: "Under 35", "35-44": "35-44", "45-54": "45-54",
  "55-64": "55-64", "65-74": "65-74", "75+": "75+",
};
const AGE_MEDIAN: Record<AgeGroup, number> = {
  all: 192700, under35: 39000, "35-44": 135600, "45-54": 247200,
  "55-64": 364270, "65-74": 410000, "75+": 335600,
};

function interpolate(value: number, brackets: [number, number][]): number {
  if (value <= brackets[0][0]) return 0;
  for (let i = 1; i < brackets.length; i++) {
    if (value <= brackets[i][0]) {
      const [lo, loPct] = brackets[i - 1];
      const [hi, hiPct] = brackets[i];
      const ratio = (value - lo) / (hi - lo);
      return loPct + ratio * (hiPct - loPct);
    }
  }
  return 99.9;
}

function findValue(targetPct: number, brackets: [number, number][]): number {
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

function fmt(n: number): string {
  if (n < 0) return "-" + fmt(-n);
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

export default function Page() {
  const [assets, setAssets] = useState(350000);
  const [debts, setDebts] = useState(150000);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("all");
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Asset breakdown fields
  const [home, setHome] = useState(250000);
  const [retirement, setRetirement] = useState(60000);
  const [savings, setSavings] = useState(15000);
  const [investments, setInvestments] = useState(10000);
  const [vehicles, setVehicles] = useState(15000);
  const [otherAssets, setOtherAssets] = useState(0);
  // Debt breakdown
  const [mortgage, setMortgage] = useState(120000);
  const [studentLoans, setStudentLoans] = useState(15000);
  const [autoLoans, setAutoLoans] = useState(10000);
  const [creditCards, setCreditCards] = useState(5000);
  const [otherDebts, setOtherDebts] = useState(0);

  // Sync breakdowns to totals
  const breakdownAssets = home + retirement + savings + investments + vehicles + otherAssets;
  const breakdownDebts = mortgage + studentLoans + autoLoans + creditCards + otherDebts;

  const effectiveAssets = showBreakdown ? breakdownAssets : assets;
  const effectiveDebts = showBreakdown ? breakdownDebts : debts;
  const netWorth = effectiveAssets - effectiveDebts;

  const result = useMemo(() => {
    const brackets = AGE_DATA[ageGroup];
    const percentile = interpolate(netWorth, brackets);
    const topPercent = 100 - percentile;
    return { percentile, topPercent };
  }, [netWorth, ageGroup]);

  const benchmarks = useMemo(() => {
    const brackets = AGE_DATA[ageGroup];
    return [
      { label: "25th percentile", value: findValue(25, brackets) },
      { label: "Median (50th)", value: findValue(50, brackets) },
      { label: "75th percentile", value: findValue(75, brackets) },
      { label: "90th percentile", value: findValue(90, brackets) },
      { label: "95th percentile", value: findValue(95, brackets) },
      { label: "99th percentile", value: findValue(99, brackets) },
    ];
  }, [ageGroup]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const barWidth = Math.min(Math.max(result.percentile, 1), 100);

  const medianForAge = AGE_MEDIAN[ageGroup];
  const vsMedian = netWorth - medianForAge;

  return (
    <ToolLayout
      title="Net Worth Percentile Calculator"
      description="See how your net worth compares to other Americans by age group. Uses Federal Reserve Survey of Consumer Finances data to calculate your wealth percentile."
      slug="net-worth-percentile-calculator"
      category="Finance"
      keywords={["net worth percentile calculator", "net worth by age", "am i wealthy", "average net worth by age", "wealth percentile", "net worth comparison", "how much should i have saved", "median net worth by age", "net worth rank", "top 1 percent net worth"]}
      faqs={[
        { question: "What is the median net worth in the U.S.?", answer: "The median U.S. household net worth is approximately $192,700. The average (mean) is much higher at about $1,060,000 because extremely wealthy households pull the average up. Median is a better measure of the 'typical' American's wealth." },
        { question: "What net worth makes you top 1%?", answer: "A net worth of roughly $13 million or more puts you in the top 1% of U.S. households. The threshold varies by age: for under-35 households it's around $1.5M, while for 55-64 year olds it's around $15M." },
        { question: "What should my net worth be at my age?", answer: "A common guideline is to have 1x your annual salary saved by 30, 3x by 40, 6x by 50, 8x by 60, and 10x by 67. However, these are rough targets. The median net worth by age group gives a more realistic picture of where Americans actually stand." },
        { question: "Does net worth include home equity?", answer: "Yes. Net worth equals total assets minus total debts. Assets include home equity, retirement accounts, savings, investments, vehicles, and other property. Debts include mortgages, student loans, auto loans, credit cards, and any other liabilities." },
        { question: "Why is average net worth so much higher than median?", answer: "The top 10% of households hold about 70% of all wealth. A few extremely wealthy families (with net worths in the billions) dramatically pull the average upward, making it unrepresentative of typical Americans. The median (50th percentile) is the point where exactly half of households have more and half have less." },
        { question: "How does net worth vary by age?", answer: "Net worth generally increases with age due to accumulated savings, home equity, and investment growth. The median rises from about $39,000 for under-35 to $410,000 for ages 65-74, then declines slightly to $336,000 for 75+ as retirees draw down savings." },
      ]}
      relatedTools={[
        { name: "Net Worth Calculator", href: "/tools/net-worth-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Income Percentile Calculator", href: "/tools/income-percentile-calculator" },
        { name: "FIRE Calculator", href: "/tools/fire-calculator" },
      ]}
    >
      {/* Age group selector */}
      <div className="mb-6">
        <label className={labelCls}>Age Group</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(AGE_DATA) as AgeGroup[]).map(ag => (
            <button
              key={ag}
              onClick={() => setAgeGroup(ag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ageGroup === ag ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"}`}
            >
              {AGE_LABELS[ag]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Toggle breakdown mode */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showBreakdown ? "Switch to simple mode" : "Break down assets & debts"}
          </button>

          {!showBreakdown ? (
            <>
              <div>
                <label className={labelCls}>Total Assets</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input type="number" value={assets} onChange={e => setAssets(+e.target.value)} className={inputCls + " pl-7"} step={1000} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Total Debts</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input type="number" value={debts} onChange={e => setDebts(Math.max(0, +e.target.value))} className={inputCls + " pl-7"} step={1000} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-green-400 mb-1">Assets</p>
                {([["Home Value", home, setHome], ["Retirement Accounts", retirement, setRetirement], ["Cash & Savings", savings, setSavings], ["Investments", investments, setInvestments], ["Vehicles", vehicles, setVehicles], ["Other Assets", otherAssets, setOtherAssets]] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                  <div key={label} className="flex items-center gap-2">
                    <label className="text-xs text-zinc-500 w-32 shrink-0">{label}</label>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">$</span>
                      <input type="number" value={val} onChange={e => setter(+e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 pl-5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" step={1000} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs pt-1 border-t border-zinc-700">
                  <span className="text-zinc-500">Total Assets</span>
                  <span className="text-green-400 font-medium">{fmt(breakdownAssets)}</span>
                </div>
              </div>
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-red-400 mb-1">Debts</p>
                {([["Mortgage", mortgage, setMortgage], ["Student Loans", studentLoans, setStudentLoans], ["Auto Loans", autoLoans, setAutoLoans], ["Credit Cards", creditCards, setCreditCards], ["Other Debts", otherDebts, setOtherDebts]] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                  <div key={label} className="flex items-center gap-2">
                    <label className="text-xs text-zinc-500 w-32 shrink-0">{label}</label>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">$</span>
                      <input type="number" value={val} onChange={e => setter(Math.max(0, +e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 pl-5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" step={1000} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs pt-1 border-t border-zinc-700">
                  <span className="text-zinc-500">Total Debts</span>
                  <span className="text-red-400 font-medium">{fmt(breakdownDebts)}</span>
                </div>
              </div>
            </>
          )}

          {/* Net worth summary */}
          <div className={`border rounded-lg p-3 text-center ${netWorth >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            <p className="text-xs text-zinc-500">Net Worth</p>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(netWorth)}</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">
              Net Worth Percentile {ageGroup !== "all" ? `(Age ${AGE_LABELS[ageGroup]})` : ""}
            </p>
            <p className="text-5xl font-bold text-blue-400">{ordinal(result.percentile)}</p>
            <p className="text-sm text-zinc-500 mt-2">
              Your net worth is higher than {result.percentile.toFixed(1)}% of {ageGroup === "all" ? "all U.S. households" : `households aged ${AGE_LABELS[ageGroup]}`}
            </p>
          </div>

          {/* Visual bar */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>0%</span>
              <span>You: {result.percentile.toFixed(1)}%</span>
              <span>100%</span>
            </div>
            <div className="w-full h-6 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-blue-400"
                style={{ width: barWidth + "%" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Top</p>
              <p className="text-lg font-semibold text-orange-400">{result.topPercent.toFixed(1)}%</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Median ({AGE_LABELS[ageGroup]})</p>
              <p className="text-lg font-semibold text-zinc-100">{fmt(medianForAge)}</p>
            </div>
            <div className={`border rounded-lg p-3 text-center ${vsMedian >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <p className="text-xs text-zinc-500">vs Median</p>
              <p className={`text-lg font-semibold ${vsMedian >= 0 ? "text-green-400" : "text-red-400"}`}>
                {vsMedian >= 0 ? "+" : ""}{fmt(vsMedian)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
        <p className="text-blue-300 text-sm leading-relaxed">
          {result.percentile >= 90 ? (
            <>With a net worth of {fmt(netWorth)}, you are in the top {(100 - result.percentile).toFixed(0)}% of {ageGroup === "all" ? "all U.S. households" : `households aged ${AGE_LABELS[ageGroup]}`}. {vsMedian > 0 ? `Your net worth is ${fmt(vsMedian)} above the median for your group.` : ""}</>
          ) : result.percentile >= 50 ? (
            <>Your net worth of {fmt(netWorth)} is above the median of {fmt(medianForAge)} for {ageGroup === "all" ? "all U.S. households" : `households aged ${AGE_LABELS[ageGroup]}`}. You have more wealth than roughly {Math.round(result.percentile)} out of every 100 households in this group. To reach the 90th percentile, you would need a net worth of about {fmt(findValue(90, AGE_DATA[ageGroup]))}.</>
          ) : netWorth >= 0 ? (
            <>Your net worth of {fmt(netWorth)} is below the median of {fmt(medianForAge)} for {ageGroup === "all" ? "all U.S. households" : `households aged ${AGE_LABELS[ageGroup]}`}. About {Math.round(100 - result.percentile)}% of households in this group have a higher net worth. Building an emergency fund and contributing to retirement accounts are the most impactful first steps.</>
          ) : (
            <>A negative net worth of {fmt(netWorth)} means your debts exceed your assets. About {result.percentile.toFixed(0)}% of {ageGroup === "all" ? "households" : `households aged ${AGE_LABELS[ageGroup]}`} are in a similar or worse position. This is common for younger adults with student loans. Focus on paying down high-interest debt first.</>
          )}
        </p>
      </div>

      {/* Percentile benchmarks */}
      <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-300">Net Worth Percentiles — {AGE_LABELS[ageGroup]} (2024)</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-500">
              <th className="text-left p-3">Percentile</th>
              <th className="text-right p-3">Net Worth</th>
              <th className="text-right p-3">Your Position</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b, i) => {
              const isNear = Math.abs(result.percentile - parseFloat(b.label)) < 5;
              return (
                <tr key={i} className={`border-b border-zinc-800 ${isNear ? "bg-blue-500/10" : ""}`}>
                  <td className="p-3 text-zinc-300">{b.label}</td>
                  <td className="text-right p-3 text-zinc-100 font-medium">{fmt(b.value)}</td>
                  <td className="text-right p-3">
                    {netWorth >= b.value ? (
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

      {/* Median by age comparison */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-zinc-300 hover:text-zinc-100">
          Median Net Worth by Age Group
        </summary>
        <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-500">
                <th className="text-left p-3">Age Group</th>
                <th className="text-right p-3">Median Net Worth</th>
                <th className="text-right p-3">Your Position</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(AGE_MEDIAN) as AgeGroup[]).filter(k => k !== "all").map(ag => (
                <tr key={ag} className={`border-b border-zinc-800 ${ag === ageGroup ? "bg-blue-500/10" : ""}`}>
                  <td className="p-3 text-zinc-300">{AGE_LABELS[ag]}</td>
                  <td className="text-right p-3 text-zinc-100 font-medium">{fmt(AGE_MEDIAN[ag])}</td>
                  <td className="text-right p-3">
                    {netWorth >= AGE_MEDIAN[ag] ? (
                      <span className="text-green-400 text-xs">Above</span>
                    ) : (
                      <span className="text-zinc-600 text-xs">Below</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </ToolLayout>
  );
}
