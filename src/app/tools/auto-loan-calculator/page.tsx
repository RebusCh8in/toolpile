"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [price, setPrice] = useState(35000);
  const [downPayment, setDownPayment] = useState(5000);
  const [tradeIn, setTradeIn] = useState(0);
  const [rate, setRate] = useState(5.9);
  const [term, setTerm] = useState(60);
  const [salesTax, setSalesTax] = useState(7);

  const result = useMemo(() => {
    const taxable = Math.max(0, price - tradeIn);
    const tax = taxable * (salesTax / 100);
    const loanAmount = Math.max(0, price + tax - downPayment - tradeIn);
    const monthlyRate = rate / 100 / 12;
    if (loanAmount <= 0 || term <= 0) return null;

    const monthly = monthlyRate === 0
      ? loanAmount / term
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPaid = monthly * term;
    const totalInterest = totalPaid - loanAmount;
    const totalCost = price + tax + totalInterest - tradeIn;

    return { loanAmount, monthly, totalPaid, totalInterest, totalCost, tax };
  }, [price, downPayment, tradeIn, rate, term, salesTax]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Auto Loan Calculator"
      description="Calculate your monthly car payment with down payment, trade-in, sales tax, and loan term. See total interest and true cost of ownership."
      slug="auto-loan-calculator"
      category="Finance"
      keywords={["auto loan calculator", "car payment calculator", "car loan calculator", "vehicle loan calculator", "monthly car payment calculator"]}
      faqs={[
        { question: "What is a good interest rate for a car loan?", answer: "As of 2026, good rates are 4-6% for new cars and 5-8% for used cars with good credit (700+). Rates above 10% are typically subprime. Credit unions often offer lower rates than dealership financing." },
        { question: "How much should I put down on a car?", answer: "20% is ideal for new cars, 10% for used cars. A larger down payment reduces your monthly payment, total interest, and the risk of being 'upside down' on the loan (owing more than the car is worth)." },
        { question: "Is a longer loan term better?", answer: "Longer terms (72-84 months) have lower monthly payments but cost significantly more in total interest. A 60-month loan is the sweet spot for most buyers — reasonable payments without excessive interest." },
        { question: "Does trade-in value reduce sales tax?", answer: "In most US states, yes. Sales tax is calculated on the price minus trade-in value. This calculator applies that deduction automatically." },
      ]}
      relatedTools={[
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Vehicle Price ($)</label>
            <input type="number" value={price} onChange={e => setPrice(+e.target.value)} className={inputCls} min={0} step={500} />
          </div>
          <div>
            <label className={labelCls}>Down Payment ($)</label>
            <input type="number" value={downPayment} onChange={e => setDownPayment(+e.target.value)} className={inputCls} min={0} step={500} />
          </div>
          <div>
            <label className={labelCls}>Trade-In Value ($)</label>
            <input type="number" value={tradeIn} onChange={e => setTradeIn(+e.target.value)} className={inputCls} min={0} step={500} />
          </div>
          <div>
            <label className={labelCls}>Interest Rate (%)</label>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.1} />
          </div>
          <div>
            <label className={labelCls}>Loan Term</label>
            <div className="grid grid-cols-4 gap-2">
              {[36, 48, 60, 72].map(m => (
                <button key={m} onClick={() => setTerm(m)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${term === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{m} mo</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Sales Tax (%)</label>
            <input type="number" value={salesTax} onChange={e => setSalesTax(+e.target.value)} className={inputCls} min={0} max={15} step={0.25} />
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-sm text-zinc-400 mb-1">Monthly Payment</p>
              <p className="text-4xl font-bold text-blue-400">{fmtC(result.monthly)}</p>
              <p className="text-xs text-zinc-500 mt-1">{term} months at {rate}% APR</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Loan Amount</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.loanAmount)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Sales Tax</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.tax)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Interest</p>
                <p className="text-lg font-semibold text-yellow-400">{fmtC(result.totalInterest)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">True Cost</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalCost)}</p>
              </div>
            </div>

            {/* Term comparison */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Term Comparison</p>
              <div className="space-y-1.5">
                {[36, 48, 60, 72, 84].map(m => {
                  const mr = rate / 100 / 12;
                  const la = result.loanAmount;
                  const mp = mr === 0 ? la / m : (la * mr * Math.pow(1 + mr, m)) / (Math.pow(1 + mr, m) - 1);
                  const ti = mp * m - la;
                  const isActive = m === term;
                  return (
                    <div key={m} className={`flex justify-between text-sm px-2 py-1 rounded ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                      <span>{m} mo</span>
                      <span>{fmtC(mp)}/mo</span>
                      <span className="text-yellow-400/70">{fmtC(ti)} interest</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
