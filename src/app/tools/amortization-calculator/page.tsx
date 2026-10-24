"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [principal, setPrincipal] = useState(250000);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);
  const [extraPayment, setExtraPayment] = useState(0);

  const result = useMemo(() => {
    if (principal <= 0 || termYears <= 0) return null;
    const n = termYears * 12;
    const r = rate / 100 / 12;
    const payment = r === 0 ? principal / n : principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = payment + extraPayment;

    let balance = principal;
    const schedule: { month: number; payment: number; principalPart: number; interestPart: number; balance: number }[] = [];
    let totalInterest = 0;

    for (let m = 1; balance > 0; m++) {
      const interestPart = balance * r;
      let principalPart = Math.min(totalPayment - interestPart, balance);
      const pmt = interestPart + principalPart;
      balance -= principalPart;
      totalInterest += interestPart;
      schedule.push({ month: m, payment: pmt, principalPart, interestPart, balance: Math.max(0, balance) });
      if (balance <= 0) break;
    }

    const actualMonths = schedule.length;
    const savedMonths = n - actualMonths;
    const noExtraInterest = r === 0 ? 0 : (payment * n) - principal;
    const savedInterest = noExtraInterest - totalInterest;

    return { payment, totalPayment, totalInterest, totalPaid: principal + totalInterest, schedule, actualMonths, savedMonths, savedInterest };
  }, [principal, rate, termYears, extraPayment]);

  // Aggregate to yearly
  const yearlySchedule = useMemo(() => {
    if (!result) return [];
    const yearly: { year: number; principal: number; interest: number; balance: number }[] = [];
    let yPrincipal = 0, yInterest = 0;
    for (const row of result.schedule) {
      yPrincipal += row.principalPart;
      yInterest += row.interestPart;
      if (row.month % 12 === 0 || row.month === result.schedule.length) {
        yearly.push({ year: yearly.length + 1, principal: yPrincipal, interest: yInterest, balance: row.balance });
        yPrincipal = 0; yInterest = 0;
      }
    }
    return yearly;
  }, [result]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Amortization Calculator"
      description="Generate a full amortization schedule showing principal and interest breakdown for each payment. See how extra payments save money."
      slug="amortization-calculator"
      category="Finance"
      keywords={["amortization calculator", "amortization schedule", "loan amortization calculator", "mortgage amortization calculator", "amortization table"]}
      faqs={[
        { question: "What is amortization?", answer: "Amortization is the process of spreading a loan into a series of fixed payments. Early payments are mostly interest; later payments are mostly principal. An amortization schedule shows this breakdown for every payment." },
        { question: "How do extra payments help?", answer: "Extra payments go directly to principal, reducing the balance faster. On a $250K mortgage at 6.5% for 30 years, adding just $200/month saves ~$108K in interest and pays off the loan 7 years early." },
        { question: "Why is most of my early payment going to interest?", answer: "Interest is calculated on the remaining balance. With a large balance early on, most of your payment covers interest. As the balance decreases, more goes to principal. This is normal for amortized loans." },
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Payment Calculator", href: "/tools/payment-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Loan Amount ($)</label><input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div><label className={labelCls}>Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.125} /></div>
          <div><label className={labelCls}>Loan Term (years)</label><input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} className={inputCls} min={1} max={50} /></div>
          <div><label className={labelCls}>Extra Monthly Payment ($)</label><input type="number" value={extraPayment} onChange={e => setExtraPayment(+e.target.value)} className={inputCls} min={0} step={50} /></div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Monthly Payment</p>
              <p className="text-4xl font-bold text-blue-400">{fmtC(result.totalPayment)}</p>
              {extraPayment > 0 && <p className="text-xs text-zinc-500 mt-1">Base: {fmtC(result.payment)} + Extra: {fmtC(extraPayment)}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Interest</p><p className="text-lg font-semibold text-red-400">{fmtC(result.totalInterest)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Paid</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalPaid)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Payoff</p><p className="text-lg font-semibold text-zinc-100">{Math.floor(result.actualMonths / 12)}y {result.actualMonths % 12}m</p></div>
            </div>
            {extraPayment > 0 && result.savedMonths > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                <p className="text-sm text-green-300">Extra payments save <span className="font-bold">{fmtC(result.savedInterest)}</span> in interest and pay off <span className="font-bold">{Math.floor(result.savedMonths / 12)}y {result.savedMonths % 12}m</span> early</p>
              </div>
            )}
          </div>
        )}
      </div>

      {yearlySchedule.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">Amortization Schedule (Yearly)</summary>
          <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-800"><tr className="border-b border-zinc-700 text-zinc-500"><th className="text-left p-2">Year</th><th className="text-right p-2">Principal</th><th className="text-right p-2">Interest</th><th className="text-right p-2">Balance</th></tr></thead>
              <tbody>
                {yearlySchedule.map(r => (
                  <tr key={r.year} className="border-b border-zinc-800">
                    <td className="p-2 text-zinc-300">{r.year}</td>
                    <td className="text-right p-2 text-blue-400">{fmtC(r.principal)}</td>
                    <td className="text-right p-2 text-red-400">{fmtC(r.interest)}</td>
                    <td className="text-right p-2 text-zinc-100">{fmtC(r.balance)}</td>
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
