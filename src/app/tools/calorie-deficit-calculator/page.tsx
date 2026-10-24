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
  const [goal, setGoal] = useState<"lose1" | "lose15" | "lose2" | "custom">("lose1");
  const [customDeficit, setCustomDeficit] = useState(500);

  const result = useMemo(() => {
    const weightKg = unit === "imperial" ? weight * 0.453592 : weight;
    const heightCm = unit === "imperial" ? height * 2.54 : height;

    const bmr = sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const tdee = Math.round(bmr * activity);

    const deficits: Record<string, number> = { lose1: 500, lose15: 750, lose2: 1000, custom: customDeficit };
    const deficit = deficits[goal];
    const target = Math.max(1200, tdee - deficit);
    const weeklyLoss = (deficit * 7) / 3500;
    const goalLbs = unit === "imperial" ? 20 : 9;
    const weeksToGoal = Math.round(goalLbs / weeklyLoss);

    return { bmr: Math.round(bmr), tdee, deficit, target, weeklyLoss, weeksToGoal };
  }, [sex, age, weight, height, unit, activity, goal, customDeficit]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Calorie Deficit Calculator"
      description="Calculate how many calories to eat for weight loss. Based on your TDEE with adjustable deficit levels."
      slug="calorie-deficit-calculator"
      category="Health"
      keywords={["calorie deficit calculator", "weight loss calorie calculator", "how many calories to lose weight", "calorie deficit for weight loss"]}
      faqs={[
        { question: "What is a calorie deficit?", answer: "A calorie deficit means eating fewer calories than your body burns (TDEE). A deficit of 500 calories/day leads to about 1 lb of fat loss per week (3,500 cal = 1 lb)." },
        { question: "How big should my deficit be?", answer: "A 500 cal/day deficit (1 lb/week) is sustainable for most people. Deficits over 1,000 cal/day can cause muscle loss, fatigue, and metabolic slowdown. Never eat below 1,200 cal/day without medical supervision." },
        { question: "Why am I not losing weight in a deficit?", answer: "Common reasons: underestimating portions, not tracking cooking oils/drinks, water retention masking fat loss, or metabolic adaptation. Try re-measuring your food intake accurately for 1-2 weeks." },
      ]}
      relatedTools={[
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "Macro Calculator", href: "/tools/macro-calculator" },
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
              <option value={1.2}>Sedentary (desk job, no exercise)</option>
              <option value={1.375}>Light (1-3 days/week)</option>
              <option value={1.55}>Moderate (3-5 days/week)</option>
              <option value={1.725}>Active (6-7 days/week)</option>
              <option value={1.9}>Very Active (2x/day)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Weight Loss Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {([["lose1", "1 lb/week"], ["lose15", "1.5 lb/week"], ["lose2", "2 lb/week"], ["custom", "Custom"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setGoal(val)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${goal === val ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
              ))}
            </div>
          </div>
          {goal === "custom" && (
            <div><label className={labelCls}>Daily Deficit (calories)</label><input type="number" value={customDeficit} onChange={e => setCustomDeficit(+e.target.value)} className={inputCls} min={100} max={1500} step={50} /></div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Daily Calorie Target</p>
            <p className="text-5xl font-bold text-blue-400">{result.target.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">calories/day to lose weight</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Your TDEE</p><p className="text-lg font-semibold text-zinc-100">{result.tdee.toLocaleString()} cal</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Daily Deficit</p><p className="text-lg font-semibold text-red-400">-{result.deficit} cal</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Weekly Loss</p><p className="text-lg font-semibold text-green-400">{result.weeklyLoss.toFixed(1)} lb/wk</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">20 lbs in</p><p className="text-lg font-semibold text-zinc-100">~{result.weeksToGoal} weeks</p></div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Macro Split Suggestions (at {result.target} cal)</p>
            <div className="space-y-1">
              {[
                ["High Protein", 0.40, 0.30, 0.30],
                ["Balanced", 0.30, 0.40, 0.30],
                ["Low Carb", 0.35, 0.20, 0.45],
              ].map(([label, p, c, f]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{label}</span>
                  <span className="text-zinc-100">{Math.round((result.target * (p as number)) / 4)}g P / {Math.round((result.target * (c as number)) / 4)}g C / {Math.round((result.target * (f as number)) / 9)}g F</span>
                </div>
              ))}
            </div>
          </div>

          {result.target <= 1200 && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-300">
              Warning: Your target is at the minimum safe threshold (1,200 cal). Consider a smaller deficit or increasing activity level.
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
