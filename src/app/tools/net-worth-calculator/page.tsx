"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

const defaultAssets = [
  { name: "Checking Accounts", amount: 5000 },
  { name: "Savings Accounts", amount: 15000 },
  { name: "Retirement (401k/IRA)", amount: 50000 },
  { name: "Investment Accounts", amount: 20000 },
  { name: "Home Value", amount: 300000 },
  { name: "Vehicle Value", amount: 15000 },
  { name: "Other Assets", amount: 0 },
];

const defaultLiabilities = [
  { name: "Mortgage", amount: 220000 },
  { name: "Auto Loan", amount: 8000 },
  { name: "Student Loans", amount: 25000 },
  { name: "Credit Card Debt", amount: 3000 },
  { name: "Other Debts", amount: 0 },
];

export default function Page() {
  const [assets, setAssets] = useState(defaultAssets);
  const [liabilities, setLiabilities] = useState(defaultLiabilities);

  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const updateAsset = (i: number, amount: number) => setAssets(prev => prev.map((a, idx) => idx === i ? { ...a, amount } : a));
  const updateLiability = (i: number, amount: number) => setLiabilities(prev => prev.map((l, idx) => idx === i ? { ...l, amount } : l));

  const inputCls = "flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500";

  return (
    <ToolLayout
      title="Net Worth Calculator"
      description="Calculate your net worth by adding up assets and subtracting liabilities. Track your financial health."
      slug="net-worth-calculator"
      category="Finance"
      keywords={["net worth calculator", "calculate net worth", "net worth tracker", "personal net worth calculator", "wealth calculator"]}
      faqs={[
        { question: "What is net worth?", answer: "Net worth = Total Assets - Total Liabilities. It's a snapshot of your financial health. Positive net worth means you own more than you owe. The average US household net worth is about $1.06 million, but the median is $192,700." },
        { question: "Should I include my home in net worth?", answer: "Yes, your home is an asset. Include its current market value in assets and your remaining mortgage in liabilities. Some people track 'liquid net worth' separately, excluding home equity." },
        { question: "What is a good net worth by age?", answer: "A common target: your net worth should be roughly your annual salary × (age/10). At 30 earning $60K, target ~$180K. At 40, ~$240K. At 50, ~$300K. These are guidelines — circumstances vary." },
      ]}
      relatedTools={[
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
      ]}
    >
      <div className="space-y-4 mb-6">
        <div className={`border rounded-xl p-5 text-center ${netWorth >= 0 ? "bg-zinc-800/50 border-zinc-700" : "bg-red-500/10 border-red-500/20"}`}>
          <p className="text-sm text-zinc-400 mb-1">Net Worth</p>
          <p className={`text-5xl font-bold ${netWorth >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtC(netWorth)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center"><p className="text-xs text-green-300">Total Assets</p><p className="text-xl font-semibold text-green-400">{fmtC(totalAssets)}</p></div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center"><p className="text-xs text-red-300">Total Liabilities</p><p className="text-xl font-semibold text-red-400">{fmtC(totalLiabilities)}</p></div>
        </div>
        {totalAssets > 0 && (
          <div>
            <div className="flex rounded-lg overflow-hidden h-4">
              <div className="bg-green-500" style={{ width: `${(totalAssets / (totalAssets + totalLiabilities)) * 100}%` }} />
              <div className="bg-red-500" style={{ width: `${(totalLiabilities / (totalAssets + totalLiabilities)) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>Assets</span>
              <span>Debt-to-Asset: {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(0) : 0}%</span>
              <span>Liabilities</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-green-400 mb-3">Assets</h3>
          <div className="space-y-2">
            {assets.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-zinc-300 w-48 truncate">{a.name}</span>
                <input type="number" value={a.amount} onChange={e => updateAsset(i, +e.target.value)} className={inputCls} min={0} step={1000} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-3">Liabilities</h3>
          <div className="space-y-2">
            {liabilities.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-zinc-300 w-48 truncate">{l.name}</span>
                <input type="number" value={l.amount} onChange={e => updateLiability(i, +e.target.value)} className={inputCls} min={0} step={1000} />
              </div>
            ))}
          </div>
        </div>
      </div>

    </ToolLayout>
  );
}
