"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [loanAmount, setLoanAmount] = useState(20000);
  const [interestRate, setInterestRate] = useState(5);
  const [termYears, setTermYears] = useState(5);
  const [fees, setFees] = useState(500);

  const result = useMemo(() => {
    const n = termYears * 12;
    const r = interestRate / 100 / 12;

    // Monthly payment (no fees)
    const payment = r === 0 ? loanAmount / n : loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = payment * n;
    const totalInterest = totalPaid - loanAmount;

    // APR calculation: effective rate including fees
    // Solve for APR where: actualLoan * APR_factor = payment (amortize loanAmount-fees at APR = payment)
    const actualReceived = loanAmount - fees;

    // Newton's method to find APR
    let aprGuess = interestRate / 100 / 12;
    for (let i = 0; i < 100; i++) {
      const f = actualReceived * (aprGuess * Math.pow(1 + aprGuess, n)) / (Math.pow(1 + aprGuess, n) - 1) - payment;
      const df = actualReceived * (
        (Math.pow(1 + aprGuess, n) * (1 + aprGuess * n / (1 + aprGuess)) * (Math.pow(1 + aprGuess, n) - 1) -
        aprGuess * Math.pow(1 + aprGuess, n) * n * Math.pow(1 + aprGuess, n - 1)) /
        Math.pow(Math.pow(1 + aprGuess, n) - 1, 2)
      );
      if (Math.abs(df) < 1e-15) break;
      aprGuess -= f / df;
      if (aprGuess < 0) aprGuess = 0.0001;
    }
    const apr = aprGuess * 12 * 100;
    const totalCost = totalPaid + fees;

    return { payment, totalInterest, totalPaid, apr, totalCost, actualReceived };
  }, [loanAmount, interestRate, termYears, fees]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="APR Calculator"
      description="Calculate the true Annual Percentage Rate (APR) of a loan including fees. Compare APR vs stated interest rate."
      slug="apr-calculator"
      category="Finance"
      keywords={["apr calculator", "annual percentage rate calculator", "loan apr calculator", "true cost of loan calculator", "effective interest rate calculator"]}
      faqs={[
        { question: "What is APR?", answer: "APR (Annual Percentage Rate) is the true yearly cost of a loan including interest and fees. It's always higher than the stated interest rate when there are fees. A 5% loan with $500 in fees on $20K has an APR of ~5.53%." },
        { question: "Why is APR different from interest rate?", answer: "APR includes all loan costs (origination fees, closing costs, points) spread over the loan term. A loan with a lower interest rate but high fees might have a higher APR than one with a slightly higher rate but no fees." },
        { question: "Should I compare APR or interest rate?", answer: "Compare APR for the truest cost comparison between loans. It accounts for fees that the interest rate alone ignores. However, for adjustable-rate loans, the initial APR may not reflect the long-term cost." },
      ]}
      relatedTools={[
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Interest Calculator", href: "/tools/interest-calculator" },
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Loan Amount ($)</label><input type="number" value={loanAmount} onChange={e => setLoanAmount(+e.target.value)} className={inputCls} min={0} step={500} /></div>
          <div><label className={labelCls}>Interest Rate (%)</label><input type="number" value={interestRate} onChange={e => setInterestRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.1} /></div>
          <div><label className={labelCls}>Loan Term (years)</label><input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} className={inputCls} min={0.5} max={30} step={0.5} /></div>
          <div><label className={labelCls}>Total Fees ($)</label><input type="number" value={fees} onChange={e => setFees(+e.target.value)} className={inputCls} min={0} step={50} /><p className="text-xs text-zinc-500 mt-1">Origination, closing costs, points, etc.</p></div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">True APR</p>
            <p className="text-5xl font-bold text-blue-400">{result.apr.toFixed(2)}%</p>
            <p className="text-xs text-zinc-500 mt-1">vs {interestRate}% stated rate</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Monthly Payment</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.payment)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Interest</p><p className="text-lg font-semibold text-red-400">{fmtC(result.totalInterest)}</p></div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-zinc-400">Loan Amount</span><span className="text-zinc-100">{fmtC(loanAmount)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Fees</span><span className="text-red-400">−{fmtC(fees)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Actually Received</span><span className="text-zinc-100">{fmtC(result.actualReceived)}</span></div>
            <div className="flex justify-between border-t border-zinc-700 pt-1"><span className="text-zinc-400">Total Repaid</span><span className="text-zinc-100">{fmtC(result.totalPaid)}</span></div>
            <div className="flex justify-between font-semibold"><span className="text-zinc-200">True Cost (Interest + Fees)</span><span className="text-red-400">{fmtC(result.totalInterest + fees)}</span></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
