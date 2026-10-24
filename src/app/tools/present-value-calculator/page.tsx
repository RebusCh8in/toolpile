"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtP(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

type Mode = "single" | "annuity" | "growing-annuity";
type AnnuityType = "ordinary" | "due";

export default function Page() {
  const [mode, setMode] = useState<Mode>("single");
  const [futureValue, setFutureValue] = useState(100000);
  const [rate, setRate] = useState(7);
  const [periods, setPeriods] = useState(10);
  const [payment, setPayment] = useState(5000);
  const [growthRate, setGrowthRate] = useState(3);
  const [annuityType, setAnnuityType] = useState<AnnuityType>("ordinary");

  const result = useMemo(() => {
    const r = rate / 100;
    const n = periods;

    let presentValue = 0;

    if (mode === "single") {
      // PV = FV / (1 + r)^n
      presentValue = futureValue / Math.pow(1 + r, n);
    } else if (mode === "annuity") {
      // PV of annuity = PMT * [(1 - (1+r)^-n) / r]
      if (r === 0) {
        presentValue = payment * n;
      } else {
        presentValue = payment * ((1 - Math.pow(1 + r, -n)) / r);
      }
      if (annuityType === "due") {
        presentValue *= (1 + r);
      }
    } else {
      // Growing annuity: PV = PMT * [1 - ((1+g)/(1+r))^n] / (r - g)
      const g = growthRate / 100;
      if (Math.abs(r - g) < 1e-10) {
        presentValue = payment * n / (1 + r);
      } else {
        presentValue = payment * (1 - Math.pow((1 + g) / (1 + r), n)) / (r - g);
      }
      if (annuityType === "due") {
        presentValue *= (1 + r);
      }
    }

    // Determine the total nominal (undiscounted) amount
    let totalNominal = 0;
    if (mode === "single") {
      totalNominal = futureValue;
    } else if (mode === "annuity") {
      totalNominal = payment * n;
    } else {
      const g = growthRate / 100;
      let sum = 0;
      for (let i = 0; i < n; i++) sum += payment * Math.pow(1 + g, i);
      totalNominal = sum;
    }

    const totalDiscount = totalNominal - presentValue;
    const discountFactor = r === 0 ? 1 : presentValue / totalNominal;

    // Year-by-year discount table (value going backwards from future)
    const breakdown: { year: number; discountFactor: number; presentValueAtYear: number; discountedAmount: number }[] = [];
    for (let y = 1; y <= n; y++) {
      const df = 1 / Math.pow(1 + r, y);
      let pvAtYear = 0;
      if (mode === "single") {
        pvAtYear = futureValue * df;
      } else if (mode === "annuity") {
        // PV of first y payments
        if (r === 0) {
          pvAtYear = payment * y;
        } else {
          pvAtYear = payment * ((1 - Math.pow(1 + r, -y)) / r);
        }
        if (annuityType === "due") pvAtYear *= (1 + r);
      } else {
        const g = growthRate / 100;
        if (Math.abs(r - g) < 1e-10) {
          pvAtYear = payment * y / (1 + r);
        } else {
          pvAtYear = payment * (1 - Math.pow((1 + g) / (1 + r), y)) / (r - g);
        }
        if (annuityType === "due") pvAtYear *= (1 + r);
      }
      breakdown.push({
        year: y,
        discountFactor: df,
        presentValueAtYear: pvAtYear,
        discountedAmount: (mode === "single" ? futureValue : 0) - pvAtYear,
      });
    }

    // PV at different discount rates for chart
    const ratePoints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15];
    const chartData = ratePoints.map(rp => {
      const rr = rp / 100;
      let pv = 0;
      if (mode === "single") {
        pv = futureValue / Math.pow(1 + rr, n);
      } else if (mode === "annuity") {
        if (rr === 0) {
          pv = payment * n;
        } else {
          pv = payment * ((1 - Math.pow(1 + rr, -n)) / rr);
        }
        if (annuityType === "due") pv *= (1 + rr);
      } else {
        const g = growthRate / 100;
        if (Math.abs(rr - g) < 1e-10) {
          pv = payment * n / (1 + rr);
        } else {
          pv = payment * (1 - Math.pow((1 + g) / (1 + rr), n)) / (rr - g);
        }
        if (annuityType === "due") pv *= (1 + rr);
      }
      return { rate: rp, pv };
    });

    // Real-world: $1M in 30 years
    const millionExamples = [3, 5, 7, 10].map(rp => ({
      rate: rp,
      pv: 1000000 / Math.pow(1 + rp / 100, 30),
    }));

    return { presentValue, totalDiscount, discountFactor, totalNominal, breakdown, chartData, millionExamples };
  }, [mode, futureValue, rate, periods, payment, growthRate, annuityType]);

  // SVG chart
  const chartW = 600;
  const chartH = 280;
  const pad = { top: 20, right: 20, bottom: 40, left: 70 };
  const innerW = chartW - pad.left - pad.right;
  const innerH = chartH - pad.top - pad.bottom;

  const maxPV = Math.max(...result.chartData.map(d => d.pv), 1);
  const maxRate = Math.max(...result.chartData.map(d => d.rate), 1);

  const toX = (r: number) => pad.left + (r / maxRate) * innerW;
  const toY = (pv: number) => pad.top + innerH - (pv / maxPV) * innerH;

  const linePath = result.chartData
    .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.rate).toFixed(1)},${toY(d.pv).toFixed(1)}`)
    .join(" ");

  const areaPath = linePath + ` L${toX(result.chartData[result.chartData.length - 1].rate).toFixed(1)},${(pad.top + innerH).toFixed(1)} L${toX(0).toFixed(1)},${(pad.top + innerH).toFixed(1)} Z`;

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const modeBtnCls = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"}`;

  return (
    <ToolLayout
      title="Present Value Calculator"
      description="Calculate the present value of a future sum, annuity, or growing annuity. Understand how much future money is worth today using time value of money principles."
      slug="present-value-calculator"
      category="Finance"
      keywords={[
        "present value calculator",
        "PV calculator",
        "time value of money calculator",
        "discount rate calculator",
        "annuity present value calculator",
        "net present value",
        "future value to present value",
      ]}
      faqs={[
        {
          question: "What is present value and why does it matter?",
          answer:
            "Present value (PV) is the current worth of a future sum of money or stream of cash flows, given a specified rate of return. It matters because a dollar today is worth more than a dollar in the future due to its earning potential — this is the core principle of the time value of money. Present value calculations are essential for comparing investment opportunities, valuing bonds, evaluating business projects, and making informed financial decisions.",
        },
        {
          question: "What is the difference between an ordinary annuity and an annuity due?",
          answer:
            "An ordinary annuity makes payments at the end of each period (e.g., most bond coupon payments), while an annuity due makes payments at the beginning of each period (e.g., rent or lease payments). An annuity due is always worth more than an otherwise identical ordinary annuity because each payment is received one period sooner, giving it more time to earn returns. The present value of an annuity due equals the ordinary annuity PV multiplied by (1 + r).",
        },
        {
          question: "How do I choose the right discount rate?",
          answer:
            "The discount rate should reflect the opportunity cost of capital — the return you could earn on an alternative investment of similar risk. For risk-free comparisons, use Treasury bond yields. For business projects, use the company's weighted average cost of capital (WACC). For personal finance, use the expected return of your investment portfolio. Higher-risk cash flows warrant higher discount rates to account for uncertainty.",
        },
        {
          question: "What is a growing annuity and when do I use it?",
          answer:
            "A growing annuity is a series of payments that increase at a constant rate each period. It's used to model cash flows that grow over time, such as salary income that receives annual raises, rental income with built-in escalation clauses, or dividend streams from growing companies. The growth rate must be less than the discount rate for the formula to converge to a finite present value.",
        },
        {
          question: "How does the discount rate affect present value?",
          answer:
            "Present value and the discount rate have an inverse relationship: as the discount rate increases, the present value decreases. At a 3% discount rate, $1,000,000 in 30 years is worth about $412,000 today. At 7%, it drops to roughly $131,000, and at 10% it's only about $57,000. This dramatic sensitivity to the discount rate is why choosing the correct rate is the most critical assumption in any present value analysis.",
        },
        {
          question: "What is a discount factor?",
          answer:
            "A discount factor is a multiplier used to convert a future cash flow to its present value. It is calculated as 1 / (1 + r)^n, where r is the discount rate and n is the number of periods. For example, at a 5% annual rate, the 10-year discount factor is 1 / (1.05)^10 = 0.6139, meaning $1 received in 10 years is worth about $0.61 today. Discount factors always range between 0 and 1 and decrease as the rate or time period increases.",
        },
      ]}
      relatedTools={[
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
      ]}
      guide={
        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-2xl font-display text-zinc-100">How to Use the Present Value Calculator</h2>
          <p>
            This calculator helps you determine what future money is worth in today&apos;s dollars. Select your calculation mode, enter the relevant values, and instantly see the present value along with a detailed year-by-year breakdown and visual chart.
          </p>
          <h3 className="text-lg font-semibold text-zinc-100">Calculation Modes</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Single Future Sum:</strong> Discounts a single lump-sum amount received in the future back to today. Use the formula PV = FV / (1 + r)^n.</li>
            <li><strong>Annuity:</strong> Calculates the present value of a series of equal periodic payments, such as loan payments or bond coupons.</li>
            <li><strong>Growing Annuity:</strong> Values a series of payments that increase at a constant growth rate each period, useful for modeling salary or dividend streams.</li>
          </ul>
          <h3 className="text-lg font-semibold text-zinc-100">Reading the Results</h3>
          <p>
            The <strong>present value</strong> tells you what the future cash flow is worth today. The <strong>total discount</strong> shows how much value is lost to time. The <strong>discount factor</strong> is the ratio of present value to the nominal future amount. Use the chart to see how sensitive your result is to different discount rates.
          </p>
        </div>
      }
    >
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className={modeBtnCls(mode === "single")} onClick={() => setMode("single")}>Single Future Sum</button>
        <button className={modeBtnCls(mode === "annuity")} onClick={() => setMode("annuity")}>Annuity</button>
        <button className={modeBtnCls(mode === "growing-annuity")} onClick={() => setMode("growing-annuity")}>Growing Annuity</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {mode === "single" && (
            <div>
              <label className={labelCls}>Future Value ($)</label>
              <input type="number" value={futureValue} onChange={e => setFutureValue(+e.target.value)} className={inputCls} min={0} step={1000} />
            </div>
          )}
          {(mode === "annuity" || mode === "growing-annuity") && (
            <div>
              <label className={labelCls}>Payment Amount per Period ($)</label>
              <input type="number" value={payment} onChange={e => setPayment(+e.target.value)} className={inputCls} min={0} step={100} />
            </div>
          )}
          <div>
            <label className={labelCls}>Discount / Interest Rate (%)</label>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={50} step={0.1} />
          </div>
          {mode === "growing-annuity" && (
            <div>
              <label className={labelCls}>Payment Growth Rate (%)</label>
              <input type="number" value={growthRate} onChange={e => setGrowthRate(+e.target.value)} className={inputCls} min={0} max={49} step={0.1} />
              <p className="text-xs text-zinc-500 mt-1">Must be less than the discount rate</p>
            </div>
          )}
          <div>
            <label className={labelCls}>Number of Periods (years)</label>
            <input type="number" value={periods} onChange={e => setPeriods(Math.max(1, Math.min(100, +e.target.value)))} className={inputCls} min={1} max={100} />
          </div>
          {(mode === "annuity" || mode === "growing-annuity") && (
            <div>
              <label className={labelCls}>Annuity Type</label>
              <div className="flex gap-2">
                <button
                  className={modeBtnCls(annuityType === "ordinary")}
                  onClick={() => setAnnuityType("ordinary")}
                >
                  Ordinary (end of period)
                </button>
                <button
                  className={modeBtnCls(annuityType === "due")}
                  onClick={() => setAnnuityType("due")}
                >
                  Due (beginning of period)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Present Value</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.presentValue)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Nominal Amount</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(result.totalNominal)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Discount</p>
              <p className="text-lg font-semibold text-yellow-400">{fmtC(result.totalDiscount)}</p>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Discount Factor</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-full overflow-hidden h-4 bg-zinc-700">
                <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.max(0, Math.min(100, result.discountFactor * 100))}%` }} />
              </div>
              <span className="text-sm text-zinc-300 font-mono w-16 text-right">{fmtP(result.discountFactor)}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Every $1.00 in the future is worth ${result.discountFactor.toFixed(4)} today
            </p>
          </div>
        </div>
      </div>

      {/* SVG Chart: PV at different discount rates */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Present Value at Different Discount Rates</h3>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: 320 }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const y = pad.top + innerH * (1 - frac);
              const val = maxPV * frac;
              return (
                <g key={frac}>
                  <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="#3f3f46" strokeWidth={0.5} />
                  <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="#71717a" fontSize={10}>
                    ${(val / 1000).toFixed(0)}k
                  </text>
                </g>
              );
            })}
            {/* X-axis labels */}
            {result.chartData.filter((_, i) => i % 2 === 0 || i === result.chartData.length - 1).map(d => (
              <text key={d.rate} x={toX(d.rate)} y={pad.top + innerH + 20} textAnchor="middle" fill="#71717a" fontSize={10}>
                {d.rate}%
              </text>
            ))}
            {/* Area */}
            <path d={areaPath} fill="url(#pvGradient)" opacity={0.3} />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {/* Current rate dot */}
            {rate >= 0 && rate <= maxRate && (
              <circle cx={toX(rate)} cy={toY(result.presentValue)} r={5} fill="#3b82f6" stroke="#1e3a5f" strokeWidth={2} />
            )}
            {/* Axis labels */}
            <text x={pad.left + innerW / 2} y={chartH - 4} textAnchor="middle" fill="#a1a1aa" fontSize={11}>Discount Rate</text>
            <defs>
              <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Real-world example: $1M in 30 years */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">What Is $1,000,000 in 30 Years Worth Today?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {result.millionExamples.map(ex => (
            <div key={ex.rate} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">At {ex.rate}% rate</p>
              <p className="text-xl font-bold text-blue-400">{fmtC(ex.pv)}</p>
              <p className="text-xs text-zinc-500 mt-1">{((ex.pv / 1000000) * 100).toFixed(1)}% of face value</p>
            </div>
          ))}
        </div>
      </div>

      {/* Year-by-year table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Year-by-Year Discount Table</h3>
        <div className="max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-800">
              <tr className="text-zinc-400 text-left">
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Discount Factor</th>
                <th className="px-3 py-2">Present Value</th>
                {mode === "single" && <th className="px-3 py-2">Discount Amount</th>}
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map(row => (
                <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                  <td className="px-3 py-1.5">{row.year}</td>
                  <td className="px-3 py-1.5 font-mono">{fmtP(row.discountFactor)}</td>
                  <td className="px-3 py-1.5">{fmtC(row.presentValueAtYear)}</td>
                  {mode === "single" && (
                    <td className="px-3 py-1.5 text-yellow-400">{fmtC(row.discountedAmount)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}
