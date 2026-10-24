"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

export default function Page() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(65);
  const [currentBalance, setCurrentBalance] = useState(25000);
  const [annualContrib, setAnnualContrib] = useState(10000);
  const [employerMatch, setEmployerMatch] = useState(50);
  const [matchLimit, setMatchLimit] = useState(6);
  const [salary, setSalary] = useState(75000);
  const [returnRate, setReturnRate] = useState(7);

  const result = useMemo(() => {
    const years = retireAge - currentAge;
    if (years <= 0) return null;
    const matchAmount = Math.min(annualContrib, salary * (matchLimit / 100)) * (employerMatch / 100);
    const totalAnnual = annualContrib + matchAmount;
    const r = returnRate / 100;

    let balance = currentBalance;
    const yearly: { age: number; contrib: number; match: number; growth: number; balance: number }[] = [];

    for (let y = 0; y < years; y++) {
      const growth = balance * r;
      balance += growth + totalAnnual;
      yearly.push({
        age: currentAge + y + 1,
        contrib: annualContrib,
        match: matchAmount,
        growth,
        balance,
      });
    }

    const totalContributed = annualContrib * years;
    const totalMatch = matchAmount * years;
    const totalGrowth = balance - currentBalance - totalContributed - totalMatch;

    return { balance, totalContributed, totalMatch, totalGrowth, matchAmount, years, yearly };
  }, [currentAge, retireAge, currentBalance, annualContrib, employerMatch, matchLimit, salary, returnRate]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="401(k) Calculator"
      description="Calculate how much your 401(k) will be worth at retirement. Includes employer match, annual contributions, and investment growth."
      slug="401k-calculator"
      category="Finance"
      keywords={["401k calculator", "retirement calculator", "401k retirement calculator", "401k growth calculator", "employer match calculator"]}
      faqs={[
        { question: "How much should I contribute to my 401(k)?", answer: "At minimum, contribute enough to get the full employer match — that's free money. The 2026 contribution limit is $23,500 ($31,000 if 50+). Financial advisors generally recommend saving 15% of income for retirement." },
        { question: "What is employer match?", answer: "Many employers match a percentage of your 401(k) contributions. A common match is 50% of contributions up to 6% of salary. On a $75K salary, that's $2,250/year in free money." },
        { question: "What return rate should I use?", answer: "The S&P 500 has averaged ~10% annually, or ~7% after inflation. Use 7% for a realistic inflation-adjusted estimate, or 10% for nominal returns. Be conservative for planning purposes." },
      ]}
      relatedTools={[
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Current Age</label><input type="number" value={currentAge} onChange={e => setCurrentAge(+e.target.value)} className={inputCls} min={18} max={80} /></div>
            <div><label className={labelCls}>Retirement Age</label><input type="number" value={retireAge} onChange={e => setRetireAge(+e.target.value)} className={inputCls} min={currentAge + 1} max={90} /></div>
          </div>
          <div><label className={labelCls}>Current 401(k) Balance ($)</label><input type="number" value={currentBalance} onChange={e => setCurrentBalance(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div><label className={labelCls}>Annual Salary ($)</label><input type="number" value={salary} onChange={e => setSalary(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div><label className={labelCls}>Your Annual Contribution ($)</label><input type="number" value={annualContrib} onChange={e => setAnnualContrib(+e.target.value)} className={inputCls} min={0} max={31000} step={500} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Employer Match (%)</label><input type="number" value={employerMatch} onChange={e => setEmployerMatch(+e.target.value)} className={inputCls} min={0} max={100} step={5} /></div>
            <div><label className={labelCls}>Match Up To (% of Salary)</label><input type="number" value={matchLimit} onChange={e => setMatchLimit(+e.target.value)} className={inputCls} min={0} max={100} step={1} /></div>
          </div>
          <div><label className={labelCls}>Expected Annual Return (%)</label><input type="number" value={returnRate} onChange={e => setReturnRate(+e.target.value)} className={inputCls} min={0} max={20} step={0.5} /></div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Balance at Age {retireAge}</p>
              <p className="text-4xl font-bold text-blue-400">{fmtC(result.balance)}</p>
              <p className="text-xs text-zinc-500 mt-1">{result.years} years of growth</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Your Contributions</p>
                <p className="text-lg font-semibold text-blue-400">{fmtC(result.totalContributed)}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-xs text-green-300">Employer Match</p>
                <p className="text-lg font-semibold text-green-400">{fmtC(result.totalMatch)}</p>
                <p className="text-xs text-green-400/60">{fmtC(result.matchAmount)}/yr</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 col-span-2">
                <p className="text-xs text-zinc-500">Investment Growth</p>
                <p className="text-lg font-semibold text-yellow-400">{fmtC(result.totalGrowth)}</p>
              </div>
            </div>

            {/* Visual breakdown */}
            {result.balance > 0 && (
              <div>
                <div className="flex rounded-lg overflow-hidden h-6">
                  <div className="bg-blue-500" style={{ width: `${((currentBalance + result.totalContributed) / result.balance) * 100}%` }} />
                  <div className="bg-green-500" style={{ width: `${(result.totalMatch / result.balance) * 100}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${(result.totalGrowth / result.balance) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>Contributions</span>
                  <span>Match</span>
                  <span>Growth</span>
                </div>
              </div>
            )}

            {result.yearly.length <= 40 && (
              <details>
                <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">Year-by-Year Projection</summary>
                <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-800"><tr className="border-b border-zinc-700 text-zinc-500"><th className="text-left p-2">Age</th><th className="text-right p-2">Contrib</th><th className="text-right p-2">Match</th><th className="text-right p-2">Growth</th><th className="text-right p-2">Balance</th></tr></thead>
                    <tbody>
                      {result.yearly.map(r => (
                        <tr key={r.age} className="border-b border-zinc-800">
                          <td className="p-2 text-zinc-300">{r.age}</td>
                          <td className="text-right p-2 text-blue-400">{fmtC(r.contrib)}</td>
                          <td className="text-right p-2 text-green-400">{fmtC(r.match)}</td>
                          <td className="text-right p-2 text-yellow-400">{fmtC(r.growth)}</td>
                          <td className="text-right p-2 text-zinc-100">{fmtC(r.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>
        )}
      </div>

    </ToolLayout>
  );
}
