"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

export default function Page() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [inflation, setInflation] = useState(3);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const result = useMemo(() => {
    const yearsToRetire = Math.max(0, retireAge - currentAge);
    const monthlyReturn = annualReturn / 100 / 12;
    const months = yearsToRetire * 12;

    // Growth simulation
    const yearly: { age: number; balance: number; contributions: number; growth: number }[] = [];
    let balance = currentSavings;
    let totalContributions = currentSavings;
    let totalGrowth = 0;

    for (let y = 0; y < yearsToRetire; y++) {
      for (let m = 0; m < 12; m++) {
        const growth = balance * monthlyReturn;
        balance += growth + monthlyContribution;
        totalGrowth += growth;
        totalContributions += monthlyContribution;
      }
      yearly.push({ age: currentAge + y + 1, balance, contributions: totalContributions, growth: totalGrowth });
    }

    const realReturn = ((1 + annualReturn / 100) / (1 + inflation / 100)) - 1;
    const realBalance = currentSavings * Math.pow(1 + realReturn, yearsToRetire);
    // Simplified real balance with contributions
    let realBal = currentSavings;
    const monthlyReal = realReturn / 12;
    for (let m = 0; m < months; m++) {
      realBal = realBal * (1 + monthlyReal) + monthlyContribution;
    }

    const annualIncome = balance * (withdrawalRate / 100);
    const monthlyIncome = annualIncome / 12;
    const realAnnualIncome = realBal * (withdrawalRate / 100);
    const realMonthlyIncome = realAnnualIncome / 12;

    // How long will savings last at withdrawal rate if no growth?
    const yearsLast = withdrawalRate > 0 ? 100 / withdrawalRate : Infinity;

    return { balance, totalContributions, totalGrowth, annualIncome, monthlyIncome, realBalance: realBal, realMonthlyIncome, yearsToRetire, yearly, yearsLast };
  }, [currentAge, retireAge, currentSavings, monthlyContribution, annualReturn, inflation, withdrawalRate]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Retirement Calculator"
      description="Calculate how much you need to retire. See projected savings growth, withdrawal income, and the impact of inflation on your retirement funds."
      slug="retirement-calculator"
      category="Finance"
      keywords={["retirement calculator", "retirement savings calculator", "401k calculator", "retirement planning calculator", "how much to retire"]}
      faqs={[
        { question: "What is the 4% rule?", answer: "The 4% rule suggests you can withdraw 4% of your retirement savings annually without running out over a 30-year retirement. For example, $1,000,000 in savings would provide $40,000/year. It's a starting point, not a guarantee." },
        { question: "What rate of return should I use?", answer: "The S&P 500 has averaged about 10% annually before inflation, or ~7% after inflation. Use 7% for a realistic estimate, 10% for optimistic, or 5% for conservative projections." },
        { question: "How does inflation affect retirement?", answer: "Inflation erodes purchasing power over time. $1,000,000 in 35 years will buy roughly what $350,000 buys today at 3% inflation. Always consider the 'real' (inflation-adjusted) value of your savings." },
        { question: "How much do I need to retire?", answer: "A common rule of thumb is 25× your annual expenses (inverse of the 4% rule). If you spend $60,000/year, aim for $1,500,000. But this varies based on retirement age, lifestyle, and other income sources like Social Security." },
      ]}
      relatedTools={[
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Current Age</label>
              <input type="number" value={currentAge} onChange={e => setCurrentAge(+e.target.value)} className={inputCls} min={18} max={80} />
            </div>
            <div>
              <label className={labelCls}>Retirement Age</label>
              <input type="number" value={retireAge} onChange={e => setRetireAge(+e.target.value)} className={inputCls} min={currentAge + 1} max={100} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Current Savings ($)</label>
            <input type="number" value={currentSavings} onChange={e => setCurrentSavings(+e.target.value)} className={inputCls} min={0} step={1000} />
          </div>
          <div>
            <label className={labelCls}>Monthly Contribution ($)</label>
            <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(+e.target.value)} className={inputCls} min={0} step={50} />
          </div>
          <div>
            <label className={labelCls}>Expected Annual Return (%)</label>
            <input type="number" value={annualReturn} onChange={e => setAnnualReturn(+e.target.value)} className={inputCls} min={0} max={20} step={0.5} />
          </div>
          <div>
            <label className={labelCls}>Expected Inflation (%)</label>
            <input type="number" value={inflation} onChange={e => setInflation(+e.target.value)} className={inputCls} min={0} max={15} step={0.5} />
          </div>
          <div>
            <label className={labelCls}>Withdrawal Rate (%)</label>
            <input type="number" value={withdrawalRate} onChange={e => setWithdrawalRate(+e.target.value)} className={inputCls} min={1} max={10} step={0.5} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Projected Savings at {retireAge}</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.balance)}</p>
            <p className="text-xs text-zinc-500 mt-1">{fmtC(result.realBalance)} in today&apos;s dollars</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Monthly Income</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(result.monthlyIncome)}</p>
              <p className="text-xs text-zinc-600">{fmtC(result.realMonthlyIncome)} real</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Annual Income</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(result.annualIncome)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Contributed</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalContributions)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Investment Growth</p>
              <p className="text-lg font-semibold text-yellow-400">{fmtC(result.totalGrowth)}</p>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Savings Composition</p>
            <div className="flex rounded-full overflow-hidden h-4">
              <div className="bg-blue-500" style={{ width: `${(result.totalContributions / result.balance) * 100}%` }} />
              <div className="bg-yellow-500" style={{ width: `${(result.totalGrowth / result.balance) * 100}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Contributions</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Growth</span>
            </div>
          </div>
          <p className="text-xs text-zinc-600">At {withdrawalRate}% withdrawal, savings would last ~{Math.round(result.yearsLast)} years without growth</p>
        </div>
      </div>

      {/* Year-by-year projection */}
      {result.yearly.length > 0 && (
        <details className="mt-8">
          <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">Year-by-Year Projection ({result.yearsToRetire} years)</summary>
          <div className="mt-4 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-800">
                <tr className="text-zinc-400 text-left">
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">Balance</th>
                  <th className="px-3 py-2">Contributions</th>
                  <th className="px-3 py-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {result.yearly.map(row => (
                  <tr key={row.age} className="border-t border-zinc-800 text-zinc-300">
                    <td className="px-3 py-1.5">{row.age}</td>
                    <td className="px-3 py-1.5">{fmtC(row.balance)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.contributions)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.growth)}</td>
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
