"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number) { return Math.round(n).toLocaleString(); }

const activityLevels = [
  { label: "Sedentary", desc: "Little or no exercise, desk job", factor: 1.2 },
  { label: "Light", desc: "Light exercise 1-3 days/week", factor: 1.375 },
  { label: "Moderate", desc: "Moderate exercise 3-5 days/week", factor: 1.55 },
  { label: "Active", desc: "Hard exercise 6-7 days/week", factor: 1.725 },
  { label: "Very Active", desc: "Intense exercise + physical job", factor: 1.9 },
];

export default function Page() {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(170);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(10);
  const [kg, setKg] = useState(77);
  const [cm, setCm] = useState(178);
  const [activity, setActivity] = useState(2);

  const result = useMemo(() => {
    let weightKg: number, heightCm: number;
    if (unit === "imperial") {
      weightKg = weight * 0.453592;
      heightCm = (feet * 12 + inches) * 2.54;
    } else {
      weightKg = kg;
      heightCm = cm;
    }

    // Mifflin-St Jeor equation
    const bmr = sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const tdee = bmr * activityLevels[activity].factor;
    const lose05 = tdee - 250;
    const lose1 = tdee - 500;
    const lose2 = tdee - 1000;
    const gain05 = tdee + 250;
    const gain1 = tdee + 500;

    return { bmr, tdee, lose05, lose1, lose2, gain05, gain1 };
  }, [unit, sex, age, weight, feet, inches, kg, cm, activity]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Calorie Calculator"
      description="Calculate your daily calorie needs based on age, sex, height, weight, and activity level. Uses the Mifflin-St Jeor equation."
      slug="calorie-calculator"
      category="Health"
      keywords={["calorie calculator", "daily calorie calculator", "calorie needs calculator", "how many calories do I need", "TDEE calculator"]}
      faqs={[
        { question: "How are daily calories calculated?", answer: "This calculator uses the Mifflin-St Jeor equation to find your Basal Metabolic Rate (BMR), then multiplies by an activity factor to estimate Total Daily Energy Expenditure (TDEE). The Mifflin-St Jeor equation is considered the most accurate formula for most people." },
        { question: "How many calories should I eat to lose weight?", answer: "A deficit of 500 calories per day results in roughly 1 pound of weight loss per week. A 250-calorie deficit loses about 0.5 lb/week. Don't go below 1,200 (women) or 1,500 (men) calories without medical supervision." },
        { question: "What is BMR vs TDEE?", answer: "BMR (Basal Metabolic Rate) is the calories your body burns at complete rest — just to keep you alive. TDEE (Total Daily Energy Expenditure) is BMR plus the calories burned through activity. TDEE is what you actually need to eat to maintain weight." },
        { question: "Are calorie calculators accurate?", answer: "Calorie calculators provide estimates, not exact numbers. Individual metabolism varies by ±10-15%. Use the result as a starting point, track your weight for 2-3 weeks, then adjust up or down based on actual results." },
      ]}
      relatedTools={[
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
        { name: "Macro Calculator", href: "/tools/macro-calculator" },
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
          <div>
            <label className={labelCls}>Age</label>
            <input type="number" value={age} onChange={e => setAge(+e.target.value)} className={inputCls} min={15} max={100} />
          </div>
          {unit === "imperial" ? (
            <>
              <div>
                <label className={labelCls}>Weight (lbs)</label>
                <input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className={inputCls} min={50} max={1000} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Feet</label><input type="number" value={feet} onChange={e => setFeet(+e.target.value)} className={inputCls} min={3} max={8} /></div>
                <div><label className={labelCls}>Inches</label><input type="number" value={inches} onChange={e => setInches(+e.target.value)} className={inputCls} min={0} max={11} /></div>
              </div>
            </>
          ) : (
            <>
              <div><label className={labelCls}>Weight (kg)</label><input type="number" value={kg} onChange={e => setKg(+e.target.value)} className={inputCls} min={20} max={500} /></div>
              <div><label className={labelCls}>Height (cm)</label><input type="number" value={cm} onChange={e => setCm(+e.target.value)} className={inputCls} min={100} max={250} /></div>
            </>
          )}
          <div>
            <label className={labelCls}>Activity Level</label>
            <div className="space-y-2">
              {activityLevels.map((al, i) => (
                <button key={i} onClick={() => setActivity(i)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activity === i ? "bg-blue-600/20 border border-blue-500/30 text-blue-300" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  <span className="font-medium">{al.label}</span>
                  <span className="text-xs text-zinc-500 ml-2">{al.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Daily Calories to Maintain</p>
            <p className="text-5xl font-bold text-blue-400">{fmt(result.tdee)}</p>
            <p className="text-xs text-zinc-500 mt-1">BMR: {fmt(result.bmr)} cal/day</p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">Weight Loss</div>
            <div className="divide-y divide-zinc-800">
              <div className="flex justify-between px-4 py-2 text-sm"><span className="text-zinc-400">Lose 0.5 lb/week</span><span className="text-green-400 font-medium">{fmt(result.lose05)} cal/day</span></div>
              <div className="flex justify-between px-4 py-2 text-sm"><span className="text-zinc-400">Lose 1 lb/week</span><span className="text-green-400 font-medium">{fmt(result.lose1)} cal/day</span></div>
              <div className="flex justify-between px-4 py-2 text-sm"><span className="text-zinc-400">Lose 2 lbs/week</span><span className={`font-medium ${result.lose2 < 1200 ? "text-red-400" : "text-green-400"}`}>{fmt(result.lose2)} cal/day</span></div>
              {result.lose2 < 1200 && <p className="px-4 py-1 text-xs text-red-400">⚠ Below recommended minimum</p>}
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">Weight Gain</div>
            <div className="divide-y divide-zinc-800">
              <div className="flex justify-between px-4 py-2 text-sm"><span className="text-zinc-400">Gain 0.5 lb/week</span><span className="text-yellow-400 font-medium">{fmt(result.gain05)} cal/day</span></div>
              <div className="flex justify-between px-4 py-2 text-sm"><span className="text-zinc-400">Gain 1 lb/week</span><span className="text-yellow-400 font-medium">{fmt(result.gain1)} cal/day</span></div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
