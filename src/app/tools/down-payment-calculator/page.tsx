"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

export default function Page() {
  const [homePrice, setHomePrice] = useState(350000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);

  const result = useMemo(() => {
    const downPayment = homePrice * (downPct / 100);
    const loanAmount = homePrice - downPayment;
    const r = rate / 100 / 12;
    const n = termYears * 12;
    const monthlyPayment = r === 0 ? loanAmount / n : loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - loanAmount;
    const needsPMI = downPct < 20;
    const pmi = needsPMI ? (loanAmount * 0.005) / 12 : 0; // ~0.5% annual PMI estimate

    return { downPayment, loanAmount, monthlyPayment, totalInterest, totalPaid, needsPMI, pmi };
  }, [homePrice, downPct, rate, termYears]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const pctPresets = [3, 5, 10, 15, 20, 25];

  return (
    <ToolLayout
      title="Down Payment Calculator"
      description="Calculate your down payment amount and see how it affects your mortgage payment, interest, and PMI requirements."
      slug="down-payment-calculator"
      category="Finance"
      keywords={["down payment calculator", "house down payment calculator", "mortgage down payment calculator", "how much down payment"]}
      faqs={[
        { question: "How much down payment do I need?", answer: "Conventional loans require 3-20%. FHA loans require 3.5%. VA and USDA loans allow 0% down. Putting 20% down avoids Private Mortgage Insurance (PMI), which adds 0.3-1.5% of the loan annually." },
        { question: "Is a bigger down payment always better?", answer: "Usually yes — it means a smaller loan, lower payments, less interest, and no PMI at 20%. But don't drain your emergency fund. A 10-15% down payment is often a good balance." },
        { question: "What is PMI?", answer: "Private Mortgage Insurance protects the lender if you default. Required when down payment is under 20%. Costs 0.3-1.5% of loan annually ($50-200+/month). Can be removed once you reach 20% equity." },
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Home Price ($)</label><input type="number" value={homePrice} onChange={e => setHomePrice(+e.target.value)} className={inputCls} min={0} step={5000} /></div>
          <div>
            <label className={labelCls}>Down Payment (%)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {pctPresets.map(p => (
                <button key={p} onClick={() => setDownPct(p)} className={`px-2.5 py-1 rounded text-xs transition-colors ${downPct === p ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{p}%</button>
              ))}
            </div>
            <input type="number" value={downPct} onChange={e => setDownPct(+e.target.value)} className={inputCls} min={0} max={100} step={0.5} />
          </div>
          <div><label className={labelCls}>Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={15} step={0.125} /></div>
          <div><label className={labelCls}>Loan Term (years)</label><input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} className={inputCls} min={1} max={50} /></div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Down Payment</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.downPayment)}</p>
            <p className="text-xs text-zinc-500 mt-1">{downPct}% of {fmtC(homePrice)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Loan Amount</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.loanAmount)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Monthly P&I</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.monthlyPayment)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Interest</p><p className="text-lg font-semibold text-red-400">{fmtC(result.totalInterest)}</p></div>
            <div className={`border rounded-lg p-3 ${result.needsPMI ? "bg-yellow-500/10 border-yellow-500/20" : "bg-green-500/10 border-green-500/20"}`}>
              <p className={`text-xs ${result.needsPMI ? "text-yellow-300" : "text-green-300"}`}>PMI</p>
              <p className={`text-lg font-semibold ${result.needsPMI ? "text-yellow-400" : "text-green-400"}`}>{result.needsPMI ? `~${fmtC(result.pmi)}/mo` : "None"}</p>
            </div>
          </div>

          {/* Down payment comparison */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Down Payment Comparison</p>
            <div className="space-y-1">
              {pctPresets.map(pct => {
                const dp = homePrice * (pct / 100);
                const loan = homePrice - dp;
                const r2 = rate / 100 / 12;
                const n = termYears * 12;
                const pmt = r2 === 0 ? loan / n : loan * (r2 * Math.pow(1 + r2, n)) / (Math.pow(1 + r2, n) - 1);
                const active = pct === downPct;
                return (
                  <div key={pct} className={`flex justify-between text-sm px-2 py-1 rounded ${active ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{pct}%</span>
                    <span>Down: {fmtC(dp)}</span>
                    <span>{fmtC(pmt)}/mo</span>
                    <span>{pct < 20 ? "PMI" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
