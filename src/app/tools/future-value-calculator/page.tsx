"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtP(n: number) { return n.toFixed(2) + "%"; }
function fmtX(n: number) { return n.toFixed(3) + "x"; }

type Mode = "lump" | "annuity" | "both";
type AnnuityType = "ordinary" | "due";

const frequencies = [
  { label: "Annually", value: 1 },
  { label: "Semi-Annually", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

const contributionFrequencies = [
  { label: "Per Compounding Period", value: 0 },
  { label: "Monthly", value: 12 },
  { label: "Quarterly", value: 4 },
  { label: "Annually", value: 1 },
];

export default function Page() {
  const [mode, setMode] = useState<Mode>("both");
  const [presentValue, setPresentValue] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [payment, setPayment] = useState(200);
  const [compounding, setCompounding] = useState(12);
  const [contribFreq, setContribFreq] = useState(0);
  const [annuityType, setAnnuityType] = useState<AnnuityType>("ordinary");
  const [inflationRate, setInflationRate] = useState(0);
  const [showInflation, setShowInflation] = useState(false);

  const result = useMemo(() => {
    const r = rate / 100;
    const n = compounding;
    const t = years;
    const PV = mode === "annuity" ? 0 : presentValue;
    const PMT = mode === "lump" ? 0 : payment;
    const isDue = annuityType === "due";
    // Contributions per year: 0 means match compounding
    const cPerYear = contribFreq === 0 ? n : contribFreq;

    const breakdown: {
      year: number;
      balance: number;
      totalContributions: number;
      totalInterest: number;
      yearContributions: number;
      yearInterest: number;
      inflationAdjusted: number;
    }[] = [];

    let balance = PV;
    let totalContributions = PV;
    let totalInterest = 0;

    for (let y = 1; y <= t; y++) {
      let yearInterest = 0;
      let yearContributions = 0;

      // Simulate each compounding period within the year
      for (let p = 0; p < n; p++) {
        // Determine if a contribution happens this period
        // periodsPerContribution: how many compounding periods between contributions
        const periodsPerContrib = n / cPerYear;
        const isContribPeriod = cPerYear >= n || (p % Math.round(periodsPerContrib) === 0);
        const contrib = isContribPeriod ? PMT : 0;

        if (isDue && contrib > 0) {
          balance += contrib;
          totalContributions += contrib;
          yearContributions += contrib;
        }

        const interest = balance * (r / n);
        balance += interest;
        totalInterest += interest;
        yearInterest += interest;

        if (!isDue && contrib > 0) {
          balance += contrib;
          totalContributions += contrib;
          yearContributions += contrib;
        }
      }

      const inflAdj = showInflation && inflationRate > 0
        ? balance / Math.pow(1 + inflationRate / 100, y)
        : balance;

      breakdown.push({
        year: y,
        balance,
        totalContributions,
        totalInterest,
        yearContributions,
        yearInterest,
        inflationAdjusted: inflAdj,
      });
    }

    const growthMultiplier = totalContributions > 0 ? balance / totalContributions : 0;
    const inflationAdjustedFV = showInflation && inflationRate > 0
      ? balance / Math.pow(1 + inflationRate / 100, t)
      : balance;

    return { balance, totalContributions, totalInterest, growthMultiplier, breakdown, inflationAdjustedFV };
  }, [presentValue, rate, years, payment, compounding, contribFreq, annuityType, mode, inflationRate, showInflation]);

  // SVG Chart
  const chart = useMemo(() => {
    if (result.breakdown.length === 0) return null;
    const data = result.breakdown;
    const maxVal = Math.max(...data.map(d => d.balance), 1);
    const W = 700;
    const H = 300;
    const pad = { top: 20, right: 20, bottom: 40, left: 70 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    const barW = Math.max(2, (cw / data.length) - 2);

    // Y-axis labels
    const yTicks = 5;
    const yLabels: { val: number; y: number }[] = [];
    for (let i = 0; i <= yTicks; i++) {
      const val = (maxVal / yTicks) * i;
      const y = pad.top + ch - (val / maxVal) * ch;
      yLabels.push({ val, y });
    }

    const bars = data.map((d, i) => {
      const x = pad.left + (i / data.length) * cw + 1;
      const contribH = (d.totalContributions / maxVal) * ch;
      const interestH = (d.totalInterest / maxVal) * ch;
      return { x, contribH, interestH, year: d.year };
    });

    return { W, H, pad, ch, cw, yLabels, bars, barW, maxVal };
  }, [result.breakdown]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const modeBtnCls = (active: boolean) =>
    `flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
      active
        ? "bg-blue-600 border-blue-500 text-white"
        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
    }`;

  return (
    <ToolLayout
      title="Future Value Calculator"
      description="Calculate the future value of investments with lump sums, regular contributions, or both. Compare ordinary annuities vs annuity due, adjust for inflation, and visualize year-by-year growth."
      slug="future-value-calculator"
      category="Finance"
      keywords={[
        "future value calculator",
        "FV calculator",
        "annuity calculator",
        "investment growth calculator",
        "time value of money calculator",
        "future value of annuity",
        "lump sum investment calculator",
        "compound growth calculator",
      ]}
      faqs={[
        {
          question: "What is future value and why does it matter?",
          answer:
            "Future value (FV) is the projected worth of an investment at a specific point in the future, based on a given rate of return. It matters because it helps you understand how much your savings or investments will grow over time, enabling better financial planning for goals like retirement, education, or major purchases.",
        },
        {
          question: "What is the difference between an ordinary annuity and an annuity due?",
          answer:
            "An ordinary annuity makes payments at the end of each period (e.g., most bond coupon payments), while an annuity due makes payments at the beginning of each period (e.g., rent or insurance premiums). An annuity due grows slightly more because each payment has one extra period to earn interest.",
        },
        {
          question: "How does compounding frequency affect future value?",
          answer:
            "More frequent compounding (monthly vs. annually) produces a higher future value because interest begins earning interest sooner. For example, $10,000 at 6% compounded monthly yields more than 6% compounded annually over the same period. The difference becomes more pronounced at higher rates and longer time horizons.",
        },
        {
          question: "What is the future value formula for a lump sum?",
          answer:
            "The future value of a lump sum is calculated as FV = PV x (1 + r/n)^(n*t), where PV is the present value, r is the annual interest rate, n is the number of compounding periods per year, and t is the number of years. This formula accounts for compound interest on the initial investment.",
        },
        {
          question: "Why should I adjust future value for inflation?",
          answer:
            "Inflation erodes purchasing power over time. A dollar today buys more than a dollar 20 years from now. Adjusting for inflation (using the real rate of return) shows your investment's future value in today's purchasing power, giving you a more realistic picture of what your money will actually be worth.",
        },
        {
          question: "What is a growth multiplier?",
          answer:
            "The growth multiplier shows how many times your total contributions have multiplied through compound interest. For example, a growth multiplier of 1.5x means your investment grew to 1.5 times what you put in. A multiplier above 2x means you earned more in interest than you contributed.",
        },
      ]}
      relatedTools={[
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
      ]}
      guide={
        <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xl font-semibold text-zinc-100">How to Use This Future Value Calculator</h2>
          <p>
            Start by selecting a calculation mode. <strong>Lump Sum</strong> calculates the future value of a single
            initial investment. <strong>Annuity</strong> calculates the future value of a series of equal payments with
            no initial deposit. <strong>Both</strong> combines an initial investment with regular contributions for
            the most realistic projection.
          </p>
          <p>
            Enter your interest rate as an annual percentage. Choose how often interest compounds — monthly compounding
            is typical for savings accounts, while annually is common for bonds and CDs. Select whether contributions
            are made at the beginning (annuity due) or end (ordinary annuity) of each period.
          </p>
          <p>
            Enable the inflation adjustment toggle to see your future value in today&apos;s dollars. The default 3%
            inflation rate reflects the long-term U.S. average, but you can adjust it based on your expectations.
          </p>
          <p>
            The year-by-year table and stacked chart break down exactly how much of your future balance comes from
            contributions versus interest earned, helping you see the power of compound growth accelerate over time.
          </p>
        </div>
      }
    >
      {/* Mode Selection */}
      <div className="flex gap-2 mb-6">
        <button className={modeBtnCls(mode === "lump")} onClick={() => setMode("lump")}>Lump Sum</button>
        <button className={modeBtnCls(mode === "annuity")} onClick={() => setMode("annuity")}>Annuity</button>
        <button className={modeBtnCls(mode === "both")} onClick={() => setMode("both")}>Both</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {mode !== "annuity" && (
            <div>
              <label className={labelCls}>Present Value / Initial Investment ($)</label>
              <input type="number" value={presentValue} onChange={e => setPresentValue(+e.target.value)} className={inputCls} min={0} step={500} />
            </div>
          )}
          <div>
            <label className={labelCls}>Annual Interest Rate (%)</label>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={100} step={0.1} />
          </div>
          <div>
            <label className={labelCls}>Number of Years</label>
            <input type="number" value={years} onChange={e => setYears(Math.max(1, Math.min(100, +e.target.value)))} className={inputCls} min={1} max={100} />
          </div>
          <div>
            <label className={labelCls}>Compounding Frequency</label>
            <select value={compounding} onChange={e => setCompounding(+e.target.value)} className={inputCls}>
              {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          {mode !== "lump" && (
            <>
              <div>
                <label className={labelCls}>Payment Amount ($)</label>
                <input type="number" value={payment} onChange={e => setPayment(+e.target.value)} className={inputCls} min={0} step={50} />
              </div>
              <div>
                <label className={labelCls}>Contribution Frequency</label>
                <select value={contribFreq} onChange={e => setContribFreq(+e.target.value)} className={inputCls}>
                  {contributionFrequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Annuity Type</label>
                <div className="flex gap-2">
                  <button
                    className={modeBtnCls(annuityType === "ordinary")}
                    onClick={() => setAnnuityType("ordinary")}
                  >
                    Ordinary (End)
                  </button>
                  <button
                    className={modeBtnCls(annuityType === "due")}
                    onClick={() => setAnnuityType("due")}
                  >
                    Annuity Due (Beginning)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Inflation toggle */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInflation}
                onChange={e => setShowInflation(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-700 border-zinc-600 text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              <span className="text-sm text-zinc-300">Adjust for inflation</span>
            </label>
            {showInflation && (
              <div>
                <label className={labelCls}>Annual Inflation Rate (%)</label>
                <input type="number" value={inflationRate} onChange={e => setInflationRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.1} />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Future Value</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.balance)}</p>
            {showInflation && inflationRate > 0 && (
              <p className="text-sm text-zinc-500 mt-1">
                Inflation-adjusted: <span className="text-blue-300">{fmtC(result.inflationAdjustedFV)}</span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Contributions</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(result.totalContributions)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Interest Earned</p>
              <p className="text-lg font-semibold text-yellow-400">{fmtC(result.totalInterest)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Growth Multiplier</p>
              <p className="text-lg font-semibold text-purple-400">{fmtX(result.growthMultiplier)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Interest as % of Total</p>
              <p className="text-lg font-semibold text-yellow-400">
                {result.balance > 0 ? fmtP((result.totalInterest / result.balance) * 100) : "0.00%"}
              </p>
            </div>
          </div>

          {/* Growth breakdown bar */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Growth Breakdown</p>
            <div className="flex rounded-full overflow-hidden h-4">
              {result.balance > 0 && (
                <>
                  <div className="bg-green-500" style={{ width: `${(result.totalContributions / result.balance) * 100}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${(result.totalInterest / result.balance) * 100}%` }} />
                </>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Contributions ({result.balance > 0 ? ((result.totalContributions / result.balance) * 100).toFixed(0) : 0}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Interest ({result.balance > 0 ? ((result.totalInterest / result.balance) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      {chart && (
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-3">Growth Over Time</p>
          <svg viewBox={`0 0 ${chart.W} ${chart.H}`} className="w-full" aria-label="Future value growth chart">
            {/* Grid lines */}
            {chart.yLabels.map((yl, i) => (
              <g key={i}>
                <line x1={chart.pad.left} y1={yl.y} x2={chart.W - chart.pad.right} y2={yl.y} stroke="#3f3f46" strokeWidth="0.5" />
                <text x={chart.pad.left - 8} y={yl.y + 4} textAnchor="end" fill="#71717a" fontSize="10">
                  {yl.val >= 1000000 ? `$${(yl.val / 1000000).toFixed(1)}M` : yl.val >= 1000 ? `$${(yl.val / 1000).toFixed(0)}K` : `$${yl.val.toFixed(0)}`}
                </text>
              </g>
            ))}

            {/* Stacked bars */}
            {chart.bars.map((b, i) => (
              <g key={i}>
                {/* Contributions (bottom) */}
                <rect
                  x={b.x}
                  y={chart.pad.top + chart.ch - b.contribH}
                  width={chart.barW}
                  height={b.contribH}
                  fill="#22c55e"
                  opacity="0.8"
                  rx="1"
                />
                {/* Interest (top, stacked) */}
                <rect
                  x={b.x}
                  y={chart.pad.top + chart.ch - b.contribH - b.interestH}
                  width={chart.barW}
                  height={b.interestH}
                  fill="#eab308"
                  opacity="0.8"
                  rx="1"
                />
                {/* X-axis labels (every few years) */}
                {(result.breakdown.length <= 20 || b.year % Math.ceil(result.breakdown.length / 15) === 0 || b.year === 1) && (
                  <text
                    x={b.x + chart.barW / 2}
                    y={chart.H - chart.pad.bottom + 16}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="10"
                  >
                    {b.year}
                  </text>
                )}
              </g>
            ))}

            {/* Axis labels */}
            <text x={chart.W / 2} y={chart.H - 4} textAnchor="middle" fill="#a1a1aa" fontSize="11">Year</text>

            {/* Legend */}
            <rect x={chart.W - 180} y={chart.pad.top} width={10} height={10} fill="#22c55e" rx="2" opacity="0.8" />
            <text x={chart.W - 166} y={chart.pad.top + 9} fill="#a1a1aa" fontSize="10">Contributions</text>
            <rect x={chart.W - 180} y={chart.pad.top + 16} width={10} height={10} fill="#eab308" rx="2" opacity="0.8" />
            <text x={chart.W - 166} y={chart.pad.top + 25} fill="#a1a1aa" fontSize="10">Interest Earned</text>
          </svg>
        </div>
      )}

      {/* Year-by-year table */}
      <div className="mt-8 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-800">
            <tr className="text-zinc-400 text-left">
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Balance</th>
              <th className="px-3 py-2">Year Contrib.</th>
              <th className="px-3 py-2">Year Interest</th>
              <th className="px-3 py-2">Total Contrib.</th>
              <th className="px-3 py-2">Total Interest</th>
              {showInflation && inflationRate > 0 && <th className="px-3 py-2">Infl. Adjusted</th>}
            </tr>
          </thead>
          <tbody>
            {result.breakdown.map(row => (
              <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                <td className="px-3 py-1.5">{row.year}</td>
                <td className="px-3 py-1.5">{fmtC(row.balance)}</td>
                <td className="px-3 py-1.5">{fmtC(row.yearContributions)}</td>
                <td className="px-3 py-1.5">{fmtC(row.yearInterest)}</td>
                <td className="px-3 py-1.5">{fmtC(row.totalContributions)}</td>
                <td className="px-3 py-1.5">{fmtC(row.totalInterest)}</td>
                {showInflation && inflationRate > 0 && (
                  <td className="px-3 py-1.5 text-blue-300">{fmtC(row.inflationAdjusted)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolLayout>
  );
}
