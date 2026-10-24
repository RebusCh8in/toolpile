"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(185);
  const [height, setHeight] = useState(70);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("lose");
  const [netCarbs, setNetCarbs] = useState(20);

  const result = useMemo(() => {
    const weightKg = unit === "imperial" ? weight * 0.453592 : weight;
    const heightCm = unit === "imperial" ? height * 2.54 : height;

    const bmr = sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const tdee = Math.round(bmr * activity);
    const adjustments: Record<string, number> = { lose: -500, maintain: 0, gain: 300 };
    const targetCal = Math.max(1200, tdee + adjustments[goal]);

    // Keto macros: net carbs fixed, protein ~0.8g/lb lean mass, rest is fat
    const carbCal = netCarbs * 4;
    const proteinG = Math.round(weightKg * 1.5); // mid-range for keto
    const proteinCal = proteinG * 4;
    const fatCal = targetCal - carbCal - proteinCal;
    const fatG = Math.round(fatCal / 9);

    const carbPct = Math.round((carbCal / targetCal) * 100);
    const proteinPct = Math.round((proteinCal / targetCal) * 100);
    const fatPct = Math.round((fatCal / targetCal) * 100);

    return { tdee, targetCal, netCarbs, proteinG, fatG, carbCal, proteinCal, fatCal, carbPct, proteinPct, fatPct };
  }, [sex, age, weight, height, unit, activity, goal, netCarbs]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Keto Calculator"
      description="Calculate your keto macros — fat, protein, and net carbs for a ketogenic diet."
      slug="keto-calculator"
      category="Health"
      keywords={["keto calculator", "keto macro calculator", "ketogenic diet calculator", "keto diet macros", "low carb calculator"]}
      faqs={[
        { question: "What is a keto diet?", answer: "A ketogenic diet is very low carb (typically 20-50g net carbs/day), moderate protein, and high fat. This shifts your body into ketosis, where it burns fat for fuel instead of carbohydrates." },
        { question: "How many carbs for keto?", answer: "Most people enter ketosis at under 20-25g net carbs per day. Some can stay in ketosis up to 50g. Net carbs = total carbs minus fiber. Start at 20g and adjust based on results." },
        { question: "How much protein on keto?", answer: "Aim for 1.2-2.0g per kg of body weight. Too little protein causes muscle loss. Despite common belief, moderate-high protein doesn't kick you out of ketosis." },
      ]}
      relatedTools={[
        { name: "Macro Calculator", href: "/tools/macro-calculator" },
        { name: "Calorie Deficit Calculator", href: "/tools/calorie-deficit-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["imperial", "metric"] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${unit === u ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{u}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["male", "female"] as const).map(s => (
              <button key={s} onClick={() => setSex(s)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${sex === s ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{s}</button>
            ))}
          </div>
          <div><label className={labelCls}>Age</label><input type="number" value={age} onChange={e => setAge(+e.target.value)} className={inputCls} min={15} max={100} /></div>
          <div><label className={labelCls}>Weight ({unit === "imperial" ? "lbs" : "kg"})</label><input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className={inputCls} min={50} max={500} /></div>
          <div><label className={labelCls}>Height ({unit === "imperial" ? "inches" : "cm"})</label><input type="number" value={height} onChange={e => setHeight(+e.target.value)} className={inputCls} min={36} max={250} /></div>
          <div>
            <label className={labelCls}>Activity Level</label>
            <select value={activity} onChange={e => setActivity(+e.target.value)} className={inputCls}>
              <option value={1.2}>Sedentary</option>
              <option value={1.375}>Light (1-3 days/week)</option>
              <option value={1.55}>Moderate (3-5 days/week)</option>
              <option value={1.725}>Active (6-7 days/week)</option>
              <option value={1.9}>Very Active</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Goal</label>
            <div className="flex gap-2">
              {([["lose", "Lose Fat"], ["maintain", "Maintain"], ["gain", "Gain Muscle"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setGoal(val)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${goal === val ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
              ))}
            </div>
          </div>
          <div><label className={labelCls}>Net Carbs (g/day)</label><input type="number" value={netCarbs} onChange={e => setNetCarbs(+e.target.value)} className={inputCls} min={5} max={100} step={5} /></div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Daily Calories</p>
            <p className="text-4xl font-bold text-blue-400">{result.targetCal.toLocaleString()} cal</p>
            <p className="text-xs text-zinc-500 mt-1">TDEE: {result.tdee.toLocaleString()} cal</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Fat</p>
              <p className="text-2xl font-bold text-yellow-400">{result.fatG}g</p>
              <p className="text-xs text-zinc-500">{result.fatPct}% • {result.fatCal} cal</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Protein</p>
              <p className="text-2xl font-bold text-red-400">{result.proteinG}g</p>
              <p className="text-xs text-zinc-500">{result.proteinPct}% • {result.proteinCal} cal</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Net Carbs</p>
              <p className="text-2xl font-bold text-green-400">{result.netCarbs}g</p>
              <p className="text-xs text-zinc-500">{result.carbPct}% • {result.carbCal} cal</p>
            </div>
          </div>

          {/* Visual ratio bar */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Macro Ratio</p>
            <div className="w-full h-4 rounded-full overflow-hidden flex">
              <div className="bg-yellow-500 h-full" style={{ width: `${result.fatPct}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${result.proteinPct}%` }} />
              <div className="bg-green-500 h-full" style={{ width: `${result.carbPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>Fat {result.fatPct}%</span>
              <span>Protein {result.proteinPct}%</span>
              <span>Carbs {result.carbPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
