"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [weight, setWeight] = useState(225);
  const [reps, setReps] = useState(5);
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");

  const result = useMemo(() => {
    if (weight <= 0 || reps <= 0) return null;

    // Epley formula
    const epley = reps === 1 ? weight : weight * (1 + reps / 30);
    // Brzycki formula
    const brzycki = reps === 1 ? weight : weight * (36 / (37 - reps));
    // Lombardi formula
    const lombardi = weight * Math.pow(reps, 0.1);
    // Mayhew formula
    const mayhew = (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps));

    const avg = (epley + brzycki + lombardi + mayhew) / 4;

    const formulas = [
      { name: "Epley", value: Math.round(epley) },
      { name: "Brzycki", value: Math.round(brzycki) },
      { name: "Lombardi", value: Math.round(lombardi) },
      { name: "Mayhew", value: Math.round(mayhew) },
    ];

    // Percentage chart
    const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60];
    const repRanges = ["1", "2-3", "3-4", "5-6", "7-8", "9-10", "11-12", "13-15", "16-20"];
    const chart = percentages.map((pct, i) => ({
      pct,
      weight: Math.round(avg * pct / 100),
      reps: repRanges[i],
    }));

    return { avg: Math.round(avg), formulas, chart };
  }, [weight, reps, unit]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="One Rep Max (1RM) Calculator"
      description="Calculate your estimated one rep max from any weight and rep count. Uses four proven formulas."
      slug="one-rep-max-calculator"
      category="Health"
      keywords={["1rm calculator", "one rep max calculator", "max bench press calculator", "1 rep max calculator", "weightlifting calculator"]}
      faqs={[
        { question: "What is a 1RM?", answer: "Your one-rep max (1RM) is the maximum weight you can lift for a single repetition with proper form. It's used to set training percentages and track strength progress." },
        { question: "Which 1RM formula is most accurate?", answer: "Brzycki and Epley are the most commonly used and tend to be accurate for 1-10 reps. All formulas become less accurate above 10 reps. For best accuracy, test with a weight you can lift for 3-5 reps." },
        { question: "How do I use my 1RM for training?", answer: "Common training zones: Strength: 80-90% for 3-5 reps. Hypertrophy: 65-80% for 8-12 reps. Endurance: 50-65% for 15-20 reps. Power: 50-70% for 3-6 explosive reps." },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "Protein Calculator", href: "/tools/protein-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["lbs", "kg"] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === u ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{u === "lbs" ? "Pounds" : "Kilograms"}</button>
            ))}
          </div>
          <div><label className={labelCls}>Weight Lifted ({unit})</label><input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className={inputCls} min={1} max={1500} /></div>
          <div><label className={labelCls}>Reps Performed</label><input type="number" value={reps} onChange={e => setReps(+e.target.value)} className={inputCls} min={1} max={30} /></div>

          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(r => (
              <button key={r} onClick={() => setReps(r)} className={`px-3 py-1.5 rounded text-sm transition-colors ${reps === r ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{r} rep{r > 1 ? "s" : ""}</button>
            ))}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Estimated 1RM</p>
              <p className="text-5xl font-bold text-blue-400">{result.avg} {unit}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {result.formulas.map(f => (
                <div key={f.name} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">{f.name}</p>
                  <p className="text-lg font-semibold text-zinc-100">{f.value} {unit}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Training Percentage Chart</p>
              <div className="space-y-1">
                {result.chart.map(row => (
                  <div key={row.pct} className={`flex justify-between text-sm px-2 py-1 rounded ${row.pct === 100 ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{row.pct}%</span>
                    <span className="text-zinc-100 font-semibold">{row.weight} {unit}</span>
                    <span>{row.reps} reps</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
