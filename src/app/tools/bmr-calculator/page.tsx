"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(170);
  const [height, setHeight] = useState(70);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");

  const result = useMemo(() => {
    const weightKg = unit === "imperial" ? weight * 0.453592 : weight;
    const heightCm = unit === "imperial" ? height * 2.54 : height;

    // Mifflin-St Jeor
    const mifflin = sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    // Harris-Benedict (revised)
    const harris = sex === "male"
      ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
      : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;

    // Katch-McArdle (assumes ~20% body fat)
    const lbm = weightKg * 0.8;
    const katch = 370 + 21.6 * lbm;

    const avg = (mifflin + harris + katch) / 3;

    const activities = [
      { label: "Sedentary (little/no exercise)", factor: 1.2 },
      { label: "Light (1-3 days/week)", factor: 1.375 },
      { label: "Moderate (3-5 days/week)", factor: 1.55 },
      { label: "Active (6-7 days/week)", factor: 1.725 },
      { label: "Very Active (2x/day)", factor: 1.9 },
    ];

    return { mifflin: Math.round(mifflin), harris: Math.round(harris), katch: Math.round(katch), avg: Math.round(avg), activities };
  }, [sex, age, weight, height, unit]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="BMR Calculator"
      description="Calculate your Basal Metabolic Rate — calories your body burns at rest. Three formulas with activity level multipliers."
      slug="bmr-calculator"
      category="Health"
      keywords={["bmr calculator", "basal metabolic rate calculator", "resting metabolic rate calculator", "how many calories do I burn at rest"]}
      faqs={[
        { question: "What is BMR?", answer: "Basal Metabolic Rate is the number of calories your body needs at complete rest to maintain basic functions like breathing, circulation, and cell production. It typically accounts for 60-75% of daily energy expenditure." },
        { question: "Which BMR formula is best?", answer: "Mifflin-St Jeor is considered the most accurate for most people. Harris-Benedict tends to overestimate slightly. Katch-McArdle is best if you know your body fat percentage." },
        { question: "How is BMR different from TDEE?", answer: "BMR is calories at rest. TDEE (Total Daily Energy Expenditure) = BMR × activity multiplier. TDEE includes all daily activity and exercise. Use TDEE for calorie planning, not BMR alone." },
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
          <div><label className={labelCls}>Weight ({unit === "imperial" ? "lbs" : "kg"})</label><input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className={inputCls} min={50} max={500} step={1} /></div>
          <div><label className={labelCls}>Height ({unit === "imperial" ? "inches" : "cm"})</label><input type="number" value={height} onChange={e => setHeight(+e.target.value)} className={inputCls} min={36} max={250} step={1} /></div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Your BMR (Mifflin-St Jeor)</p>
            <p className="text-5xl font-bold text-blue-400">{result.mifflin.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">calories/day at rest</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Mifflin-St Jeor</p><p className="text-lg font-semibold text-blue-400">{result.mifflin}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Harris-Benedict</p><p className="text-lg font-semibold text-zinc-100">{result.harris}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Katch-McArdle</p><p className="text-lg font-semibold text-zinc-100">{result.katch}</p></div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Daily Calories by Activity Level</p>
            <div className="space-y-1">
              {result.activities.map(a => (
                <div key={a.label} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{a.label}</span>
                  <span className="text-zinc-100 font-semibold">{Math.round(result.mifflin * a.factor).toLocaleString()} cal</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
