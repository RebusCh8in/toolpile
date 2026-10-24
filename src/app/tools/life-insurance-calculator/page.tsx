"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function fmtC(n: number) {
  return "$" + fmt(n);
}

/* Rough monthly term-life premium per $100K coverage by age bracket */
function estimatePremium(age: number, termYears: number, coverage: number) {
  // base monthly cost per $100K for a 10-year term
  let base: number;
  if (age < 25) base = 0.6;
  else if (age < 30) base = 0.7;
  else if (age < 35) base = 0.8;
  else if (age < 40) base = 1.0;
  else if (age < 45) base = 1.4;
  else if (age < 50) base = 2.1;
  else if (age < 55) base = 3.3;
  else if (age < 60) base = 5.2;
  else if (age < 65) base = 8.5;
  else base = 14.0;

  // term length multiplier
  let mult = 1;
  if (termYears === 20) mult = 1.5;
  else if (termYears === 30) mult = 2.1;

  const units = coverage / 100000;
  return Math.round(base * mult * units);
}

const COLORS = [
  "#3b82f6", // blue - income
  "#8b5cf6", // purple - mortgage
  "#f59e0b", // amber - debts
  "#10b981", // emerald - college
  "#ef4444", // red - final expenses
  "#6366f1", // indigo - spouse value
];

export default function Page() {
  const [annualIncome, setAnnualIncome] = useState(75000);
  const [yearsReplace, setYearsReplace] = useState(10);
  const [dependents, setDependents] = useState(2);
  const [mortgage, setMortgage] = useState(250000);
  const [otherDebts, setOtherDebts] = useState(25000);
  const [finalExpenses, setFinalExpenses] = useState(15000);
  const [existingCoverage, setExistingCoverage] = useState(0);
  const [existingSavings, setExistingSavings] = useState(20000);
  const [collegeFund, setCollegeFund] = useState(100000);
  const [stayHomeSpouse, setStayHomeSpouse] = useState(false);
  const [age, setAge] = useState(35);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const result = useMemo(() => {
    const incomeReplacement = annualIncome * yearsReplace;
    const mortgagePayoff = mortgage;
    const debtPayoff = otherDebts;
    const collegeTotal = dependents * collegeFund;
    const spouseValue = stayHomeSpouse ? 40000 * yearsReplace : 0;
    const finalExp = finalExpenses;

    const totalNeeds =
      incomeReplacement +
      mortgagePayoff +
      debtPayoff +
      collegeTotal +
      finalExp +
      spouseValue;
    const totalAssets = existingCoverage + existingSavings;
    const recommended = Math.max(0, totalNeeds - totalAssets);
    const gap = existingCoverage > 0 ? recommended : 0;

    const components = [
      { label: "Income Replacement", value: incomeReplacement, color: COLORS[0] },
      { label: "Mortgage Payoff", value: mortgagePayoff, color: COLORS[1] },
      { label: "Debt Payoff", value: debtPayoff, color: COLORS[2] },
      { label: "College Fund", value: collegeTotal, color: COLORS[3] },
      { label: "Final Expenses", value: finalExp, color: COLORS[4] },
    ];
    if (spouseValue > 0) {
      components.push({ label: "Spouse Care Value", value: spouseValue, color: COLORS[5] });
    }

    const deductions = [
      { label: "Existing Coverage", value: existingCoverage },
      { label: "Savings & Investments", value: existingSavings },
    ];

    const premiums = {
      term10: estimatePremium(age, 10, recommended),
      term20: estimatePremium(age, 20, recommended),
      term30: estimatePremium(age, 30, recommended),
    };

    // personalized insight
    let insight = "";
    if (recommended === 0) {
      insight = "Based on your inputs, your existing coverage and savings already meet your needs. Consider reviewing annually as circumstances change.";
    } else if (gap > 0 && existingCoverage > 0) {
      const pct = Math.round((existingCoverage / totalNeeds) * 100);
      insight = `Your current coverage of ${fmtC(existingCoverage)} covers about ${pct}% of your total needs. Consider a supplemental policy for the remaining ${fmtC(gap)} gap.`;
    } else if (dependents >= 3) {
      insight = `With ${dependents} dependents and ${fmtC(collegeTotal)} earmarked for education, a 20-year term policy is often the best balance of coverage length and affordability for growing families.`;
    } else if (age < 30) {
      insight = "Locking in a 20 or 30-year term policy now gives you the lowest premiums you'll ever find. Rates increase significantly with each decade of age.";
    } else if (mortgage > 300000) {
      insight = `Your mortgage of ${fmtC(mortgage)} is a significant portion of your coverage needs. Make sure your policy lasts at least as long as your remaining mortgage term.`;
    } else {
      insight = `A ${fmtC(recommended)} policy would fully protect your family. A 20-year term policy at roughly ${fmtC(premiums.term20)}/month is a popular choice for your profile.`;
    }

    return { recommended, totalNeeds, totalAssets, components, deductions, premiums, gap, insight };
  }, [annualIncome, yearsReplace, dependents, mortgage, otherDebts, finalExpenses, existingCoverage, existingSavings, collegeFund, stayHomeSpouse, age]);

  // Draw stacked bar chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const total = result.components.reduce((s, c) => s + c.value, 0);
    if (total === 0) return;

    const barY = 10;
    const barH = 36;
    let x = 0;

    result.components.forEach((c) => {
      const segW = (c.value / total) * w;
      if (segW < 1) return;
      ctx.fillStyle = c.color;
      ctx.beginPath();
      // rounded ends for first/last
      ctx.roundRect(x, barY, segW + 1, barH, x === 0 ? [6, 0, 0, 6] : segW + x >= w - 1 ? [0, 6, 6, 0] : 0);
      ctx.fill();
      x += segW;
    });

    // legend below bar
    const legendY = barY + barH + 20;
    const cols = w > 500 ? 3 : 2;
    const colW = w / cols;
    result.components.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const lx = col * colW;
      const ly = legendY + row * 22;

      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.roundRect(lx, ly, 12, 12, 2);
      ctx.fill();

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "12px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(`${c.label}: ${fmtC(c.value)}`, lx + 18, ly + 6);
    });
  }, [result]);

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Life Insurance Calculator"
      description="Calculate exactly how much life insurance coverage you need based on your income, debts, dependents, and financial goals."
      slug="life-insurance-calculator"
      category="Finance"
      keywords={[
        "life insurance calculator",
        "how much life insurance do i need",
        "life insurance needs calculator",
        "term life insurance calculator",
        "life insurance cost calculator",
        "life insurance estimator",
      ]}
      faqs={[
        {
          question: "How much life insurance do I need?",
          answer:
            "Most financial advisors recommend coverage equal to 10-15 times your annual income. However, a more precise approach factors in income replacement years, outstanding debts (mortgage, loans), future education costs for children, final expenses, and then subtracts existing savings and coverage. This calculator uses that comprehensive method to give you a personalized recommendation.",
        },
        {
          question: "What is the difference between term and whole life insurance?",
          answer:
            "Term life insurance covers you for a specific period (10, 20, or 30 years) and pays a death benefit only if you die during the term. It's significantly cheaper. Whole life insurance covers you for your entire life, includes a cash value component that grows over time, and costs 5-15x more than term. Most financial experts recommend term life for the majority of people, investing the premium savings separately.",
        },
        {
          question: "How much does life insurance cost per month?",
          answer:
            "Term life insurance costs vary by age, health, coverage amount, and term length. A healthy 30-year-old can expect to pay roughly $20-$35/month for a $500,000, 20-year term policy. Costs increase with age — the same policy for a 40-year-old might be $40-$60/month, and for a 50-year-old, $90-$150/month. Whole life insurance costs 5-15 times more than equivalent term coverage.",
        },
        {
          question: "Do I need life insurance if I'm single?",
          answer:
            "If no one depends on your income, you may not need life insurance. However, you might still want a small policy to cover funeral costs and any debts (like student loans with a co-signer) that would burden your family. If you plan to have dependents in the future, buying a policy while young and healthy locks in lower rates.",
        },
        {
          question: "When should I buy life insurance?",
          answer:
            "The best time to buy life insurance is when you're young and healthy — premiums increase with age and health issues. Key life events that trigger the need include getting married, buying a home, having children, or taking on significant debt. Every year you wait typically means higher premiums, and developing health conditions can make coverage much more expensive or unavailable.",
        },
        {
          question: "Is employer life insurance enough?",
          answer:
            "Employer-provided life insurance typically offers 1-2x your annual salary, which is usually far below what your family would need. It also isn't portable — you lose it when you leave the job. It's a nice supplement, but most people need an individual policy for adequate coverage. Enter your employer coverage in the 'Existing Coverage' field above to see your gap.",
        },
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
        { name: "Net Worth Calculator", href: "/tools/net-worth-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
      ]}
      guide={
        <>
          <h2>How to Calculate Your Life Insurance Needs</h2>
          <p>
            Determining the right amount of life insurance starts with understanding what your
            family would need financially if you were no longer there. The goal is to replace your
            income for a set number of years, pay off major debts like your mortgage, fund future
            expenses like college tuition, and cover final costs — then subtract what you already
            have saved or covered. This calculator walks you through each component so you get a
            precise, personalized number rather than a rough rule of thumb.
          </p>

          <h3>The DIME Method Explained</h3>
          <p>
            DIME stands for <strong>Debt</strong>, <strong>Income</strong>, <strong>Mortgage</strong>,
            and <strong>Education</strong> — the four pillars of life insurance needs analysis. Add up
            all outstanding debts, multiply your annual income by the number of years your family would
            need support, include your remaining mortgage balance, and estimate college costs per child.
            The total gives you a comprehensive coverage target. This calculator uses an enhanced version
            of DIME that also accounts for final expenses, spousal care value, and existing assets.
          </p>

          <h3>Term vs. Whole Life: The Basics</h3>
          <p>
            Term life insurance is straightforward: you pay a fixed premium for a set period (10, 20,
            or 30 years), and if you die during that term, your beneficiaries receive the death benefit.
            Whole life insurance lasts your entire lifetime and includes a cash value savings component,
            but costs 5-15 times more. For most families, a term policy that covers the years until
            children are independent and the mortgage is paid off provides the best value. The premium
            estimates shown above are for term life policies, which are the most common and affordable
            option.
          </p>
        </>
      }
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Inputs — left column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Income & Family</h2>

            <div>
              <label className={labelCls}>Annual Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(+e.target.value)}
                  className={inputCls + " pl-7"}
                  min={0}
                  step={5000}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Years to Replace Income: <span className="text-zinc-200 font-medium">{yearsReplace}</span>
              </label>
              <input
                type="range"
                min={5}
                max={30}
                value={yearsReplace}
                onChange={(e) => setYearsReplace(+e.target.value)}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>5 yrs</span>
                <span>30 yrs</span>
              </div>
            </div>

            <div>
              <label className={labelCls}>Number of Dependents / Children</label>
              <input
                type="number"
                value={dependents}
                onChange={(e) => setDependents(Math.max(0, +e.target.value))}
                className={inputCls}
                min={0}
                max={20}
              />
            </div>

            <div>
              <label className={labelCls}>College Fund per Child</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  value={collegeFund}
                  onChange={(e) => setCollegeFund(+e.target.value)}
                  className={inputCls + " pl-7"}
                  min={0}
                  step={10000}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400">Stay-at-Home Spouse</label>
              <button
                onClick={() => setStayHomeSpouse(!stayHomeSpouse)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  stayHomeSpouse ? "bg-blue-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    stayHomeSpouse ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
            {stayHomeSpouse && (
              <p className="text-xs text-zinc-500">Adds $40,000/yr equivalent value for childcare, household management, etc.</p>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Debts & Expenses</h2>

            <div>
              <label className={labelCls}>Outstanding Mortgage</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  value={mortgage}
                  onChange={(e) => setMortgage(+e.target.value)}
                  className={inputCls + " pl-7"}
                  min={0}
                  step={10000}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Other Debts (loans, credit cards)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  value={otherDebts}
                  onChange={(e) => setOtherDebts(+e.target.value)}
                  className={inputCls + " pl-7"}
                  min={0}
                  step={1000}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Final Expenses (funeral, medical)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  value={finalExpenses}
                  onChange={(e) => setFinalExpenses(+e.target.value)}
                  className={inputCls + " pl-7"}
                  min={0}
                  step={1000}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Existing Coverage & Assets</h2>

            <div>
              <label className={labelCls}>Existing Life Insurance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  value={existingCoverage}
                  onChange={(e) => setExistingCoverage(+e.target.value)}
                  className={inputCls + " pl-7"}
                  min={0}
                  step={10000}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Savings & Investments</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  value={existingSavings}
                  onChange={(e) => setExistingSavings(+e.target.value)}
                  className={inputCls + " pl-7"}
                  min={0}
                  step={5000}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results — right column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Hero number */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-6 text-center">
            <p className="text-sm text-zinc-400 mb-1">Recommended Coverage</p>
            <p className="text-5xl font-bold text-zinc-100 tracking-tight">
              {fmtC(result.recommended)}
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              Total needs: {fmtC(result.totalNeeds)} &minus; Existing assets: {fmtC(result.totalAssets)}
            </p>
          </div>

          {/* Coverage gap */}
          {result.gap > 0 && (
            <div className="rounded-xl border border-amber-600/30 bg-amber-950/20 p-4 flex items-start gap-3">
              <span className="text-amber-500 text-lg mt-0.5">!</span>
              <div>
                <p className="text-sm font-medium text-amber-400">Coverage Gap: {fmtC(result.gap)}</p>
                <p className="text-xs text-amber-500/80 mt-0.5">
                  Your current coverage of {fmtC(existingCoverage)} falls short of your {fmtC(result.totalNeeds)} total need.
                </p>
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Coverage Breakdown</h2>
            <div className="space-y-2">
              {result.components.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </span>
                  <span className="text-zinc-200 font-medium tabular-nums">{fmtC(c.value)}</span>
                </div>
              ))}

              <div className="border-t border-zinc-700 my-2" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Total Needs</span>
                <span className="text-zinc-200 font-semibold tabular-nums">{fmtC(result.totalNeeds)}</span>
              </div>

              {result.deductions.map((d) => (
                <div key={d.label} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">&minus; {d.label}</span>
                  <span className="text-red-400 tabular-nums">&minus;{fmtC(d.value)}</span>
                </div>
              ))}

              <div className="border-t border-zinc-700 my-2" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300 font-semibold">Recommended Coverage</span>
                <span className="text-blue-400 font-bold text-lg tabular-nums">{fmtC(result.recommended)}</span>
              </div>
            </div>
          </div>

          {/* Stacked bar chart */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-3">Where Your Coverage Goes</h2>
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ height: "120px" }}
            />
          </div>

          {/* Premium estimates */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
              Estimated Monthly Premiums
            </h2>
            <div className="mb-4">
              <label className={labelCls}>
                Your Age: <span className="text-zinc-200 font-medium">{age}</span>
              </label>
              <input
                type="range"
                min={18}
                max={70}
                value={age}
                onChange={(e) => setAge(+e.target.value)}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>18</span>
                <span>70</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "10-Year Term", value: result.premiums.term10 },
                { label: "20-Year Term", value: result.premiums.term20 },
                { label: "30-Year Term", value: result.premiums.term30 },
              ].map((p) => (
                <div
                  key={p.label}
                  className="rounded-lg bg-zinc-900 border border-zinc-700 p-3 text-center"
                >
                  <p className="text-xs text-zinc-500 mb-1">{p.label}</p>
                  <p className="text-xl font-bold text-zinc-100 tabular-nums">
                    {result.recommended > 0 ? `$${fmt(p.value)}` : "$0"}
                  </p>
                  <p className="text-xs text-zinc-600">/month</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-600 mt-3">
              * Estimates based on average rates for healthy non-smokers. Actual premiums vary by health, gender, and insurer.
            </p>
          </div>

          {/* Insight box */}
          <div className="rounded-xl border border-blue-600/30 bg-blue-950/20 p-4">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">Personalized Insight</p>
            <p className="text-sm text-blue-200/80 leading-relaxed">{result.insight}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
