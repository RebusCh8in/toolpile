"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [weight, setWeight] = useState(170);
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "active" | "athlete">("moderate");
  const [climate, setClimate] = useState<"temperate" | "hot" | "cold">("temperate");

  const result = useMemo(() => {
    const weightKg = unit === "lbs" ? weight * 0.453592 : weight;

    // Base: 35ml per kg
    let baseML = weightKg * 35;

    // Activity adjustment
    const activityMult: Record<string, number> = { sedentary: 0.9, light: 1.0, moderate: 1.1, active: 1.25, athlete: 1.4 };
    baseML *= activityMult[activity];

    // Climate adjustment
    if (climate === "hot") baseML *= 1.2;
    else if (climate === "cold") baseML *= 0.95;

    const liters = baseML / 1000;
    const ounces = baseML / 29.5735;
    const cups = ounces / 8;
    const glasses = Math.ceil(ounces / 8);

    return { ml: Math.round(baseML), liters: liters.toFixed(1), ounces: Math.round(ounces), cups: cups.toFixed(1), glasses };
  }, [weight, unit, activity, climate]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Water Intake Calculator"
      description="Calculate how much water you should drink daily based on weight, activity level, and climate."
      slug="water-intake-calculator"
      category="Health"
      keywords={["water intake calculator", "how much water should I drink", "daily water intake calculator", "hydration calculator"]}
      faqs={[
        { question: "How much water should I drink daily?", answer: "A general guideline is about 35ml per kg of body weight (about half your body weight in ounces). Active people and those in hot climates need more. The '8 glasses a day' rule is a rough estimate." },
        { question: "Does coffee count toward water intake?", answer: "Yes, mostly. While caffeine is a mild diuretic, the water in coffee and tea still contributes to hydration. However, pure water is still the best source." },
        { question: "How do I know if I'm hydrated?", answer: "Check your urine color — pale yellow indicates good hydration. Dark yellow means drink more. Other signs of dehydration: thirst, dry mouth, headaches, and fatigue." },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["lbs", "kg"] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === u ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{u === "lbs" ? "Pounds" : "Kilograms"}</button>
            ))}
          </div>
          <div><label className={labelCls}>Weight ({unit})</label><input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className={inputCls} min={50} max={500} /></div>
          <div>
            <label className={labelCls}>Activity Level</label>
            <select value={activity} onChange={e => setActivity(e.target.value as typeof activity)} className={inputCls}>
              <option value="sedentary">Sedentary (desk job, no exercise)</option>
              <option value="light">Light (1-2 days exercise/week)</option>
              <option value="moderate">Moderate (3-5 days exercise/week)</option>
              <option value="active">Active (daily exercise)</option>
              <option value="athlete">Athlete (intense training)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Climate</label>
            <div className="flex gap-2">
              {([["temperate", "Temperate"], ["hot", "Hot/Humid"], ["cold", "Cold"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setClimate(val)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${climate === val ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Daily Water Intake</p>
            <p className="text-4xl font-bold text-blue-400">{result.liters} L</p>
            <p className="text-sm text-zinc-500 mt-1">{result.ounces} oz / {result.glasses} glasses</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Milliliters</p><p className="text-lg font-semibold text-zinc-100">{result.ml.toLocaleString()} mL</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Fluid Ounces</p><p className="text-lg font-semibold text-zinc-100">{result.ounces} oz</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Cups (8 oz)</p><p className="text-lg font-semibold text-zinc-100">{result.cups} cups</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Bottles (16.9 oz)</p><p className="text-lg font-semibold text-zinc-100">{Math.ceil(result.ounces / 16.9)} bottles</p></div>
          </div>

          {/* Schedule suggestion */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Suggested Schedule</p>
            <div className="space-y-1 text-sm">
              {[
                ["Wake up", Math.round(result.ounces * 0.15)],
                ["Mid-morning", Math.round(result.ounces * 0.15)],
                ["Lunch", Math.round(result.ounces * 0.15)],
                ["Afternoon", Math.round(result.ounces * 0.2)],
                ["Pre-dinner", Math.round(result.ounces * 0.15)],
                ["Evening", Math.round(result.ounces * 0.2)],
              ].map(([time, oz]) => (
                <div key={time as string} className="flex justify-between">
                  <span className="text-zinc-400">{time}</span>
                  <span className="text-zinc-100">{oz} oz ({Math.round((oz as number) / 8 * 10) / 10} cups)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
