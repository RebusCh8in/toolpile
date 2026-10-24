"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [age, setAge] = useState(30);
  const [restingHR, setRestingHR] = useState(65);
  const [method, setMethod] = useState<"percent" | "karvonen">("karvonen");

  const result = useMemo(() => {
    const maxHR = 220 - age;
    const hrReserve = maxHR - restingHR;

    const zones = [
      { zone: 1, name: "Recovery", lowPct: 0.50, highPct: 0.60, desc: "Warm-up, cool-down, active recovery" },
      { zone: 2, name: "Fat Burn", lowPct: 0.60, highPct: 0.70, desc: "Easy endurance, fat oxidation peak" },
      { zone: 3, name: "Aerobic", lowPct: 0.70, highPct: 0.80, desc: "Improve cardiovascular fitness" },
      { zone: 4, name: "Threshold", lowPct: 0.80, highPct: 0.90, desc: "Increase speed, lactate threshold" },
      { zone: 5, name: "VO2 Max", lowPct: 0.90, highPct: 1.00, desc: "Max effort, sprints, intervals" },
    ];

    return zones.map(z => {
      let low: number, high: number;
      if (method === "karvonen") {
        low = Math.round(hrReserve * z.lowPct + restingHR);
        high = Math.round(hrReserve * z.highPct + restingHR);
      } else {
        low = Math.round(maxHR * z.lowPct);
        high = Math.round(maxHR * z.highPct);
      }
      return { ...z, low, high, maxHR };
    });
  }, [age, restingHR, method]);

  const maxHR = 220 - age;
  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const zoneColors = ["text-blue-400", "text-green-400", "text-yellow-400", "text-orange-400", "text-red-400"];
  const zoneBgs = ["bg-blue-600/20", "bg-green-600/20", "bg-yellow-600/20", "bg-orange-600/20", "bg-red-600/20"];

  return (
    <ToolLayout
      title="Heart Rate Zone Calculator"
      description="Calculate your five heart rate training zones. Uses Karvonen or percentage-of-max methods."
      slug="heart-rate-zone-calculator"
      category="Health"
      keywords={["heart rate zone calculator", "training zone calculator", "heart rate zones", "target heart rate calculator", "cardio zone calculator"]}
      faqs={[
        { question: "What are heart rate zones?", answer: "Heart rate zones divide your effort into 5 levels based on percentage of max heart rate. Each zone trains different energy systems — from easy recovery (Zone 1) to max effort sprints (Zone 5)." },
        { question: "What is the Karvonen method?", answer: "Karvonen uses your heart rate reserve (max HR - resting HR) for more personalized zones. It accounts for your fitness level through resting heart rate, making it more accurate than simple percentage-of-max." },
        { question: "How do I find my resting heart rate?", answer: "Measure your pulse first thing in the morning before getting out of bed, for 3 days. Count beats for 60 seconds. Average the results. Typical resting HR: 60-80 bpm (athletes: 40-60)." },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "Pace Calculator", href: "/tools/pace-calculator" },
        { name: "BMR Calculator", href: "/tools/bmr-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Age</label><input type="number" value={age} onChange={e => setAge(+e.target.value)} className={inputCls} min={10} max={100} /></div>
          <div><label className={labelCls}>Resting Heart Rate (bpm)</label><input type="number" value={restingHR} onChange={e => setRestingHR(+e.target.value)} className={inputCls} min={30} max={120} /></div>
          <div>
            <label className={labelCls}>Method</label>
            <div className="flex gap-2">
              {([["karvonen", "Karvonen (Recommended)"], ["percent", "% of Max HR"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setMethod(val)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${method === val ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Max Heart Rate</span>
              <span className="text-zinc-100 font-semibold">{maxHR} bpm</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-zinc-400">Heart Rate Reserve</span>
              <span className="text-zinc-100 font-semibold">{maxHR - restingHR} bpm</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {result.map((z, i) => (
            <div key={z.zone} className={`${zoneBgs[i]} border border-zinc-700 rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${zoneColors[i]}`}>Z{z.zone}</span>
                  <span className="text-sm font-semibold text-zinc-100">{z.name}</span>
                </div>
                <span className="text-lg font-bold text-zinc-100">{z.low} - {z.high} bpm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{z.desc}</span>
                <span className="text-zinc-500">{Math.round(z.lowPct * 100)}-{Math.round(z.highPct * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
