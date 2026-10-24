"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

type DebtType = "mortgage" | "car" | "student" | "credit" | "personal" | "child_support" | "other";

interface DebtEntry {
  id: number;
  type: DebtType;
  label: string;
  amount: number;
}

const DEBT_LABELS: Record<DebtType, string> = {
  mortgage: "Mortgage / Rent",
  car: "Car Payment",
  student: "Student Loans",
  credit: "Credit Cards",
  personal: "Personal Loans",
  child_support: "Child Support",
  other: "Other",
};

const LENDER_GUIDELINES = [
  { name: "Conventional Loan", maxFront: 28, maxBack: 36, note: "Standard guideline; some lenders allow up to 45% back-end with strong credit." },
  { name: "FHA Loan", maxFront: 31, maxBack: 43, note: "More flexible; may go to 50% back-end with compensating factors." },
  { name: "VA Loan", maxFront: null, maxBack: 41, note: "No official front-end limit. Back-end guideline is 41%, but exceptions are common." },
  { name: "USDA Loan", maxFront: 29, maxBack: 41, note: "For rural properties. Strict DTI limits compared to FHA." },
];

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtP(n: number) {
  return n.toFixed(1) + "%";
}

let nextId = 1;

export default function Page() {
  const [incomeMode, setIncomeMode] = useState<"monthly" | "annual">("annual");
  const [annualSalary, setAnnualSalary] = useState(75000);
  const [monthlyGross, setMonthlyGross] = useState(6250);
  const [targetDTI, setTargetDTI] = useState(36);

  const [debts, setDebts] = useState<DebtEntry[]>([
    { id: nextId++, type: "mortgage", label: "Mortgage / Rent", amount: 1200 },
    { id: nextId++, type: "car", label: "Car Payment", amount: 350 },
    { id: nextId++, type: "student", label: "Student Loans", amount: 200 },
  ]);

  const monthlyIncome = incomeMode === "annual" ? annualSalary / 12 : monthlyGross;

  const addDebt = () => {
    setDebts([...debts, { id: nextId++, type: "other", label: "Other", amount: 0 }]);
  };

  const removeDebt = (id: number) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const updateDebt = (id: number, field: keyof DebtEntry, value: string | number) => {
    setDebts(debts.map((d) => {
      if (d.id !== id) return d;
      if (field === "type") {
        const t = value as DebtType;
        return { ...d, type: t, label: DEBT_LABELS[t] };
      }
      return { ...d, [field]: value };
    }));
  };

  const result = useMemo(() => {
    const housingDebt = debts.filter((d) => d.type === "mortgage").reduce((s, d) => s + d.amount, 0);
    const totalDebt = debts.reduce((s, d) => s + d.amount, 0);

    const frontEndDTI = monthlyIncome > 0 ? (housingDebt / monthlyIncome) * 100 : 0;
    const backEndDTI = monthlyIncome > 0 ? (totalDebt / monthlyIncome) * 100 : 0;

    // How much to pay off to reach target DTI
    const maxDebtAtTarget = (targetDTI / 100) * monthlyIncome;
    const debtToPayOff = Math.max(0, totalDebt - maxDebtAtTarget);

    // Max additional monthly payment at target DTI
    const maxAdditional = Math.max(0, maxDebtAtTarget - totalDebt);

    return { housingDebt, totalDebt, frontEndDTI, backEndDTI, debtToPayOff, maxAdditional, maxDebtAtTarget };
  }, [debts, monthlyIncome, targetDTI]);

  const getDTIColor = (dti: number) => {
    if (dti < 36) return { text: "text-green-400", bg: "bg-green-500", label: "Good", border: "border-green-500/30", bgLight: "bg-green-500/10" };
    if (dti < 43) return { text: "text-yellow-400", bg: "bg-yellow-500", label: "Fair", border: "border-yellow-500/30", bgLight: "bg-yellow-500/10" };
    return { text: "text-red-400", bg: "bg-red-500", label: "High", border: "border-red-500/30", bgLight: "bg-red-500/10" };
  };

  const backColor = getDTIColor(result.backEndDTI);
  const frontColor = getDTIColor(result.frontEndDTI);

  // Gauge rendering
  const renderGauge = (value: number, label: string) => {
    const clampedValue = Math.min(value, 60);
    const pct = (clampedValue / 60) * 100;
    const color = getDTIColor(value);
    // Zone widths: 0-36 = 60%, 36-43 = 11.67%, 43-60 = 28.33%
    const greenW = (36 / 60) * 100;
    const yellowW = (7 / 60) * 100;
    const redW = (17 / 60) * 100;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-zinc-400">{label}</span>
          <span className={`text-2xl font-bold ${color.text}`}>{fmtP(value)}</span>
        </div>
        <div className="relative h-5 rounded-full overflow-hidden flex">
          <div className="bg-green-500/30 h-full" style={{ width: `${greenW}%` }} />
          <div className="bg-yellow-500/30 h-full" style={{ width: `${yellowW}%` }} />
          <div className="bg-red-500/30 h-full" style={{ width: `${redW}%` }} />
          {/* Needle */}
          <div
            className={`absolute top-0 h-full w-1 ${color.bg} rounded-full transition-all duration-500 ease-out`}
            style={{ left: `calc(${Math.min(pct, 100)}% - 2px)` }}
          />
          {/* Filled portion */}
          <div
            className={`absolute top-0 left-0 h-full ${color.bg} opacity-40 rounded-l-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex text-[10px] text-zinc-500 justify-between px-0.5">
          <span>0%</span>
          <span style={{ position: "absolute", left: `calc(${greenW}% - 8px)` }} className="relative">36%</span>
          <span style={{ position: "absolute", left: `calc(${greenW + yellowW}% - 8px)` }} className="relative">43%</span>
          <span>60%</span>
        </div>
      </div>
    );
  };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const selectCls = "bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500";

  return (
    <ToolLayout
      title="Debt-to-Income Ratio Calculator"
      description="Calculate your front-end and back-end DTI ratios. See where you stand for mortgage qualification, and find out how much debt to reduce to hit your target ratio."
      slug="debt-to-income-calculator"
      category="Finance"
      keywords={[
        "debt to income ratio calculator",
        "DTI calculator",
        "debt to income calculator",
        "back end DTI ratio",
        "front end DTI ratio",
        "mortgage DTI calculator",
        "debt ratio calculator",
        "DTI for mortgage",
      ]}
      faqs={[
        {
          question: "What is a debt-to-income (DTI) ratio?",
          answer:
            "Your debt-to-income ratio is the percentage of your gross monthly income that goes toward paying debts. Lenders use it to gauge your ability to manage monthly payments and repay borrowed money. A lower DTI means less risk to lenders and more borrowing power for you.",
        },
        {
          question: "What is the difference between front-end and back-end DTI?",
          answer:
            "Front-end DTI (also called the housing ratio) only includes housing-related costs like mortgage or rent. Back-end DTI includes all recurring monthly debts: housing, car payments, student loans, credit cards, child support, and any other obligations. Lenders evaluate both, but back-end DTI is typically the deciding factor.",
        },
        {
          question: "What is a good debt-to-income ratio for a mortgage?",
          answer:
            "For a conventional mortgage, lenders prefer a front-end DTI of 28% or less and a back-end DTI of 36% or less. FHA loans allow up to 43% back-end (sometimes 50% with compensating factors). VA loans have a guideline of 41% back-end but no strict front-end limit. Generally, keeping your DTI below 36% gives you the most options.",
        },
        {
          question: "How can I lower my debt-to-income ratio?",
          answer:
            "You can lower DTI by paying down existing debts (especially high-payment ones like car loans or credit cards), increasing your income, avoiding new debt, or refinancing to lower monthly payments. Even paying off a single debt can significantly improve your ratio and mortgage eligibility.",
        },
        {
          question: "Does DTI affect my credit score?",
          answer:
            "DTI itself does not directly appear on your credit report or affect your credit score. However, the factors that cause high DTI — like high credit card balances — do impact your credit utilization ratio, which is a major credit score factor. Reducing debt improves both your DTI and your credit profile.",
        },
        {
          question: "Is gross or net income used for DTI calculations?",
          answer:
            "Lenders use gross income (before taxes and deductions) when calculating DTI. This is your total pre-tax salary, not your take-home pay. Self-employed borrowers typically use adjusted gross income from tax returns. This calculator uses gross monthly income for accurate lender-comparable results.",
        },
      ]}
      relatedTools={[
        { name: "Mortgage Affordability Calculator", href: "/tools/mortgage-affordability-calculator" },
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <h2 className="text-2xl font-display text-zinc-100">How to Use the DTI Calculator</h2>
          <p className="text-zinc-400 leading-relaxed">
            Enter your gross income (annual salary or monthly), then add each of your monthly debt payments. The calculator instantly computes your front-end DTI (housing costs only) and back-end DTI (all debts). Use the visual gauge to see where you land relative to common lender thresholds, and check the recommendations section to learn exactly how much debt to eliminate to reach your target ratio.
          </p>
          <h3 className="text-xl font-display text-zinc-100">Understanding the DTI Zones</h3>
          <ul className="list-disc list-inside text-zinc-400 space-y-1 leading-relaxed">
            <li><span className="text-green-400 font-medium">Green (below 36%)</span> — You are in excellent shape for most loan types.</li>
            <li><span className="text-yellow-400 font-medium">Yellow (36% - 43%)</span> — Acceptable for FHA and some conventional loans, but reducing debt will improve your rate.</li>
            <li><span className="text-red-400 font-medium">Red (above 43%)</span> — Most lenders will consider this too high. Focus on paying down debts or increasing income before applying.</li>
          </ul>
        </div>
      }
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-5">
          {/* Income */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Income</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIncomeMode("annual");
                  setAnnualSalary(Math.round(monthlyGross * 12));
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${incomeMode === "annual" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}
              >
                Annual Salary
              </button>
              <button
                onClick={() => {
                  setIncomeMode("monthly");
                  setMonthlyGross(Math.round(annualSalary / 12));
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${incomeMode === "monthly" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}
              >
                Monthly Gross
              </button>
            </div>
            {incomeMode === "annual" ? (
              <div>
                <label className={labelCls}>Annual Gross Salary ($)</label>
                <input type="number" value={annualSalary} onChange={(e) => setAnnualSalary(+e.target.value)} className={inputCls} min={0} step={1000} />
                <p className="text-xs text-zinc-500 mt-1">Monthly: {fmtC(annualSalary / 12)}</p>
              </div>
            ) : (
              <div>
                <label className={labelCls}>Monthly Gross Income ($)</label>
                <input type="number" value={monthlyGross} onChange={(e) => setMonthlyGross(+e.target.value)} className={inputCls} min={0} step={100} />
                <p className="text-xs text-zinc-500 mt-1">Annual: {fmtC(monthlyGross * 12)}</p>
              </div>
            )}
          </div>

          {/* Debts */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Monthly Debts</h3>
              <button onClick={addDebt} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg transition-colors">
                + Add Debt
              </button>
            </div>
            {debts.length === 0 && <p className="text-sm text-zinc-500 italic">No debts added. Click &quot;+ Add Debt&quot; to begin.</p>}
            <div className="space-y-2">
              {debts.map((debt) => (
                <div key={debt.id} className="flex gap-2 items-center">
                  <select
                    value={debt.type}
                    onChange={(e) => updateDebt(debt.id, "type", e.target.value)}
                    className={`${selectCls} flex-shrink-0 w-36`}
                  >
                    {Object.entries(DEBT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                    <input
                      type="number"
                      value={debt.amount}
                      onChange={(e) => updateDebt(debt.id, "amount", +e.target.value)}
                      className={`${inputCls} pl-7`}
                      min={0}
                      step={25}
                    />
                  </div>
                  <button
                    onClick={() => removeDebt(debt.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                    aria-label="Remove debt"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-700 text-sm">
              <span className="text-zinc-400">Total Monthly Debts</span>
              <span className="text-zinc-100 font-semibold">{fmtC(result.totalDebt)}/mo</span>
            </div>
          </div>

          {/* Target DTI */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-2">
            <label className={labelCls}>Target DTI (%)</label>
            <input
              type="range"
              min={10}
              max={50}
              value={targetDTI}
              onChange={(e) => setTargetDTI(+e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>10%</span>
              <span className="text-blue-400 font-medium">{targetDTI}%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {/* Gauges */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-5">
            {renderGauge(result.frontEndDTI, "Front-End DTI (Housing Only)")}
            <div className="border-t border-zinc-700" />
            {renderGauge(result.backEndDTI, "Back-End DTI (All Debts)")}
          </div>

          {/* DTI Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`${frontColor.bgLight} border ${frontColor.border} rounded-xl p-4 text-center`}>
              <p className="text-xs text-zinc-400 mb-1">Front-End DTI</p>
              <p className={`text-2xl font-bold ${frontColor.text}`}>{fmtP(result.frontEndDTI)}</p>
              <p className={`text-xs mt-1 ${frontColor.text}`}>{frontColor.label}</p>
            </div>
            <div className={`${backColor.bgLight} border ${backColor.border} rounded-xl p-4 text-center`}>
              <p className="text-xs text-zinc-400 mb-1">Back-End DTI</p>
              <p className={`text-2xl font-bold ${backColor.text}`}>{fmtP(result.backEndDTI)}</p>
              <p className={`text-xs mt-1 ${backColor.text}`}>{backColor.label}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Recommendations</h3>
            {result.backEndDTI <= targetDTI ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-lg leading-none mt-0.5">&#10003;</span>
                  <p className="text-sm text-zinc-300">
                    Your DTI is at or below your {targetDTI}% target. You can take on up to <span className="font-semibold text-green-400">{fmtC(result.maxAdditional)}/mo</span> in additional debt and stay within your target ratio.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-lg leading-none mt-0.5">!</span>
                  <p className="text-sm text-zinc-300">
                    To reach a {targetDTI}% DTI, reduce your monthly debts by <span className="font-semibold text-yellow-400">{fmtC(result.debtToPayOff)}/mo</span>.
                  </p>
                </div>
                <p className="text-xs text-zinc-500">
                  Your max total monthly debt at {targetDTI}% DTI is {fmtC(result.maxDebtAtTarget)}/mo. You currently have {fmtC(result.totalDebt)}/mo.
                </p>
              </div>
            )}
          </div>

          {/* Debt Breakdown */}
          {debts.length > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Debt Breakdown</h3>
              {debts.map((d) => {
                const pct = result.totalDebt > 0 ? (d.amount / result.totalDebt) * 100 : 0;
                return (
                  <div key={d.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{d.label}</span>
                      <span className="text-zinc-200">{fmtC(d.amount)} <span className="text-zinc-500 text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lender Guidelines */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Lender Guidelines</h3>
            <div className="space-y-2">
              {LENDER_GUIDELINES.map((g) => {
                const qualifiesFront = g.maxFront === null || result.frontEndDTI <= g.maxFront;
                const qualifiesBack = result.backEndDTI <= g.maxBack;
                const qualifies = qualifiesFront && qualifiesBack;
                return (
                  <div key={g.name} className={`rounded-lg p-3 border ${qualifies ? "border-green-500/20 bg-green-500/5" : "border-zinc-700 bg-zinc-800/30"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-zinc-200">{g.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${qualifies ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {qualifies ? "Qualifies" : "Over Limit"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {g.maxFront !== null ? `Front: ${g.maxFront}%` : "No front-end limit"} &middot; Back: {g.maxBack}%
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{g.note}</p>
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
