"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [principal, setPrincipal] = useState(5000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(3);

  const interest = principal * (rate / 100) * years;
  const total = principal + interest;
  const monthlyInterest = interest / (years * 12 || 1);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Simple Interest Calculator"
      description="Calculate simple interest on a principal amount. See total interest, monthly interest, and compare with compound interest."
      slug="simple-interest-calculator"
      category="Finance"
      keywords={["simple interest calculator", "simple interest formula", "calculate simple interest", "interest calculator"]}
      faqs={[
        { question: "What is simple interest?", answer: "Simple interest is calculated only on the original principal: I = P × r × t. Unlike compound interest, you don't earn interest on accumulated interest. It's commonly used for short-term loans and some bonds." },
        { question: "Simple vs compound interest?", answer: "$5,000 at 5% for 3 years: Simple = $750 interest. Compound (monthly) = $808. The difference grows with time — over 20 years: Simple = $5,000 vs Compound = $8,193." },
        { question: "Where is simple interest used?", answer: "Auto loans, some personal loans, Treasury bills, certificates of deposit (sometimes), and short-term commercial loans typically use simple interest calculations." },
      ]}
      relatedTools={[
        { name: "Interest Calculator", href: "/tools/interest-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Principal ($)</label><input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} className={inputCls} min={0} step={100} /></div>
          <div><label className={labelCls}>Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={50} step={0.1} /></div>
          <div><label className={labelCls}>Time Period (years)</label><input type="number" value={years} onChange={e => setYears(+e.target.value)} className={inputCls} min={0.1} max={50} step={0.5} /></div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm">
            <p className="text-zinc-500 mb-1">Formula</p>
            <p className="text-zinc-300 font-mono">I = P × r × t</p>
            <p className="text-zinc-300 font-mono">I = {fmtC(principal)} × {(rate / 100).toFixed(4)} × {years}</p>
            <p className="text-blue-400 font-mono font-semibold">I = {fmtC(interest)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Total Amount</p>
            <p className="text-5xl font-bold text-blue-400">{fmtC(total)}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Principal</p><p className="text-lg font-semibold text-zinc-100">{fmtC(principal)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Interest</p><p className="text-lg font-semibold text-green-400">{fmtC(interest)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Monthly Interest</p><p className="text-lg font-semibold text-yellow-400">{fmtC(monthlyInterest)}</p></div>
          </div>

          {/* Simple vs Compound comparison */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Simple vs Compound Interest</p>
            <div className="space-y-1">
              {[1, 2, 3, 5, 10, 20].filter(y => y <= Math.max(years, 20)).map(y => {
                const si = principal * (rate / 100) * y;
                const ci = principal * Math.pow(1 + rate / 100 / 12, 12 * y) - principal;
                return (
                  <div key={y} className={`flex justify-between text-sm px-2 py-1 rounded ${y === years ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{y}yr</span>
                    <span>Simple: {fmtC(si)}</span>
                    <span>Compound: {fmtC(ci)}</span>
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
