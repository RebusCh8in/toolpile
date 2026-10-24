"use client";
import { useState } from "react";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function TipCalculator() {
  const [bill, setBill] = useState(85);
  const [tipPercent, setTipPercent] = useState(20);
  const [people, setPeople] = useState(1);
  const [customTip, setCustomTip] = useState("");
  const [roundUp, setRoundUp] = useState(false);

  const effectiveTip = customTip !== "" ? +customTip : tipPercent;
  const tipAmount = bill * (effectiveTip / 100);
  let total = bill + tipAmount;
  if (roundUp) total = Math.ceil(total);
  const finalTip = total - bill;
  const perPerson = people > 0 ? total / people : total;
  const tipPerPerson = people > 0 ? finalTip / people : finalTip;

  const presets = [10, 15, 18, 20, 25, 30];
  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Bill Amount ($)</label>
          <input type="number" value={bill} onChange={e => setBill(+e.target.value)} className={inputCls} min={0} step={0.01} />
        </div>

        <div>
          <label className={labelCls}>Tip Percentage</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {presets.map(p => (
              <button key={p} onClick={() => { setTipPercent(p); setCustomTip(""); }} className={`py-2 rounded-lg text-sm font-medium transition-colors ${tipPercent === p && customTip === "" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                {p}%
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-zinc-500">Custom %</label>
            <input type="number" value={customTip} onChange={e => setCustomTip(e.target.value)} placeholder="Custom %" className={inputCls} min={0} max={100} step={1} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Split Between</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setPeople(Math.max(1, people - 1))} className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 text-lg font-bold transition-colors">−</button>
            <span className="text-2xl font-bold text-zinc-100 w-12 text-center">{people}</span>
            <button onClick={() => setPeople(people + 1)} className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 text-lg font-bold transition-colors">+</button>
            <span className="text-sm text-zinc-500">{people === 1 ? "person" : "people"}</span>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={roundUp} onChange={e => setRoundUp(e.target.checked)} className="rounded bg-zinc-800 border-zinc-600" />
          <span className="text-sm text-zinc-400">Round up to nearest dollar</span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <p className="text-sm text-zinc-400 mb-1">Total</p>
          <p className="text-4xl font-bold text-blue-400">{fmtC(total)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500">Tip Amount</p>
            <p className="text-lg font-semibold text-green-400">{fmtC(finalTip)}</p>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500">Tip %</p>
            <p className="text-lg font-semibold text-zinc-100">{(bill > 0 ? (finalTip / bill) * 100 : 0).toFixed(1)}%</p>
          </div>
        </div>
        {people > 1 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300">Per Person</p>
              <p className="text-lg font-semibold text-blue-400">{fmtC(perPerson)}</p>
            </div>
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300">Tip Per Person</p>
              <p className="text-lg font-semibold text-blue-400">{fmtC(tipPerPerson)}</p>
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-2">Compare Tips</p>
          <div className="space-y-1.5">
            {presets.map(p => {
              const t = bill * (p / 100);
              const tot = bill + t;
              const isActive = p === effectiveTip;
              return (
                <div key={p} className={`flex justify-between text-sm px-2 py-1 rounded ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                  <span>{p}%</span>
                  <span>Tip: {fmtC(t)}</span>
                  <span>Total: {fmtC(tot)}</span>
                  {people > 1 && <span>Each: {fmtC(tot / people)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
