"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [price, setPrice] = useState(79.99);
  const [discount, setDiscount] = useState(25);
  const [secondDiscount, setSecondDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);

  const discountAmount = price * (discount / 100);
  const afterFirst = price - discountAmount;
  const secondAmount = afterFirst * (secondDiscount / 100);
  const afterSecond = afterFirst - secondAmount;
  const taxAmount = afterSecond * (taxRate / 100);
  const finalPrice = afterSecond + taxAmount;
  const totalSaved = price - afterSecond;
  const effectiveDiscount = price > 0 ? (totalSaved / price) * 100 : 0;

  const presets = [10, 15, 20, 25, 30, 40, 50, 75];
  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Discount Calculator"
      description="Calculate the final price after discount. Supports double discounts, sales tax, and shows total savings."
      slug="discount-calculator"
      category="Finance"
      keywords={["discount calculator", "sale price calculator", "percent off calculator", "discount percentage calculator", "savings calculator"]}
      faqs={[
        { question: "How do I calculate a discount?", answer: "Multiply the original price by the discount percentage divided by 100, then subtract from the original price. Example: $80 with 25% off = $80 - ($80 × 0.25) = $80 - $20 = $60." },
        { question: "How do double discounts work?", answer: "Double discounts are applied sequentially, not added. A 20% + 10% discount is NOT 30% off. First apply 20% to the original, then apply 10% to the already-discounted price. The effective discount is 28%." },
        { question: "Is tax calculated before or after discount?", answer: "Sales tax is calculated on the discounted price, not the original price. This means you save on tax too when buying discounted items." },
      ]}
      relatedTools={[
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Sales Tax Calculator", href: "/tools/sales-tax-calculator" },
        { name: "Tip Calculator", href: "/tools/tip-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Original Price ($)</label>
            <input type="number" value={price} onChange={e => setPrice(+e.target.value)} className={inputCls} min={0} step={0.01} />
          </div>
          <div>
            <label className={labelCls}>Discount (%)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {presets.map(p => (
                <button key={p} onClick={() => setDiscount(p)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${discount === p ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{p}%</button>
              ))}
            </div>
            <input type="number" value={discount} onChange={e => setDiscount(+e.target.value)} className={inputCls} min={0} max={100} step={0.5} />
          </div>
          <div>
            <label className={labelCls}>Second Discount % (optional)</label>
            <input type="number" value={secondDiscount} onChange={e => setSecondDiscount(+e.target.value)} className={inputCls} min={0} max={100} step={0.5} />
            <p className="text-xs text-zinc-500 mt-1">Applied after the first discount (e.g. extra 10% off sale)</p>
          </div>
          <div>
            <label className={labelCls}>Sales Tax % (optional)</label>
            <input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.25} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Final Price</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(finalPrice)}</p>
            {taxRate > 0 && <p className="text-xs text-zinc-500 mt-1">Before tax: {fmtC(afterSecond)}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-green-300">You Save</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(totalSaved)}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-green-300">Effective Discount</p>
              <p className="text-lg font-semibold text-green-400">{effectiveDiscount.toFixed(1)}%</p>
            </div>
          </div>
          {taxRate > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Tax Amount</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtC(taxAmount)}</p>
            </div>
          )}

          {/* Price breakdown */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-zinc-400">Original Price</span><span className="text-zinc-100">{fmtC(price)}</span></div>
            <div className="flex justify-between text-green-400"><span>First Discount ({discount}%)</span><span>−{fmtC(discountAmount)}</span></div>
            {secondDiscount > 0 && <div className="flex justify-between text-green-400"><span>Second Discount ({secondDiscount}%)</span><span>−{fmtC(secondAmount)}</span></div>}
            <div className="flex justify-between border-t border-zinc-700 pt-1"><span className="text-zinc-300">Subtotal</span><span className="text-zinc-100">{fmtC(afterSecond)}</span></div>
            {taxRate > 0 && <div className="flex justify-between"><span className="text-zinc-400">Tax ({taxRate}%)</span><span className="text-zinc-100">+{fmtC(taxAmount)}</span></div>}
            <div className="flex justify-between border-t border-zinc-700 pt-1 font-semibold"><span className="text-zinc-200">Total</span><span className="text-blue-400">{fmtC(finalPrice)}</span></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
