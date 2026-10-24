"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

const defaultCategories = [
  { name: "Housing (Rent/Mortgage)", amount: 1500 },
  { name: "Utilities", amount: 200 },
  { name: "Groceries", amount: 400 },
  { name: "Transportation", amount: 300 },
  { name: "Insurance", amount: 200 },
  { name: "Healthcare", amount: 100 },
  { name: "Dining Out", amount: 150 },
  { name: "Entertainment", amount: 100 },
  { name: "Savings", amount: 500 },
  { name: "Debt Payments", amount: 200 },
  { name: "Other", amount: 150 },
];

export default function Page() {
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState(defaultCategories);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = income - totalExpenses;
  const savingsRate = income > 0 ? ((expenses.find(e => e.name.includes("Savings"))?.amount || 0) / income) * 100 : 0;

  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#06b6d4"];

  const updateExpense = (index: number, amount: number) => {
    setExpenses(prev => prev.map((e, i) => i === index ? { ...e, amount } : e));
  };

  // 50/30/20 rule
  const rule = useMemo(() => {
    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;
    return { needs, wants, savings };
  }, [income]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Budget Calculator"
      description="Plan your monthly budget with income and expense categories. See where your money goes and compare with the 50/30/20 rule."
      slug="budget-calculator"
      category="Finance"
      keywords={["budget calculator", "monthly budget calculator", "budget planner", "expense calculator", "personal budget calculator"]}
      faqs={[
        { question: "What is the 50/30/20 budget rule?", answer: "A simple budgeting guideline: 50% of after-tax income goes to needs (housing, food, utilities), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment. It's a starting point — adjust to your situation." },
        { question: "How much should I spend on housing?", answer: "The general rule is no more than 30% of gross income on housing. With a $5,000/month income, that's $1,500. In high-cost areas, people often spend more, but try to keep it under 35%." },
        { question: "How much should I save each month?", answer: "Aim for at least 20% of income. Start with an emergency fund (3-6 months of expenses), then focus on retirement savings (15% of income) and other goals. Even 10% is better than nothing." },
      ]}
      relatedTools={[
        { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Monthly Income ($)</label>
            <input type="number" value={income} onChange={e => setIncome(+e.target.value)} className={inputCls} min={0} step={100} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Monthly Expenses</p>
            {expenses.map((exp, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="text-sm text-zinc-300 w-48 truncate">{exp.name}</span>
                <input type="number" value={exp.amount} onChange={e => updateExpense(i, +e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" min={0} step={25} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`border rounded-xl p-5 text-center ${remaining >= 0 ? "bg-zinc-800/50 border-zinc-700" : "bg-red-500/10 border-red-500/20"}`}>
            <p className="text-sm text-zinc-400 mb-1">Remaining</p>
            <p className={`text-4xl font-bold ${remaining >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtC(remaining)}</p>
            <p className="text-xs text-zinc-500 mt-1">of {fmtC(income)} income</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Expenses</p><p className="text-lg font-semibold text-red-400">{fmtC(totalExpenses)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">% Spent</p><p className="text-lg font-semibold text-zinc-100">{income > 0 ? ((totalExpenses / income) * 100).toFixed(0) : 0}%</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Savings Rate</p><p className="text-lg font-semibold text-green-400">{savingsRate.toFixed(0)}%</p></div>
          </div>

          {/* Expense breakdown bar */}
          {totalExpenses > 0 && (
            <div>
              <div className="flex rounded-lg overflow-hidden h-6">
                {expenses.filter(e => e.amount > 0).map((e, i) => (
                  <div key={i} style={{ width: `${(e.amount / totalExpenses) * 100}%`, backgroundColor: colors[expenses.indexOf(e) % colors.length] }} title={`${e.name}: ${fmtC(e.amount)}`} />
                ))}
              </div>
              <div className="mt-2 space-y-0.5">
                {expenses.filter(e => e.amount > 0).map((e, i) => {
                  const pct = totalExpenses > 0 ? (e.amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[expenses.indexOf(e) % colors.length] }} />
                      <span className="text-zinc-400 flex-1">{e.name}</span>
                      <span className="text-zinc-300">{fmtC(e.amount)} ({pct.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 50/30/20 rule */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">50/30/20 Rule Targets</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Needs (50%)</span><span className="text-zinc-100">{fmtC(rule.needs)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Wants (30%)</span><span className="text-zinc-100">{fmtC(rule.wants)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Savings (20%)</span><span className="text-zinc-100">{fmtC(rule.savings)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
