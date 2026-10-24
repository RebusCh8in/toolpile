"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import Script from "next/script";

/* ── helpers ─────────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtC(n: number) {
  return "$" + fmt(n);
}
function fmtInt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function calcMonthlyPayment(principal: number, annualRate: number, totalMonths: number) {
  if (principal <= 0 || totalMonths <= 0) return 0;
  if (annualRate <= 0) return principal / totalMonths;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
}

interface AmortRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function buildSchedule(principal: number, annualRate: number, totalMonths: number): AmortRow[] {
  const rows: AmortRow[] = [];
  const r = annualRate / 100 / 12;
  const payment = calcMonthlyPayment(principal, annualRate, totalMonths);
  let balance = principal;
  for (let i = 1; i <= totalMonths; i++) {
    const interestPart = balance * r;
    const principalPart = payment - interestPart;
    balance = Math.max(0, balance - principalPart);
    rows.push({ month: i, payment, principal: principalPart, interest: interestPart, balance });
  }
  return rows;
}

/* ── component ───────────────────────────────────────────────── */
export default function Page() {
  /* Current loan */
  const [remainingBalance, setRemainingBalance] = useState(280000);
  const [currentRate, setCurrentRate] = useState(6.5);
  const [remainingYears, setRemainingYears] = useState(25);
  const [remainingMonths, setRemainingMonths] = useState(0);
  const [currentPayment, setCurrentPayment] = useState(0);
  const [autoCalcCurrent, setAutoCalcCurrent] = useState(true);

  /* New loan */
  const [newRate, setNewRate] = useState(5.25);
  const [newTermYears, setNewTermYears] = useState(30);
  const [closingCosts, setClosingCosts] = useState(4500);
  const [points, setPoints] = useState(0);

  /* UI */
  const [showAmortization, setShowAmortization] = useState(false);
  const [amortView, setAmortView] = useState<"table" | "chart">("chart");

  const result = useMemo(() => {
    const currentTotalMonths = remainingYears * 12 + remainingMonths;
    if (remainingBalance <= 0 || currentTotalMonths <= 0) return null;

    /* Current loan */
    const calcCurrentPayment = calcMonthlyPayment(remainingBalance, currentRate, currentTotalMonths);
    const effectiveCurrentPayment = autoCalcCurrent ? calcCurrentPayment : currentPayment;
    const currentTotalPaid = effectiveCurrentPayment * currentTotalMonths;
    const currentTotalInterest = currentTotalPaid - remainingBalance;
    const currentSchedule = buildSchedule(remainingBalance, currentRate, currentTotalMonths);

    /* New loan */
    const pointsCost = (points / 100) * remainingBalance;
    const totalClosingCosts = closingCosts + pointsCost;
    const newTotalMonths = newTermYears * 12;
    const newMonthlyPayment = calcMonthlyPayment(remainingBalance, newRate, newTotalMonths);
    const newTotalPaid = newMonthlyPayment * newTotalMonths;
    const newTotalInterest = newTotalPaid - remainingBalance;
    const newSchedule = buildSchedule(remainingBalance, newRate, newTotalMonths);

    /* Savings */
    const monthlySavings = effectiveCurrentPayment - newMonthlyPayment;
    const totalInterestSavings = currentTotalInterest - newTotalInterest;
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(totalClosingCosts / monthlySavings) : monthlySavings === 0 ? Infinity : -1;
    const currentTotalCost = currentTotalPaid;
    const newTotalCost = newTotalPaid + totalClosingCosts;
    const lifetimeSavings = currentTotalCost - newTotalCost;

    return {
      calcCurrentPayment,
      effectiveCurrentPayment,
      currentTotalMonths,
      currentTotalPaid,
      currentTotalInterest,
      currentSchedule,
      newMonthlyPayment,
      newTotalMonths,
      newTotalPaid,
      newTotalInterest,
      newSchedule,
      totalClosingCosts,
      pointsCost,
      monthlySavings,
      totalInterestSavings,
      breakEvenMonths,
      currentTotalCost,
      newTotalCost,
      lifetimeSavings,
    };
  }, [remainingBalance, currentRate, remainingYears, remainingMonths, currentPayment, autoCalcCurrent, newRate, newTermYears, closingCosts, points]);

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const sectionTitle = "text-lg font-semibold text-zinc-100 mb-4";

  /* Chart: build bar data for every 12th month (yearly) */
  const chartData = useMemo(() => {
    if (!result) return [];
    const maxMonths = Math.max(result.currentTotalMonths, result.newTotalMonths);
    const rows: { year: number; currentBalance: number; newBalance: number }[] = [];
    for (let m = 0; m <= maxMonths; m += 12) {
      const cIdx = Math.min(m, result.currentSchedule.length) - 1;
      const nIdx = Math.min(m, result.newSchedule.length) - 1;
      rows.push({
        year: m / 12,
        currentBalance: m === 0 ? remainingBalance : cIdx >= 0 ? result.currentSchedule[cIdx].balance : 0,
        newBalance: m === 0 ? remainingBalance : nIdx >= 0 ? result.newSchedule[nIdx].balance : 0,
      });
    }
    return rows;
  }, [result, remainingBalance]);

  const maxBalance = remainingBalance;

  /* JSON-LD schemas */
  const pageUrl = "https://toolpile.app/tools/refinance-calculator";
  const faqSchemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I know if refinancing my mortgage is worth it?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Refinancing is generally worth considering when you can lower your interest rate by at least 0.5-1%, plan to stay in the home long enough to pass the break-even point, or need to switch from an adjustable-rate to a fixed-rate mortgage. Use the break-even calculation to see how many months of savings it takes to recoup closing costs.",
        },
      },
      {
        "@type": "Question",
        name: "What is the break-even point on a mortgage refinance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The break-even point is the number of months it takes for your monthly payment savings to equal the total closing costs of the refinance. For example, if closing costs are $4,500 and you save $150/month, your break-even point is 30 months. If you plan to stay in the home beyond this point, refinancing saves you money.",
        },
      },
      {
        "@type": "Question",
        name: "What are typical closing costs for a mortgage refinance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Typical refinance closing costs range from 2% to 5% of the loan amount and may include application fees, appraisal fees, title insurance, origination fees, and prepaid items like taxes and insurance escrow. On a $280,000 loan, expect $5,600 to $14,000 in closing costs.",
        },
      },
      {
        "@type": "Question",
        name: "What are mortgage points and should I buy them?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mortgage discount points are upfront fees paid to the lender to reduce your interest rate, typically costing 1% of the loan amount per point and reducing the rate by about 0.25%. Buying points makes sense if you plan to keep the loan long enough for the monthly savings to exceed the upfront cost.",
        },
      },
      {
        "@type": "Question",
        name: "Does refinancing restart my mortgage clock?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Refinancing replaces your existing loan with a new one, so if you refinance into a new 30-year term after paying 5 years on your original mortgage, you will have 30 new years of payments. However, you can choose a shorter term (such as 15 or 20 years) to avoid extending your payoff date significantly.",
        },
      },
      {
        "@type": "Question",
        name: "Can I refinance with bad credit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "While it is harder to refinance with a low credit score, options exist. FHA streamline refinances, VA IRRRLs, and USDA streamline refinances have more lenient credit requirements. Conventional refinances typically require a minimum score of 620, though better rates are available at 740 and above.",
        },
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Refinance Calculator",
    description:
      "Free mortgage refinance calculator. Compare your current loan with a new refinanced loan to see monthly savings, total interest savings, break-even point, and amortization comparison.",
    url: pageUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <Script
        id="schema-faq-refinance"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />
      <Script
        id="schema-webapp-refinance"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <ToolLayout
        title="Refinance Calculator"
        description="Compare your current mortgage with a refinanced loan. Calculate monthly savings, total interest saved, break-even point, and view a side-by-side amortization comparison to decide if refinancing is right for you."
        slug="refinance-calculator"
        category="Finance"
        keywords={[
          "refinance calculator",
          "mortgage refinance calculator",
          "refinance savings calculator",
          "refinance break even calculator",
          "mortgage refinance comparison",
          "should I refinance calculator",
          "loan refinance calculator",
          "refinance amortization calculator",
        ]}
        faqs={[
          {
            question: "How do I know if refinancing my mortgage is worth it?",
            answer:
              "Refinancing is generally worth considering when you can lower your interest rate by at least 0.5\u20131%, plan to stay in the home long enough to pass the break-even point, or need to switch from an adjustable-rate to a fixed-rate mortgage. Use the break-even calculation to see how many months of savings it takes to recoup closing costs.",
          },
          {
            question: "What is the break-even point on a mortgage refinance?",
            answer:
              "The break-even point is the number of months it takes for your monthly payment savings to equal the total closing costs of the refinance. For example, if closing costs are $4,500 and you save $150/month, your break-even point is 30 months. If you plan to stay in the home beyond this point, refinancing saves you money.",
          },
          {
            question: "What are typical closing costs for a mortgage refinance?",
            answer:
              "Typical refinance closing costs range from 2% to 5% of the loan amount and may include application fees, appraisal fees, title insurance, origination fees, and prepaid items like taxes and insurance escrow. On a $280,000 loan, expect $5,600 to $14,000 in closing costs.",
          },
          {
            question: "What are mortgage points and should I buy them?",
            answer:
              "Mortgage discount points are upfront fees paid to the lender to reduce your interest rate, typically costing 1% of the loan amount per point and reducing the rate by about 0.25%. Buying points makes sense if you plan to keep the loan long enough for the monthly savings to exceed the upfront cost.",
          },
          {
            question: "Does refinancing restart my mortgage clock?",
            answer:
              "Yes. Refinancing replaces your existing loan with a new one, so if you refinance into a new 30-year term after paying 5 years on your original mortgage, you will have 30 new years of payments. However, you can choose a shorter term (such as 15 or 20 years) to avoid extending your payoff date significantly.",
          },
          {
            question: "Can I refinance with bad credit?",
            answer:
              "While it is harder to refinance with a low credit score, options exist. FHA streamline refinances, VA IRRRLs, and USDA streamline refinances have more lenient credit requirements. Conventional refinances typically require a minimum score of 620, though better rates are available at 740 and above.",
          },
        ]}
        relatedTools={[
          { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
          { name: "Loan Calculator", href: "/tools/loan-calculator" },
          { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
          { name: "Amortization Calculator", href: "/tools/amortization-calculator" },
        ]}
        guide={
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-zinc-100">How to Use the Refinance Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">
              This refinance calculator helps you compare your existing mortgage against a potential new loan.
              Enter your current loan details on the left, adjust the new loan terms on the right, and instantly
              see whether refinancing makes financial sense for your situation.
            </p>
            <h3 className="text-xl font-semibold text-zinc-200">Step 1: Enter Your Current Loan Details</h3>
            <p className="text-zinc-400 leading-relaxed">
              Start with your remaining loan balance (not the original loan amount), your current interest rate,
              and how many years and months remain on your loan. The calculator will auto-compute your current
              monthly payment, or you can enter it manually if yours differs due to escrow or other factors.
            </p>
            <h3 className="text-xl font-semibold text-zinc-200">Step 2: Configure the New Loan</h3>
            <p className="text-zinc-400 leading-relaxed">
              Enter the interest rate you expect on the new loan, the desired loan term, estimated closing costs,
              and any discount points you plan to purchase. Closing costs typically range from 2% to 5% of the
              loan amount and include appraisal, title, and origination fees.
            </p>
            <h3 className="text-xl font-semibold text-zinc-200">Step 3: Analyze the Results</h3>
            <p className="text-zinc-400 leading-relaxed">
              Review the summary card showing your new payment, monthly savings, and break-even point. The
              amortization comparison chart visualizes how each loan's balance declines over time, making it
              easy to see which option pays off faster and costs less in total interest.
            </p>
            <h3 className="text-xl font-semibold text-zinc-200">When Refinancing Makes Sense</h3>
            <ul className="text-zinc-400 leading-relaxed list-disc list-inside space-y-1">
              <li>Your new rate is at least 0.5% lower than your current rate</li>
              <li>You plan to stay in the home longer than the break-even period</li>
              <li>You want to switch from an adjustable-rate to a fixed-rate mortgage</li>
              <li>You want to shorten your loan term to build equity faster</li>
              <li>You need to eliminate PMI by refinancing with 20%+ equity</li>
            </ul>
          </div>
        }
      >
        {/* ── Input Sections ──────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Current Loan */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className={sectionTitle}>
              <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-2 mb-0.5" />
              Current Loan
            </h2>

            <div>
              <label className={labelCls}>Remaining Balance ($)</label>
              <input
                type="number"
                value={remainingBalance}
                onChange={(e) => setRemainingBalance(+e.target.value)}
                className={inputCls}
                min={0}
                step={1000}
              />
            </div>

            <div>
              <label className={labelCls}>Current Interest Rate (%)</label>
              <input
                type="number"
                value={currentRate}
                onChange={(e) => setCurrentRate(+e.target.value)}
                className={inputCls}
                min={0}
                max={30}
                step={0.125}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Remaining Years</label>
                <input
                  type="number"
                  value={remainingYears}
                  onChange={(e) => setRemainingYears(+e.target.value)}
                  className={inputCls}
                  min={0}
                  max={40}
                  step={1}
                />
              </div>
              <div>
                <label className={labelCls}>+ Months</label>
                <input
                  type="number"
                  value={remainingMonths}
                  onChange={(e) => setRemainingMonths(+e.target.value)}
                  className={inputCls}
                  min={0}
                  max={11}
                  step={1}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls + " mb-0"}>Current Monthly Payment ($)</label>
                <button
                  onClick={() => setAutoCalcCurrent(!autoCalcCurrent)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {autoCalcCurrent ? "Enter manually" : "Auto-calculate"}
                </button>
              </div>
              {autoCalcCurrent ? (
                <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300">
                  {result ? fmtC(result.calcCurrentPayment) : "--"}
                </div>
              ) : (
                <input
                  type="number"
                  value={currentPayment}
                  onChange={(e) => setCurrentPayment(+e.target.value)}
                  className={inputCls}
                  min={0}
                  step={10}
                />
              )}
            </div>
          </div>

          {/* New Loan */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className={sectionTitle}>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2 mb-0.5" />
              New Loan
            </h2>

            <div>
              <label className={labelCls}>New Interest Rate (%)</label>
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(+e.target.value)}
                className={inputCls}
                min={0}
                max={30}
                step={0.125}
              />
            </div>

            <div>
              <label className={labelCls}>New Loan Term</label>
              <div className="flex gap-2">
                {[10, 15, 20, 25, 30].map((y) => (
                  <button
                    key={y}
                    onClick={() => setNewTermYears(y)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newTermYears === y
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {y}yr
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Closing Costs ($)</label>
              <input
                type="number"
                value={closingCosts}
                onChange={(e) => setClosingCosts(+e.target.value)}
                className={inputCls}
                min={0}
                step={100}
              />
              {remainingBalance > 0 && (
                <p className="text-xs text-zinc-500 mt-1">
                  {((closingCosts / remainingBalance) * 100).toFixed(1)}% of loan balance
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>Discount Points</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(+e.target.value)}
                className={inputCls}
                min={0}
                max={5}
                step={0.25}
              />
              {points > 0 && remainingBalance > 0 && (
                <p className="text-xs text-zinc-500 mt-1">
                  Point cost: {fmtC((points / 100) * remainingBalance)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Summary Card ────────────────────────────────────── */}
        {result && (
          <div className="mb-8">
            {/* Hero metrics */}
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">New Monthly Payment</p>
                <p className="text-3xl font-bold text-blue-400">{fmtC(result.newMonthlyPayment)}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  vs {fmtC(result.effectiveCurrentPayment)} current
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">Monthly Savings</p>
                <p
                  className={`text-3xl font-bold ${
                    result.monthlySavings > 0 ? "text-green-400" : result.monthlySavings < 0 ? "text-red-400" : "text-zinc-400"
                  }`}
                >
                  {result.monthlySavings >= 0 ? "" : "-"}
                  {fmtC(Math.abs(result.monthlySavings))}
                </p>
                <p className="text-xs text-zinc-500 mt-1">/month</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">Break-Even Point</p>
                <p className="text-3xl font-bold text-amber-400">
                  {result.breakEvenMonths === Infinity
                    ? "Never"
                    : result.breakEvenMonths < 0
                    ? "N/A"
                    : `${result.breakEvenMonths} mo`}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {result.breakEvenMonths > 0 && result.breakEvenMonths !== Infinity
                    ? `~${(result.breakEvenMonths / 12).toFixed(1)} years`
                    : result.breakEvenMonths < 0
                    ? "Payment increases"
                    : "No savings"}
                </p>
              </div>
            </div>

            {/* Detailed stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500">Total Interest (Current)</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.currentTotalInterest)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500">Total Interest (New)</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.newTotalInterest)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500">Interest Savings</p>
                <p
                  className={`text-lg font-semibold ${
                    result.totalInterestSavings > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.totalInterestSavings >= 0 ? "" : "-"}
                  {fmtC(Math.abs(result.totalInterestSavings))}
                </p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500">Total Closing Costs</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalClosingCosts)}</p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500">Total Cost (Current Loan)</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.currentTotalCost)}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{fmtInt(result.currentTotalMonths)} payments</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500">Total Cost (New Loan)</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.newTotalCost)}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{fmtInt(result.newTotalMonths)} payments + costs</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 sm:col-span-2">
                <p className="text-xs text-zinc-500">Net Lifetime Savings (incl. closing costs)</p>
                <p
                  className={`text-lg font-semibold ${
                    result.lifetimeSavings > 0 ? "text-green-400" : result.lifetimeSavings < 0 ? "text-red-400" : "text-zinc-400"
                  }`}
                >
                  {result.lifetimeSavings >= 0 ? "" : "-"}
                  {fmtC(Math.abs(result.lifetimeSavings))}
                </p>
              </div>
            </div>

            {/* Verdict banner */}
            <div
              className={`mt-4 rounded-xl border p-4 text-sm ${
                result.lifetimeSavings > 0
                  ? "bg-green-500/10 border-green-500/30 text-green-300"
                  : result.lifetimeSavings < 0
                  ? "bg-red-500/10 border-red-500/30 text-red-300"
                  : "bg-zinc-800/50 border-zinc-700 text-zinc-400"
              }`}
            >
              {result.lifetimeSavings > 0 ? (
                <>
                  <span className="font-semibold">Refinancing saves you money.</span> You would save{" "}
                  {fmtC(result.monthlySavings)}/month and {fmtC(result.lifetimeSavings)} over the life of the
                  loan. You will recoup closing costs in{" "}
                  {result.breakEvenMonths !== Infinity ? `${result.breakEvenMonths} months` : "N/A"}.
                </>
              ) : result.lifetimeSavings < 0 ? (
                <>
                  <span className="font-semibold">Refinancing costs more overall.</span> The new loan would
                  cost you an additional {fmtC(Math.abs(result.lifetimeSavings))} over its lifetime when
                  including closing costs. Consider a shorter term or waiting for lower rates.
                </>
              ) : (
                <>
                  <span className="font-semibold">Break even.</span> The current and new loans have roughly
                  the same total cost. Consider other factors like cash flow needs or rate type preferences.
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Amortization Comparison ─────────────────────────── */}
        {result && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showAmortization ? "Hide" : "Show"} Amortization Comparison
              </button>
              {showAmortization && (
                <div className="flex gap-1 bg-zinc-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setAmortView("chart")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      amortView === "chart" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => setAmortView("table")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      amortView === "table" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Table
                  </button>
                </div>
              )}
            </div>

            {showAmortization && amortView === "chart" && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-4">Remaining Balance Over Time</p>
                <div className="relative h-64 flex items-end gap-[2px] sm:gap-1">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-zinc-500 pr-1 pointer-events-none">
                    <span>{fmtC(maxBalance)}</span>
                    <span>{fmtC(maxBalance / 2)}</span>
                    <span>$0</span>
                  </div>
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-zinc-800" />
                    <div className="border-t border-zinc-800" />
                    <div className="border-t border-zinc-800" />
                  </div>
                  {/* Bars */}
                  <div className="flex items-end gap-[1px] sm:gap-[3px] w-full ml-14 h-full">
                    {chartData.map((row) => {
                      const cH = maxBalance > 0 ? (row.currentBalance / maxBalance) * 100 : 0;
                      const nH = maxBalance > 0 ? (row.newBalance / maxBalance) * 100 : 0;
                      return (
                        <div key={row.year} className="flex-1 flex items-end gap-[1px] group relative" title={`Year ${row.year}`}>
                          <div
                            className="flex-1 bg-red-400/70 rounded-t-sm min-w-[2px] transition-all hover:bg-red-400"
                            style={{ height: `${cH}%` }}
                          />
                          <div
                            className="flex-1 bg-blue-400/70 rounded-t-sm min-w-[2px] transition-all hover:bg-blue-400"
                            style={{ height: `${nH}%` }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <p className="text-zinc-300 font-medium mb-1">Year {row.year}</p>
                            <p className="text-red-400">Current: {fmtC(row.currentBalance)}</p>
                            <p className="text-blue-400">New: {fmtC(row.newBalance)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* X-axis labels */}
                <div className="flex ml-14 mt-2">
                  <div className="flex-1 text-[10px] text-zinc-500 text-left">Year 0</div>
                  <div className="flex-1 text-[10px] text-zinc-500 text-center">
                    Year {Math.round(chartData.length / 2)}
                  </div>
                  <div className="flex-1 text-[10px] text-zinc-500 text-right">
                    Year {chartData.length > 0 ? chartData[chartData.length - 1].year : 0}
                  </div>
                </div>
                {/* Legend */}
                <div className="flex gap-4 mt-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-red-400/70" />
                    Current Loan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-blue-400/70" />
                    New Loan
                  </span>
                </div>
              </div>
            )}

            {showAmortization && amortView === "table" && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="max-h-[28rem] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-800 z-10">
                      <tr className="text-zinc-400 text-left text-xs">
                        <th className="px-3 py-2.5" rowSpan={2}>
                          Year
                        </th>
                        <th className="px-3 py-1.5 text-center border-b border-zinc-700" colSpan={3}>
                          <span className="text-red-400">Current Loan</span>
                        </th>
                        <th className="px-3 py-1.5 text-center border-b border-zinc-700" colSpan={3}>
                          <span className="text-blue-400">New Loan</span>
                        </th>
                      </tr>
                      <tr className="text-zinc-500 text-xs">
                        <th className="px-3 py-1.5">Principal</th>
                        <th className="px-3 py-1.5">Interest</th>
                        <th className="px-3 py-1.5">Balance</th>
                        <th className="px-3 py-1.5">Principal</th>
                        <th className="px-3 py-1.5">Interest</th>
                        <th className="px-3 py-1.5">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Yearly summary rows */}
                      {(() => {
                        const maxYears = Math.ceil(
                          Math.max(result.currentTotalMonths, result.newTotalMonths) / 12
                        );
                        const rows = [];
                        for (let y = 1; y <= maxYears; y++) {
                          const cEnd = Math.min(y * 12, result.currentSchedule.length);
                          const cStart = (y - 1) * 12;
                          const nEnd = Math.min(y * 12, result.newSchedule.length);
                          const nStart = (y - 1) * 12;

                          let cPrincipal = 0,
                            cInterest = 0,
                            cBalance = 0;
                          for (let m = cStart; m < cEnd; m++) {
                            cPrincipal += result.currentSchedule[m].principal;
                            cInterest += result.currentSchedule[m].interest;
                            cBalance = result.currentSchedule[m].balance;
                          }

                          let nPrincipal = 0,
                            nInterest = 0,
                            nBalance = 0;
                          for (let m = nStart; m < nEnd; m++) {
                            nPrincipal += result.newSchedule[m].principal;
                            nInterest += result.newSchedule[m].interest;
                            nBalance = result.newSchedule[m].balance;
                          }

                          const currentActive = cStart < result.currentSchedule.length;
                          const newActive = nStart < result.newSchedule.length;

                          rows.push(
                            <tr
                              key={y}
                              className="border-t border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/30 transition-colors"
                            >
                              <td className="px-3 py-1.5 font-medium text-zinc-400">{y}</td>
                              <td className="px-3 py-1.5">
                                {currentActive ? fmtC(cPrincipal) : <span className="text-zinc-600">--</span>}
                              </td>
                              <td className="px-3 py-1.5">
                                {currentActive ? fmtC(cInterest) : <span className="text-zinc-600">--</span>}
                              </td>
                              <td className="px-3 py-1.5">
                                {currentActive ? fmtC(cBalance) : <span className="text-zinc-600">$0.00</span>}
                              </td>
                              <td className="px-3 py-1.5">
                                {newActive ? fmtC(nPrincipal) : <span className="text-zinc-600">--</span>}
                              </td>
                              <td className="px-3 py-1.5">
                                {newActive ? fmtC(nInterest) : <span className="text-zinc-600">--</span>}
                              </td>
                              <td className="px-3 py-1.5">
                                {newActive ? fmtC(nBalance) : <span className="text-zinc-600">$0.00</span>}
                              </td>
                            </tr>
                          );
                        }
                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </ToolLayout>
    </>
  );
}
