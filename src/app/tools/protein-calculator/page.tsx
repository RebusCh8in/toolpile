"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [weight, setWeight] = useState(170);
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [goal, setGoal] = useState<"maintain" | "lose" | "build">("maintain");
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "active" | "athlete">("moderate");

  const result = useMemo(() => {
    const weightKg = unit === "lbs" ? weight * 0.453592 : weight;

    // Grams per kg based on goal
    const ranges: Record<string, [number, number]> = {
      maintain: [0.8, 1.0],
      lose: [1.2, 1.6],
      build: [1.6, 2.2],
    };
    const activityBoost: Record<string, number> = { sedentary: 0, light: 0.05, moderate: 0.1, active: 0.15, athlete: 0.2 };

    const [low, high] = ranges[goal];
    const boost = activityBoost[activity];
    const minG = Math.round(weightKg * (low + boost));
    const maxG = Math.round(weightKg * (high + boost));
    const recommended = Math.round((minG + maxG) / 2);
    const calories = recommended * 4;

    const meals = [3, 4, 5, 6];
    const perMeal = meals.map(m => ({ meals: m, grams: Math.round(recommended / m) }));

    return { minG, maxG, recommended, calories, perMeal, weightKg };
  }, [weight, unit, goal, activity]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const sources = [
    ["Chicken Breast (4 oz)", 31],
    ["Eggs (2 large)", 12],
    ["Greek Yogurt (1 cup)", 20],
    ["Salmon (4 oz)", 25],
    ["Whey Protein (1 scoop)", 25],
    ["Tofu (1/2 block)", 20],
    ["Lentils (1 cup cooked)", 18],
    ["Ground Beef 90% (4 oz)", 22],
  ];

  return (
    <ToolLayout
      title="Protein Calculator"
      description="Calculate your daily protein needs based on weight, fitness goal, and activity level."
      slug="protein-calculator"
      category="Health"
      keywords={["protein calculator", "how much protein do I need", "daily protein intake calculator", "protein per day calculator"]}
      faqs={[
        { question: "How much protein do I need per day?", answer: "General health: 0.8g/kg body weight. Weight loss: 1.2-1.6g/kg (preserves muscle). Muscle building: 1.6-2.2g/kg. Athletes may need up to 2.4g/kg during intense training." },
        { question: "Can I eat too much protein?", answer: "For healthy adults, up to 2.2g/kg is safe long-term. Higher intakes show no benefit for most people. Those with kidney disease should consult a doctor. Excess protein is converted to energy or stored as fat." },
        { question: "When should I eat protein?", answer: "Spread protein across 3-5 meals for best results. Post-workout protein (within 2 hours) supports recovery. 20-40g per meal is optimal for muscle protein synthesis." },
      ]}
      relatedTools={[
        { name: "Macro Calculator", href: "/tools/macro-calculator" },
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
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
            <label className={labelCls}>Goal</label>
            <div className="flex gap-2">
              {([["maintain", "Maintain"], ["lose", "Lose Fat"], ["build", "Build Muscle"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setGoal(val)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${goal === val ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Activity Level</label>
            <select value={activity} onChange={e => setActivity(e.target.value as typeof activity)} className={inputCls}>
              <option value="sedentary">Sedentary (desk job)</option>
              <option value="light">Light (1-2 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (daily exercise)</option>
              <option value="athlete">Athlete (intense training)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Daily Protein</p>
            <p className="text-5xl font-bold text-blue-400">{result.recommended}g</p>
            <p className="text-sm text-zinc-500 mt-1">{result.minG}g - {result.maxG}g range ({result.calories} cal)</p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Per Meal Distribution</p>
            <div className="space-y-1">
              {result.perMeal.map(p => (
                <div key={p.meals} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{p.meals} meals/day</span>
                  <span className="text-zinc-100 font-semibold">{p.grams}g per meal</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Protein Sources Reference</p>
            <div className="space-y-1">
              {sources.map(([name, grams]) => (
                <div key={name as string} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{name}</span>
                  <span className="text-zinc-100">{grams}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
