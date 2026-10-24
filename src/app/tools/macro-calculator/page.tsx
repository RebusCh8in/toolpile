"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number) { return Math.round(n).toLocaleString(); }

const goals = [
  { label: "Lose Weight", offset: -500, desc: "500 cal deficit" },
  { label: "Slow Loss", offset: -250, desc: "250 cal deficit" },
  { label: "Maintain", offset: 0, desc: "No change" },
  { label: "Slow Gain", offset: 250, desc: "250 cal surplus" },
  { label: "Build Muscle", offset: 500, desc: "500 cal surplus" },
];

const splits = [
  { label: "Balanced", p: 0.30, c: 0.40, f: 0.30, desc: "30P / 40C / 30F" },
  { label: "Low Carb", p: 0.40, c: 0.20, f: 0.40, desc: "40P / 20C / 40F" },
  { label: "High Protein", p: 0.40, c: 0.35, f: 0.25, desc: "40P / 35C / 25F" },
  { label: "High Carb", p: 0.25, c: 0.55, f: 0.20, desc: "25P / 55C / 20F" },
  { label: "Keto", p: 0.30, c: 0.05, f: 0.65, desc: "30P / 5C / 65F" },
];

export default function Page() {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(28);
  const [weight, setWeight] = useState(175);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(10);
  const [kg, setKg] = useState(79);
  const [cm, setCm] = useState(178);
  const [activityFactor, setActivityFactor] = useState(1.55);
  const [goalIdx, setGoalIdx] = useState(0);
  const [splitIdx, setSplitIdx] = useState(0);

  const result = useMemo(() => {
    let wKg: number, hCm: number;
    if (unit === "imperial") {
      wKg = weight * 0.453592;
      hCm = (feet * 12 + inches) * 2.54;
    } else { wKg = kg; hCm = cm; }

    const bmr = sex === "male"
      ? 10 * wKg + 6.25 * hCm - 5 * age + 5
      : 10 * wKg + 6.25 * hCm - 5 * age - 161;
    const tdee = bmr * activityFactor;
    const target = tdee + goals[goalIdx].offset;
    const split = splits[splitIdx];

    const protein = (target * split.p) / 4;
    const carbs = (target * split.c) / 4;
    const fat = (target * split.f) / 9;
    const proteinPerKg = protein / wKg;
    const proteinPerLb = protein / (wKg * 2.20462);

    return { tdee, target, protein, carbs, fat, proteinPerKg, proteinPerLb, split };
  }, [unit, sex, age, weight, feet, inches, kg, cm, activityFactor, goalIdx, splitIdx]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Macro Calculator"
      description="Calculate your daily protein, carb, and fat targets based on your TDEE and fitness goals. Multiple diet splits available."
      slug="macro-calculator"
      category="Health"
      keywords={["macro calculator", "macronutrient calculator", "macro diet calculator", "iifym calculator", "protein calculator"]}
      faqs={[
        { question: "What are macros?", answer: "Macronutrients (macros) are the three main nutrients that provide calories: protein (4 cal/g), carbohydrates (4 cal/g), and fat (9 cal/g). Tracking macros helps you control body composition, not just total calories." },
        { question: "How much protein do I need?", answer: "For muscle building: 0.7-1.0g per pound of body weight. For maintenance: 0.5-0.7g per pound. For weight loss: 0.8-1.2g per pound (higher protein preserves muscle during a deficit)." },
        { question: "Which macro split should I choose?", answer: "Balanced (30/40/30) works for most people. High protein (40/35/25) is best for muscle building. Low carb (40/20/40) works if you feel better on fewer carbs. Keto (30/5/65) is very low carb for those adapted to ketosis." },
        { question: "Do I need to hit exact macro numbers?", answer: "No. Aim for ±5g on protein (most important), and be flexible with carbs and fat. Hitting your calorie target matters most, followed by protein. Carbs and fat can flex based on preference." },
      ]}
      relatedTools={[
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setUnit("imperial")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Imperial</button>
            <button onClick={() => setUnit("metric")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === "metric" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Metric</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSex("male")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${sex === "male" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Male</button>
            <button onClick={() => setSex("female")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${sex === "female" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Female</button>
          </div>
          <div><label className={labelCls}>Age</label><input type="number" value={age} onChange={e => setAge(+e.target.value)} className={inputCls} min={15} max={100} /></div>
          {unit === "imperial" ? (
            <>
              <div><label className={labelCls}>Weight (lbs)</label><input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className={inputCls} min={50} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Feet</label><input type="number" value={feet} onChange={e => setFeet(+e.target.value)} className={inputCls} min={3} max={8} /></div>
                <div><label className={labelCls}>Inches</label><input type="number" value={inches} onChange={e => setInches(+e.target.value)} className={inputCls} min={0} max={11} /></div>
              </div>
            </>
          ) : (
            <>
              <div><label className={labelCls}>Weight (kg)</label><input type="number" value={kg} onChange={e => setKg(+e.target.value)} className={inputCls} min={20} /></div>
              <div><label className={labelCls}>Height (cm)</label><input type="number" value={cm} onChange={e => setCm(+e.target.value)} className={inputCls} min={100} /></div>
            </>
          )}
          <div>
            <label className={labelCls}>Activity Level</label>
            <select value={activityFactor} onChange={e => setActivityFactor(+e.target.value)} className={inputCls}>
              <option value={1.2}>Sedentary (office job)</option>
              <option value={1.375}>Lightly Active (1-3 days/week)</option>
              <option value={1.55}>Moderately Active (3-5 days/week)</option>
              <option value={1.725}>Very Active (6-7 days/week)</option>
              <option value={1.9}>Extremely Active (athlete)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Goal</label>
            <div className="grid grid-cols-5 gap-1">
              {goals.map((g, i) => (
                <button key={i} onClick={() => setGoalIdx(i)} className={`py-2 rounded-lg text-xs font-medium transition-colors ${goalIdx === i ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{g.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Macro Split</label>
            <div className="space-y-1.5">
              {splits.map((s, i) => (
                <button key={i} onClick={() => setSplitIdx(i)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${splitIdx === i ? "bg-blue-600/20 border border-blue-500/30 text-blue-300" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  <span className="font-medium">{s.label}</span> <span className="text-xs text-zinc-500">— {s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Daily Calories</p>
            <p className="text-4xl font-bold text-blue-400">{fmt(result.target)}</p>
            <p className="text-xs text-zinc-500 mt-1">TDEE: {fmt(result.tdee)} · {goals[goalIdx].desc}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-red-300 mb-1">Protein</p>
              <p className="text-2xl font-bold text-red-400">{fmt(result.protein)}g</p>
              <p className="text-xs text-zinc-500">{Math.round(result.split.p * 100)}% · {fmt(result.protein * 4)} cal</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-yellow-300 mb-1">Carbs</p>
              <p className="text-2xl font-bold text-yellow-400">{fmt(result.carbs)}g</p>
              <p className="text-xs text-zinc-500">{Math.round(result.split.c * 100)}% · {fmt(result.carbs * 4)} cal</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-green-300 mb-1">Fat</p>
              <p className="text-2xl font-bold text-green-400">{fmt(result.fat)}g</p>
              <p className="text-xs text-zinc-500">{Math.round(result.split.f * 100)}% · {fmt(result.fat * 9)} cal</p>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Calorie Split</p>
            <div className="flex rounded-full overflow-hidden h-4">
              <div className="bg-red-500" style={{ width: `${result.split.p * 100}%` }} />
              <div className="bg-yellow-500" style={{ width: `${result.split.c * 100}%` }} />
              <div className="bg-green-500" style={{ width: `${result.split.f * 100}%` }} />
            </div>
            <div className="flex gap-3 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Protein</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Carbs</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Fat</span>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-400">
            <p>Protein per kg: <span className="text-zinc-200 font-medium">{result.proteinPerKg.toFixed(1)}g/kg</span></p>
            <p>Protein per lb: <span className="text-zinc-200 font-medium">{result.proteinPerLb.toFixed(1)}g/lb</span></p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
