"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtP(n: number) { return n.toFixed(2) + "%"; }

type ResidualMode = "percent" | "dollar";
type RateMode = "mf" | "apr";

interface LeaseResult {
  grossCapCost: number;
  netCapCost: number;
  residualDollar: number;
  depreciation: number;
  monthlyDepreciation: number;
  financeCharge: number;
  monthlyFinance: number;
  monthlyPayment: number;
  totalLeasePayments: number;
  totalLeaseCost: number;
  apr: number;
  moneyFactor: number;
}

interface BuyResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
}

interface TermComparison {
  term: number;
  residualPct: number;
  residualDollar: number;
  monthlyPayment: number;
  totalCost: number;
  depreciation: number;
  financeCharge: number;
}

function calcLease(
  msrp: number,
  capCost: number,
  residualPct: number,
  moneyFactor: number,
  term: number,
  downPayment: number,
  tradeIn: number,
  acqFee: number,
  dispFee: number,
): LeaseResult | null {
  if (msrp <= 0 || capCost <= 0 || term <= 0) return null;

  const grossCapCost = capCost + acqFee;
  const netCapCost = grossCapCost - downPayment - tradeIn;
  if (netCapCost <= 0) return null;

  const residualDollar = msrp * (residualPct / 100);
  const depreciation = netCapCost - residualDollar;
  const monthlyDepreciation = depreciation / term;

  const financeCharge = (netCapCost + residualDollar) * moneyFactor;
  const monthlyFinance = financeCharge;

  const monthlyPayment = monthlyDepreciation + monthlyFinance;
  const totalLeasePayments = monthlyPayment * term;
  const totalLeaseCost = totalLeasePayments + downPayment + tradeIn + dispFee;

  const apr = moneyFactor * 2400;

  return {
    grossCapCost,
    netCapCost,
    residualDollar,
    depreciation,
    monthlyDepreciation,
    financeCharge: monthlyFinance,
    monthlyFinance,
    monthlyPayment,
    totalLeasePayments,
    totalLeaseCost,
    apr,
    moneyFactor,
  };
}

function calcBuy(
  price: number,
  downPayment: number,
  tradeIn: number,
  aprRate: number,
  term: number,
): BuyResult | null {
  const loanAmount = Math.max(0, price - downPayment - tradeIn);
  if (loanAmount <= 0 || term <= 0) return null;
  const monthlyRate = aprRate / 100 / 12;
  const monthly = monthlyRate === 0
    ? loanAmount / term
    : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  const totalPaid = monthly * term;
  const totalInterest = totalPaid - loanAmount;
  return {
    monthlyPayment: monthly,
    totalInterest,
    totalCost: totalPaid + downPayment + tradeIn,
  };
}

const DEFAULT_RESIDUALS: Record<number, number> = { 24: 62, 36: 55, 39: 52, 48: 45 };

export default function Page() {
  const [msrp, setMsrp] = useState(40000);
  const [capCost, setCapCost] = useState(38000);
  const [residualValue, setResidualValue] = useState(55);
  const [residualMode, setResidualMode] = useState<ResidualMode>("percent");
  const [rateValue, setRateValue] = useState(0.00125);
  const [rateMode, setRateMode] = useState<RateMode>("mf");
  const [term, setTerm] = useState(36);
  const [downPayment, setDownPayment] = useState(2000);
  const [tradeIn, setTradeIn] = useState(0);
  const [acqFee, setAcqFee] = useState(695);
  const [dispFee, setDispFee] = useState(395);
  const [activeTab, setActiveTab] = useState<"results" | "compare" | "breakdown">("results");

  const residualPct = residualMode === "percent" ? residualValue : (msrp > 0 ? (residualValue / msrp) * 100 : 0);
  const moneyFactor = rateMode === "mf" ? rateValue : rateValue / 2400;
  const apr = moneyFactor * 2400;

  const result = useMemo(() => {
    return calcLease(msrp, capCost, residualPct, moneyFactor, term, downPayment, tradeIn, acqFee, dispFee);
  }, [msrp, capCost, residualPct, moneyFactor, term, downPayment, tradeIn, acqFee, dispFee]);

  const buyResult = useMemo(() => {
    return calcBuy(capCost, downPayment, tradeIn, apr, term);
  }, [capCost, downPayment, tradeIn, apr, term]);

  const termComparisons = useMemo((): TermComparison[] => {
    return [24, 36, 39, 48].map(t => {
      const resPct = DEFAULT_RESIDUALS[t] ?? 50;
      const r = calcLease(msrp, capCost, resPct, moneyFactor, t, downPayment, tradeIn, acqFee, dispFee);
      return {
        term: t,
        residualPct: resPct,
        residualDollar: msrp * (resPct / 100),
        monthlyPayment: r?.monthlyPayment ?? 0,
        totalCost: r?.totalLeaseCost ?? 0,
        depreciation: r?.depreciation ?? 0,
        financeCharge: (r?.financeCharge ?? 0) * t,
      };
    });
  }, [msrp, capCost, moneyFactor, downPayment, tradeIn, acqFee, dispFee]);

  const depPortion = result ? (result.monthlyDepreciation / result.monthlyPayment) * 100 : 0;
  const finPortion = result ? (result.monthlyFinance / result.monthlyPayment) * 100 : 0;

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const tabCls = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`;

  return (
    <ToolLayout
      title="Car Lease Calculator"
      description="Calculate your monthly car lease payment, total lease cost, and compare leasing vs buying. Includes money factor to APR conversion, multi-term comparison, and full payment breakdown."
      slug="lease-calculator"
      category="Finance"
      keywords={[
        "car lease calculator",
        "lease payment calculator",
        "auto lease calculator",
        "lease vs buy calculator",
        "money factor to APR",
        "residual value calculator",
        "monthly lease payment",
        "vehicle lease calculator",
      ]}
      faqs={[
        {
          question: "How is a car lease payment calculated?",
          answer:
            "A lease payment has two parts: the depreciation fee and the finance fee. The depreciation fee is (Net Cap Cost - Residual Value) / Lease Term. The finance fee is (Net Cap Cost + Residual Value) x Money Factor. Your monthly lease payment is the sum of these two. The net capitalized cost is the negotiated price plus fees minus your down payment and trade-in.",
        },
        {
          question: "What is a money factor and how does it relate to APR?",
          answer:
            "A money factor is the lease equivalent of an interest rate, expressed as a small decimal like 0.00125. To convert money factor to APR, multiply by 2400 (e.g., 0.00125 x 2400 = 3.0% APR). A lower money factor means lower finance charges. Good money factors are typically below 0.002 (4.8% APR).",
        },
        {
          question: "What is residual value and why does it matter?",
          answer:
            "Residual value is the predicted worth of the car at the end of the lease, set by the leasing company as a percentage of MSRP. A higher residual value means lower depreciation and a lower monthly payment. Typical residuals are 50-65% for a 36-month lease. Vehicles that hold their value well (like Toyota, Honda, Lexus) tend to have higher residuals and cheaper lease payments.",
        },
        {
          question: "Is it cheaper to lease or buy a car?",
          answer:
            "Leasing typically has lower monthly payments than buying because you only pay for the car's depreciation during the lease term, not the full price. However, buying is usually cheaper long-term since you build equity and own the car outright after the loan is paid off. Leasing makes sense if you want a new car every 2-3 years, drive under 12,000 miles per year, and prefer lower payments. Buying is better if you keep cars for 5+ years.",
        },
        {
          question: "What fees are involved in a car lease?",
          answer:
            "Common lease fees include the acquisition fee (charged at lease signing, typically $595-$1,095), disposition fee (charged at lease end if you don't buy or lease another vehicle, typically $300-$500), excess mileage charges (usually $0.15-$0.30/mile over the limit), and excess wear-and-tear charges. The acquisition fee is rolled into the capitalized cost, while the disposition fee is due at lease turn-in.",
        },
        {
          question: "Can I negotiate a car lease?",
          answer:
            "Yes, you can negotiate the capitalized cost (selling price), money factor, and sometimes the acquisition fee. The residual value is set by the leasing company and is generally non-negotiable. Focus on negotiating the cap cost down from MSRP just like you would when buying. Also check manufacturer lease specials, which may offer subvented (subsidized) money factors significantly below market rates.",
        },
      ]}
      relatedTools={[
        { name: "Auto Loan Calculator", href: "/tools/auto-loan-calculator" },
        { name: "APR Calculator", href: "/tools/apr-calculator" },
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Down Payment Calculator", href: "/tools/down-payment-calculator" },
        { name: "Payment Calculator", href: "/tools/payment-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">How to Use the Car Lease Calculator</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Enter the vehicle MSRP and the negotiated price (capitalized cost) to get started. Set the residual value as
              a percentage of MSRP or as a dollar amount -- this is usually provided on the lease quote from the dealer.
              Enter the money factor or APR equivalent, choose your lease term, and add any down payment, trade-in, or fee
              amounts. The calculator instantly shows your monthly payment, total cost, and a full payment breakdown.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Understanding Lease Payment Components</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Every lease payment is made up of two parts. The depreciation portion covers the loss in value of the car during
              the lease term. The finance portion is the interest charge on the money tied up in the vehicle. A car with a
              high residual value has lower depreciation and therefore a lower payment. A lower money factor means less interest
              cost each month. Use the payment breakdown tab to visualize exactly how much of your payment goes to each component.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Lease vs Buy: Which Is Better?</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              The Lease vs Buy comparison tab shows the total cost of leasing side-by-side with financing the same car over
              the same period. Leasing almost always has a lower monthly payment, but you have no equity at the end. Financing
              costs more monthly but you own the asset. Consider your driving habits, how long you keep cars, and whether you
              value lower payments or long-term ownership.
            </p>
          </section>
        </div>
      }
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* --- Inputs --- */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>MSRP ($)</label>
            <input type="number" value={msrp} onChange={e => setMsrp(+e.target.value)} className={inputCls} min={0} step={500} />
          </div>
          <div>
            <label className={labelCls}>Negotiated Price / Cap Cost ($)</label>
            <input type="number" value={capCost} onChange={e => setCapCost(+e.target.value)} className={inputCls} min={0} step={500} />
          </div>

          {/* Residual value with mode toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-zinc-400">Residual Value</label>
              <div className="flex rounded-lg overflow-hidden border border-zinc-700">
                <button
                  onClick={() => {
                    if (residualMode === "dollar") {
                      setResidualMode("percent");
                      setResidualValue(msrp > 0 ? Math.round((residualValue / msrp) * 100) : 55);
                    }
                  }}
                  className={`px-2 py-0.5 text-xs transition-colors ${residualMode === "percent" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
                >
                  %
                </button>
                <button
                  onClick={() => {
                    if (residualMode === "percent") {
                      setResidualMode("dollar");
                      setResidualValue(Math.round(msrp * (residualValue / 100)));
                    }
                  }}
                  className={`px-2 py-0.5 text-xs transition-colors ${residualMode === "dollar" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
                >
                  $
                </button>
              </div>
            </div>
            <input
              type="number"
              value={residualValue}
              onChange={e => setResidualValue(+e.target.value)}
              className={inputCls}
              min={0}
              step={residualMode === "percent" ? 1 : 500}
            />
            <p className="text-xs text-zinc-500 mt-1">
              {residualMode === "percent"
                ? `${fmtC(msrp * (residualValue / 100))} at end of lease`
                : `${fmtP(msrp > 0 ? (residualValue / msrp) * 100 : 0)} of MSRP`}
            </p>
          </div>

          {/* Money factor / APR toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-zinc-400">Rate</label>
              <div className="flex rounded-lg overflow-hidden border border-zinc-700">
                <button
                  onClick={() => {
                    if (rateMode === "apr") {
                      setRateMode("mf");
                      setRateValue(rateValue / 2400);
                    }
                  }}
                  className={`px-2 py-0.5 text-xs transition-colors ${rateMode === "mf" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
                >
                  MF
                </button>
                <button
                  onClick={() => {
                    if (rateMode === "mf") {
                      setRateMode("apr");
                      setRateValue(rateValue * 2400);
                    }
                  }}
                  className={`px-2 py-0.5 text-xs transition-colors ${rateMode === "apr" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
                >
                  APR
                </button>
              </div>
            </div>
            <input
              type="number"
              value={rateValue}
              onChange={e => setRateValue(+e.target.value)}
              className={inputCls}
              min={0}
              step={rateMode === "mf" ? 0.00001 : 0.1}
            />
            <p className="text-xs text-zinc-500 mt-1">
              {rateMode === "mf"
                ? `Equivalent to ${fmtP(rateValue * 2400)} APR`
                : `Money factor: ${(rateValue / 2400).toFixed(5)}`}
            </p>
          </div>

          {/* Lease term */}
          <div>
            <label className={labelCls}>Lease Term</label>
            <div className="grid grid-cols-4 gap-2">
              {[24, 36, 39, 48].map(m => (
                <button
                  key={m}
                  onClick={() => setTerm(m)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${term === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                >
                  {m} mo
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Down Payment ($)</label>
              <input type="number" value={downPayment} onChange={e => setDownPayment(+e.target.value)} className={inputCls} min={0} step={500} />
            </div>
            <div>
              <label className={labelCls}>Trade-In Value ($)</label>
              <input type="number" value={tradeIn} onChange={e => setTradeIn(+e.target.value)} className={inputCls} min={0} step={500} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Acquisition Fee ($)</label>
              <input type="number" value={acqFee} onChange={e => setAcqFee(+e.target.value)} className={inputCls} min={0} step={25} />
            </div>
            <div>
              <label className={labelCls}>Disposition Fee ($)</label>
              <input type="number" value={dispFee} onChange={e => setDispFee(+e.target.value)} className={inputCls} min={0} step={25} />
            </div>
          </div>
        </div>

        {/* --- Results --- */}
        {result && (
          <div className="space-y-4">
            {/* Monthly payment hero */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-sm text-zinc-400 mb-1">Monthly Lease Payment</p>
              <p className="text-4xl font-bold text-blue-400">{fmtC(result.monthlyPayment)}</p>
              <p className="text-xs text-zinc-500 mt-1">{term} months &middot; {fmtP(apr)} APR &middot; MF {moneyFactor.toFixed(5)}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("results")} className={tabCls(activeTab === "results")}>Summary</button>
              <button onClick={() => setActiveTab("compare")} className={tabCls(activeTab === "compare")}>Lease vs Buy</button>
              <button onClick={() => setActiveTab("breakdown")} className={tabCls(activeTab === "breakdown")}>Breakdown</button>
            </div>

            {/* Tab: Summary */}
            {activeTab === "results" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Net Cap Cost</p>
                    <p className="text-lg font-semibold text-zinc-100">{fmtC(result.netCapCost)}</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Residual Value</p>
                    <p className="text-lg font-semibold text-zinc-100">{fmtC(result.residualDollar)}</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Total Depreciation</p>
                    <p className="text-lg font-semibold text-yellow-400">{fmtC(result.depreciation)}</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Total Finance Charges</p>
                    <p className="text-lg font-semibold text-yellow-400">{fmtC(result.financeCharge * term)}</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Total of All Payments</p>
                    <p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalLeasePayments)}</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Total Lease Cost</p>
                    <p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalLeaseCost)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Lease vs Buy */}
            {activeTab === "compare" && buyResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Lease column */}
                  <div className="bg-zinc-800/50 border border-blue-500/30 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Lease</p>
                    <div>
                      <p className="text-xs text-zinc-500">Monthly Payment</p>
                      <p className="text-xl font-bold text-zinc-100">{fmtC(result.monthlyPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Total Cost ({term} mo)</p>
                      <p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalLeaseCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Equity at End</p>
                      <p className="text-lg font-semibold text-red-400">$0.00</p>
                    </div>
                  </div>
                  {/* Buy column */}
                  <div className="bg-zinc-800/50 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Buy</p>
                    <div>
                      <p className="text-xs text-zinc-500">Monthly Payment</p>
                      <p className="text-xl font-bold text-zinc-100">{fmtC(buyResult.monthlyPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Total Cost ({term} mo)</p>
                      <p className="text-lg font-semibold text-zinc-100">{fmtC(buyResult.totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Equity at End</p>
                      <p className="text-lg font-semibold text-emerald-400">{fmtC(result.residualDollar)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Monthly Savings with Lease</p>
                  <p className={`text-lg font-semibold ${buyResult.monthlyPayment - result.monthlyPayment > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {buyResult.monthlyPayment - result.monthlyPayment > 0 ? "+" : ""}{fmtC(buyResult.monthlyPayment - result.monthlyPayment)}/mo
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">Net Cost Difference (Lease - Buy + Equity)</p>
                  {(() => {
                    const netDiff = result.totalLeaseCost - (buyResult.totalCost - result.residualDollar);
                    return (
                      <p className={`text-lg font-semibold ${netDiff > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {netDiff > 0 ? "+" : ""}{fmtC(netDiff)}
                      </p>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Tab: Payment Breakdown */}
            {activeTab === "breakdown" && (
              <div className="space-y-3">
                {/* Visual bar */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-3">Payment Composition</p>
                  <div className="flex rounded-full overflow-hidden h-6">
                    <div
                      className="bg-blue-500 flex items-center justify-center text-xs font-medium text-white"
                      style={{ width: `${depPortion}%` }}
                    >
                      {depPortion > 15 ? `${depPortion.toFixed(0)}%` : ""}
                    </div>
                    <div
                      className="bg-yellow-500 flex items-center justify-center text-xs font-medium text-zinc-900"
                      style={{ width: `${finPortion}%` }}
                    >
                      {finPortion > 15 ? `${finPortion.toFixed(0)}%` : ""}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                      Depreciation: {fmtC(result.monthlyDepreciation)}
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 inline-block" />
                      Finance: {fmtC(result.monthlyFinance)}
                    </span>
                  </div>
                </div>

                {/* Detailed numbers */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Gross Cap Cost</span>
                    <span className="text-zinc-200">{fmtC(result.grossCapCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">- Down Payment</span>
                    <span className="text-zinc-200">-{fmtC(downPayment)}</span>
                  </div>
                  {tradeIn > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">- Trade-In</span>
                      <span className="text-zinc-200">-{fmtC(tradeIn)}</span>
                    </div>
                  )}
                  <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-medium">
                    <span className="text-zinc-300">Net Cap Cost</span>
                    <span className="text-zinc-100">{fmtC(result.netCapCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">- Residual Value</span>
                    <span className="text-zinc-200">-{fmtC(result.residualDollar)}</span>
                  </div>
                  <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-medium">
                    <span className="text-zinc-300">Total Depreciation</span>
                    <span className="text-blue-400">{fmtC(result.depreciation)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">/ {term} months</span>
                    <span className="text-zinc-200">{fmtC(result.monthlyDepreciation)}/mo</span>
                  </div>
                  <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-medium">
                    <span className="text-zinc-300">Monthly Finance Charge</span>
                    <span className="text-yellow-400">{fmtC(result.monthlyFinance)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>(Net Cap + Residual) x MF</span>
                    <span>({fmtC(result.netCapCost)} + {fmtC(result.residualDollar)}) x {moneyFactor.toFixed(5)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-term comparison -- always visible below tabs */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Term Comparison</p>
              <div className="space-y-1.5">
                {termComparisons.map(tc => {
                  const isActive = tc.term === term;
                  return (
                    <button
                      key={tc.term}
                      onClick={() => setTerm(tc.term)}
                      className={`w-full flex justify-between text-sm px-2 py-1.5 rounded text-left transition-colors ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400 hover:bg-zinc-700/50"}`}
                    >
                      <span className="w-14">{tc.term} mo</span>
                      <span className="w-24 text-right">{fmtC(tc.monthlyPayment)}/mo</span>
                      <span className="w-28 text-right text-yellow-400/70">{fmtC(tc.totalCost)} total</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-600 mt-2">Residual values estimated by term. Click a row to select that term.</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
