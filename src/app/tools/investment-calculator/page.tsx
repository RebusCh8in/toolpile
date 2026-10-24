"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

export default function Page() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(8);
  const [inflation, setInflation] = useState(3);

  const result = useMemo(() => {
    const monthlyReturn = returnRate / 100 / 12;
    const realReturn = ((1 + returnRate / 100) / (1 + inflation / 100) - 1) / 12;
    const months = years * 12;
    const yearly: { year: number; nominal: number; real: number; contributions: number }[] = [];

    let nominal = initial;
    let real = initial;
    let totalContributions = initial;

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        nominal = nominal * (1 + monthlyReturn) + monthly;
        real = real * (1 + realReturn) + monthly;
        totalContributions += monthly;
      }
      yearly.push({ year: y, nominal, real, contributions: totalContributions });
    }

    const totalGrowth = nominal - totalContributions;
    const realGrowth = real - totalContributions;

    return { nominal, real, totalContributions, totalGrowth, realGrowth, yearly };
  }, [initial, monthly, years, returnRate, inflation]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Investment Calculator"
      description="Project your investment growth over time with regular contributions. See nominal and inflation-adjusted returns side by side."
      slug="investment-calculator"
      category="Finance"
      keywords={["investment calculator", "investment growth calculator", "stock market calculator", "investment return calculator", "portfolio growth calculator"]}
      faqs={[
        { question: "What return rate should I use?", answer: "The S&P 500 has averaged ~10% annually since 1926. After inflation, that's ~7%. Use 7-8% for a diversified stock portfolio, 4-5% for bonds, or blend based on your asset allocation." },
        { question: "Why show inflation-adjusted values?", answer: "Inflation reduces your purchasing power over time. $1,000,000 in 30 years will buy much less than $1,000,000 today. The 'real' value shows what your future money is worth in today's dollars." },
        { question: "Are investment returns guaranteed?", answer: "No. This calculator assumes a fixed annual return for projection purposes. Real stock market returns vary significantly year to year and can be negative. These projections are for planning, not guarantees." },
        { question: "Should I invest or pay off debt?", answer: "Generally, pay off high-interest debt (>7%) first. If your debt rate is lower than expected investment returns, investing may make more mathematical sense — but being debt-free has psychological value too." },
      ]}
      relatedTools={[
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Initial Investment ($)</label>
            <input type="number" value={initial} onChange={e => setInitial(+e.target.value)} className={inputCls} min={0} step={1000} />
          </div>
          <div>
            <label className={labelCls}>Monthly Contribution ($)</label>
            <input type="number" value={monthly} onChange={e => setMonthly(+e.target.value)} className={inputCls} min={0} step={50} />
          </div>
          <div>
            <label className={labelCls}>Time Period (years)</label>
            <input type="number" value={years} onChange={e => setYears(Math.min(50, +e.target.value))} className={inputCls} min={1} max={50} />
            <div className="flex flex-wrap gap-2 mt-2">
              {[5, 10, 15, 20, 25, 30].map(y => (
                <button key={y} onClick={() => setYears(y)} className={`px-3 py-1 rounded-lg text-xs transition-colors ${years === y ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{y}yr</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Expected Annual Return (%)</label>
            <input type="number" value={returnRate} onChange={e => setReturnRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.5} />
          </div>
          <div>
            <label className={labelCls}>Expected Inflation (%)</label>
            <input type="number" value={inflation} onChange={e => setInflation(+e.target.value)} className={inputCls} min={0} max={15} step={0.5} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Future Value</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.nominal)}</p>
            <p className="text-sm text-zinc-500 mt-1">In today&apos;s dollars: <span className="text-zinc-300">{fmtC(result.real)}</span></p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Contributed</p>
              <p className="text-sm font-semibold text-green-400">{fmtC(result.totalContributions)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Growth</p>
              <p className="text-sm font-semibold text-yellow-400">{fmtC(result.totalGrowth)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Real Growth</p>
              <p className="text-sm font-semibold text-zinc-300">{fmtC(result.realGrowth)}</p>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Growth Breakdown</p>
            <div className="flex rounded-full overflow-hidden h-4">
              <div className="bg-green-500" style={{ width: `${(result.totalContributions / result.nominal) * 100}%` }} />
              <div className="bg-yellow-500" style={{ width: `${(result.totalGrowth / result.nominal) * 100}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Contributions ({((result.totalContributions / result.nominal) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Investment Growth ({((result.totalGrowth / result.nominal) * 100).toFixed(0)}%)</span>
            </div>
          </div>

          {/* Return comparison */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Return Rate Comparison ({years}yr)</p>
            <div className="space-y-1">
              {[4, 6, 7, 8, 10, 12].map(r => {
                const mr = r / 100 / 12;
                let b = initial;
                for (let m = 0; m < years * 12; m++) b = b * (1 + mr) + monthly;
                const isActive = Math.abs(r - returnRate) < 0.01;
                return (
                  <div key={r} className={`flex justify-between text-sm px-2 py-1 rounded ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{r}% return</span>
                    <span className="font-medium">{fmtC(b)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <details className="mt-8">
        <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">Year-by-Year Projection</summary>
        <div className="mt-4 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-800">
              <tr className="text-zinc-400 text-left">
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Nominal Value</th>
                <th className="px-3 py-2">Real Value</th>
                <th className="px-3 py-2">Contributed</th>
              </tr>
            </thead>
            <tbody>
              {result.yearly.map(row => (
                <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                  <td className="px-3 py-1.5">{row.year}</td>
                  <td className="px-3 py-1.5">{fmtC(row.nominal)}</td>
                  <td className="px-3 py-1.5">{fmtC(row.real)}</td>
                  <td className="px-3 py-1.5">{fmtC(row.contributions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </ToolLayout>
  );
}
