"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [buyPrice, setBuyPrice] = useState(150);
  const [sellPrice, setSellPrice] = useState(195);
  const [shares, setShares] = useState(100);
  const [buyCommission, setBuyCommission] = useState(0);
  const [sellCommission, setSellCommission] = useState(0);

  const result = useMemo(() => {
    const totalBuy = buyPrice * shares + buyCommission;
    const totalSell = sellPrice * shares - sellCommission;
    const profit = totalSell - totalBuy;
    const roi = totalBuy > 0 ? (profit / totalBuy) * 100 : 0;
    const breakEven = shares > 0 ? (totalBuy + sellCommission) / shares : 0;

    return { totalBuy, totalSell, profit, roi, breakEven };
  }, [buyPrice, sellPrice, shares, buyCommission, sellCommission]);

  const isPositive = result.profit >= 0;
  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Stock Profit Calculator"
      description="Calculate stock trading profit or loss. Enter buy/sell prices and shares to see total return, ROI, and break-even price."
      slug="stock-profit-calculator"
      category="Finance"
      keywords={["stock profit calculator", "stock calculator", "stock return calculator", "share profit calculator", "stock gain calculator"]}
      faqs={[
        { question: "How is stock profit calculated?", answer: "Profit = (Sell Price × Shares - Sell Commission) - (Buy Price × Shares + Buy Commission). Buy 100 shares at $150 and sell at $195: ($19,500) - ($15,000) = $4,500 profit." },
        { question: "What about taxes on stock profits?", answer: "Short-term gains (held <1 year) are taxed as ordinary income (up to 37%). Long-term gains (held >1 year) get preferential rates: 0%, 15%, or 20% depending on income. This calculator shows pre-tax profit." },
        { question: "What is break-even price?", answer: "The price per share you need to sell at to recover your total cost (including commissions). If you buy 100 shares at $150 with $10 commission, break-even = $15,010/100 = $150.10." },
      ]}
      relatedTools={[
        { name: "ROI Calculator", href: "/tools/roi-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Buy Price Per Share ($)</label><input type="number" value={buyPrice} onChange={e => setBuyPrice(+e.target.value)} className={inputCls} min={0} step={0.01} /></div>
          <div><label className={labelCls}>Sell Price Per Share ($)</label><input type="number" value={sellPrice} onChange={e => setSellPrice(+e.target.value)} className={inputCls} min={0} step={0.01} /></div>
          <div><label className={labelCls}>Number of Shares</label><input type="number" value={shares} onChange={e => setShares(+e.target.value)} className={inputCls} min={0} step={1} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Buy Commission ($)</label><input type="number" value={buyCommission} onChange={e => setBuyCommission(+e.target.value)} className={inputCls} min={0} step={1} /></div>
            <div><label className={labelCls}>Sell Commission ($)</label><input type="number" value={sellCommission} onChange={e => setSellCommission(+e.target.value)} className={inputCls} min={0} step={1} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`border rounded-xl p-5 text-center ${isPositive ? "bg-zinc-800/50 border-zinc-700" : "bg-red-500/10 border-red-500/20"}`}>
            <p className="text-sm text-zinc-400 mb-1">{isPositive ? "Profit" : "Loss"}</p>
            <p className={`text-5xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>{isPositive ? "+" : ""}{fmtC(result.profit)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">ROI</p><p className={`text-lg font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>{result.roi.toFixed(2)}%</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Break Even</p><p className="text-lg font-semibold text-yellow-400">{fmtC(result.breakEven)}</p></div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-zinc-400">Total Cost</span><span className="text-zinc-100">{fmtC(result.totalBuy)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Total Revenue</span><span className="text-zinc-100">{fmtC(result.totalSell)}</span></div>
            <div className="flex justify-between border-t border-zinc-700 pt-1 font-semibold"><span className="text-zinc-200">{isPositive ? "Net Profit" : "Net Loss"}</span><span className={isPositive ? "text-green-400" : "text-red-400"}>{fmtC(result.profit)}</span></div>
          </div>

          {/* Sell price scenarios */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Profit at Different Sell Prices</p>
            <div className="space-y-1">
              {[-20, -10, -5, 0, 5, 10, 20, 50].map(pctChange => {
                const sp = buyPrice * (1 + pctChange / 100);
                const p = (sp * shares - sellCommission) - (buyPrice * shares + buyCommission);
                const active = Math.abs(sp - sellPrice) < 0.01;
                return (
                  <div key={pctChange} className={`flex justify-between text-sm px-2 py-1 rounded ${active ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{pctChange > 0 ? "+" : ""}{pctChange}%</span>
                    <span>{fmtC(sp)}/share</span>
                    <span className={p >= 0 ? "text-green-400" : "text-red-400"}>{fmtC(p)}</span>
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
