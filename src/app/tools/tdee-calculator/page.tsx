"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number) { return Math.round(n).toLocaleString(); }

const activities = [
  { label: "Sedentary", desc: "Office job, little exercise", factor: 1.2 },
  { label: "Lightly Active", desc: "Light exercise 1-3 days/week", factor: 1.375 },
  { label: "Moderately Active", desc: "Moderate exercise 3-5 days/week", factor: 1.55 },
  { label: "Very Active", desc: "Hard exercise 6-7 days/week", factor: 1.725 },
  { label: "Extremely Active", desc: "Athlete / physical labor + exercise", factor: 1.9 },
];

const formulas = ["Mifflin-St Jeor", "Harris-Benedict", "Katch-McArdle"] as const;

export default function Page() {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(28);
  const [weight, setWeight] = useState(175);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(11);
  const [kg, setKg] = useState(79);
  const [cm, setCm] = useState(180);
  const [activity, setActivity] = useState(2);
  const [bodyFat, setBodyFat] = useState("");
  const [formula, setFormula] = useState<typeof formulas[number]>("Mifflin-St Jeor");

  const result = useMemo(() => {
    let wKg: number, hCm: number;
    if (unit === "imperial") {
      wKg = weight * 0.453592;
      hCm = (feet * 12 + inches) * 2.54;
    } else {
      wKg = kg;
      hCm = cm;
    }

    let bmr: number;
    if (formula === "Mifflin-St Jeor") {
      bmr = sex === "male"
        ? 10 * wKg + 6.25 * hCm - 5 * age + 5
        : 10 * wKg + 6.25 * hCm - 5 * age - 161;
    } else if (formula === "Harris-Benedict") {
      bmr = sex === "male"
        ? 88.362 + 13.397 * wKg + 4.799 * hCm - 5.677 * age
        : 447.593 + 9.247 * wKg + 3.098 * hCm - 4.330 * age;
    } else {
      // Katch-McArdle (needs body fat)
      const bf = bodyFat !== "" ? +bodyFat : 20;
      const lbm = wKg * (1 - bf / 100);
      bmr = 370 + 21.6 * lbm;
    }

    const tdee = bmr * activities[activity].factor;

    // Macro splits
    const moderate = { protein: tdee * 0.3 / 4, carbs: tdee * 0.4 / 4, fat: tdee * 0.3 / 9 };
    const lowCarb = { protein: tdee * 0.4 / 4, carbs: tdee * 0.2 / 4, fat: tdee * 0.4 / 9 };
    const highCarb = { protein: tdee * 0.25 / 4, carbs: tdee * 0.55 / 4, fat: tdee * 0.2 / 9 };

    return { bmr, tdee, moderate, lowCarb, highCarb };
  }, [unit, sex, age, weight, feet, inches, kg, cm, activity, bodyFat, formula]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="TDEE Calculator"
      description="Calculate your Total Daily Energy Expenditure (TDEE) using multiple formulas. See BMR, maintenance calories, and suggested macro splits."
      slug="tdee-calculator"
      category="Health"
      keywords={["tdee calculator", "total daily energy expenditure calculator", "tdee", "maintenance calories calculator", "how many calories do I burn"]}
      faqs={[
        { question: "What is TDEE?", answer: "Total Daily Energy Expenditure (TDEE) is the total number of calories you burn per day, including your basal metabolic rate (BMR) plus all physical activity. Eating at your TDEE maintains your current weight." },
        { question: "Which formula is most accurate?", answer: "Mifflin-St Jeor is considered the most accurate for most people. Katch-McArdle is better if you know your body fat percentage, as it accounts for lean mass. Harris-Benedict is the oldest and tends to slightly overestimate." },
        { question: "How do I use TDEE for weight loss?", answer: "Subtract 250-500 calories from your TDEE for steady weight loss of 0.5-1 lb per week. A 500-calorie daily deficit equals about 3,500 calories per week, which is roughly 1 pound of fat." },
        { question: "Why does activity level matter so much?", answer: "Activity level can change your TDEE by 40-60%. A sedentary person with a 1,700 BMR has a TDEE of ~2,040, while a very active person with the same BMR has a TDEE of ~2,930. Be honest about your activity level for accurate results." },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
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
          <div><label className={labelCls}>Age</label><input type="number" value={age} onChange={e => setAge(+e.target.value)} className={inputCls} min={15} max={100} /></div>
          {unit === "imperial" ? (
            <>
              <div><label className={labelCls}>Weight (lbs)</label><input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className={inputCls} min={50} max={1000} /></div>
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
            <label className={labelCls}>Formula</label>
            <select value={formula} onChange={e => setFormula(e.target.value as typeof formulas[number])} className={inputCls}>
              {formulas.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          {formula === "Katch-McArdle" && (
            <div><label className={labelCls}>Body Fat % (required for Katch-McArdle)</label><input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder="e.g. 20" className={inputCls} min={3} max={60} /></div>
          )}
          <div>
            <label className={labelCls}>Activity Level</label>
            <div className="space-y-2">
              {activities.map((al, i) => (
                <button key={i} onClick={() => setActivity(i)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activity === i ? "bg-blue-600/20 border border-blue-500/30 text-blue-300" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  <span className="font-medium">{al.label}</span> <span className="text-xs text-zinc-500">— {al.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Your TDEE</p>
            <p className="text-5xl font-bold text-blue-400">{fmt(result.tdee)}</p>
            <p className="text-sm text-zinc-500 mt-1">calories/day</p>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500">BMR ({formula})</p>
            <p className="text-lg font-semibold text-zinc-100">{fmt(result.bmr)} cal/day</p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">Goal-Based Calories</div>
            <div className="divide-y divide-zinc-800 text-sm">
              <div className="flex justify-between px-4 py-2"><span className="text-zinc-400">Lose 1 lb/week</span><span className="text-green-400">{fmt(result.tdee - 500)}</span></div>
              <div className="flex justify-between px-4 py-2"><span className="text-zinc-400">Lose 0.5 lb/week</span><span className="text-green-400">{fmt(result.tdee - 250)}</span></div>
              <div className="flex justify-between px-4 py-2 bg-blue-600/10"><span className="text-blue-300 font-medium">Maintain</span><span className="text-blue-300 font-medium">{fmt(result.tdee)}</span></div>
              <div className="flex justify-between px-4 py-2"><span className="text-zinc-400">Gain 0.5 lb/week</span><span className="text-yellow-400">{fmt(result.tdee + 250)}</span></div>
              <div className="flex justify-between px-4 py-2"><span className="text-zinc-400">Gain 1 lb/week</span><span className="text-yellow-400">{fmt(result.tdee + 500)}</span></div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">Suggested Macros (at TDEE)</div>
            <div className="divide-y divide-zinc-800 text-sm">
              {[
                { label: "Moderate (30/40/30)", ...result.moderate },
                { label: "Low Carb (40/20/40)", ...result.lowCarb },
                { label: "High Carb (25/55/20)", ...result.highCarb },
              ].map(m => (
                <div key={m.label} className="px-4 py-2 flex justify-between">
                  <span className="text-zinc-400">{m.label}</span>
                  <span className="text-zinc-300 text-xs">P: {fmt(m.protein)}g · C: {fmt(m.carbs)}g · F: {fmt(m.fat)}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
